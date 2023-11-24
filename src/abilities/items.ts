import { ABILITIES, ITEMS } from "src/shared/enums";
import { applyForce } from "src/shared/physics";
import { allCapturableStructures } from "src/towns";
import { unitGetsNearThisUnit } from "src/utils/abilities";
import { getRelativeAngleToUnit, notifyPlayer, useTempEffect } from "src/utils/misc";
import { adjustGold } from "src/utils/players";
import { Effect, Item, Timer, Trigger, Unit } from "w3ts";

export function init_itemAbilities() {
    trig_forceBoots();
    handOfMidas();
    addBlinkToBoots();
    itemRecipes();
}

function trig_forceBoots() {
    const trig = Trigger.create();

    trig.registerAnyUnitEvent(EVENT_PLAYER_UNIT_SPELL_CAST);

    trig.addCondition(() => {
        const castedSpellId = GetSpellAbilityId();

        if (castedSpellId === ABILITIES.forceBoots) {
            return true;
        }

        return false;
    });

    trig.addAction(() => {
        const caster = Unit.fromEvent();

        if (!caster) {
            return;
        }

        caster.setTimeScale(2);
        SetUnitAnimationByIndex(caster.handle, 3);

        const { destroy } = unitGetsNearThisUnit(
            caster,
            200,
            (u) => {
                //to prevent moving things like rampart canon tower which is a flying unit
                if (allCapturableStructures.has(u.typeId) || u.isUnitType(UNIT_TYPE_STRUCTURE)) {
                    return;
                }

                applyForce(getRelativeAngleToUnit(caster, u), u, 600, { obeyPathing: true });

                if (u.isAlly(caster.owner)) {
                    return;
                }
            },
            {
                uniqueUnitsOnly: true,
            },
        );

        applyForce(caster.facing, caster, 1800, {
            obeyPathing: true,
            onEnd() {
                caster.setTimeScale(1);
                SetUnitAnimationByIndex(caster.handle, 0);
                destroy();
            },
        });
    });
}

function addBlinkToBoots() {
    const t = Trigger.create();

    t.registerAnyUnitEvent(EVENT_PLAYER_UNIT_PICKUP_ITEM);

    t.addAction(() => {
        const boughtItem = Item.fromHandle(GetSoldItem());

        const u = Unit.fromEvent();

        if (!u) {
            return;
        }

        // print("buying unit: ", u.name);

        //Check if the player has blink dagger equipped
        const blinkDagger = GetItemOfTypeFromUnitBJ(u.handle, ITEMS.blinkDagger);
        const bootsOfSpeed = GetItemOfTypeFromUnitBJ(u.handle, ITEMS.bootsOfSpeed);
        if (blinkDagger && bootsOfSpeed) {
            //add blink to boots
            Item.fromHandle(blinkDagger)?.getAbility(FourCC("Albk"));
        }

        // print("blinkDagger", blinkDagger);
        // print("bootsOfSpeed", bootsOfSpeed);

        // print("Player picked up item");
    });
}

function handOfMidas() {
    const t = Trigger.create();

    t.registerAnyUnitEvent(EVENT_PLAYER_UNIT_DAMAGED);

    t.addCondition(() => {
        const victim = Unit.fromHandle(GetAttackedUnitBJ());
        const damageSource = Unit.fromHandle(GetEventDamageSource());

        if (damageSource && victim && !damageSource.owner.isPlayerAlly(victim.owner)) {
            const i = GetItemOfTypeFromUnitBJ(damageSource.handle, ITEMS.handOfMidas);
            const itemProcChance = 14;

            if (i && math.random(0, 100) <= itemProcChance) {
                return true;
            }
        }

        return false;
    });

    t.addAction(() => {
        const victim = Unit.fromHandle(GetAttackedUnitBJ());
        const damageSource = Unit.fromHandle(GetEventDamageSource());

        if (victim && damageSource) {
            const e = Effect.createAttachment("Abilities\\Spells\\Other\\Transmute\\PileofGold.mdl", victim, "origin");
            const t = Timer.create();

            adjustGold(damageSource.owner, 10);

            t.start(1.5, false, () => {
                e?.destroy();
                t.destroy();
            });
        }
    });
}

// Player should pick up recipes when needed. if they are missing items then the recipe cost is refunded
function itemRecipes() {
    //takes a set of items
    //unit or unit clicks
    const t = Trigger.create();

    t.registerAnyUnitEvent(EVENT_PLAYER_UNIT_PICKUP_ITEM);
    t.addAction(() => {
        const recipeItem = Item.fromEvent();
        const unit = Unit.fromHandle(GetTriggerUnit());

        if (!unit || !recipeItem) {
            return;
        }

        //for every item they have, if any has the word recipe, then we check to see if they have the items needed to satisfy the recipe
        for (let x = 0; x < 6; x++) {
            const currItem = unit?.getItemInSlot(x);
            if (currItem?.name.toLowerCase().includes("recipe")) {
                checkItemRecipeRequirements(unit, currItem);
            }
        }
    });
}

function checkItemRecipeRequirements(unit: Unit, recipeItem: Item) {
    if (recipeItem.name.toLowerCase().includes("recipe")) {
        let requiredItems: ItemRecipeRequirement[] | null = null;
        let itemToCreateId = null;

        for (const [key, value] of itemRecipesMap.entries()) {
            if (key.recipeId === recipeItem.typeId) {
                requiredItems = value;
                itemToCreateId = key.itemId;
            }
        }

        if (!requiredItems) {
            print("Missing required items data for the recipe ", recipeItem.name);
            return;
        }

        /**
         * unique list of item types and their quantity and charges that we found on the unit
         */
        const matchingItems: ItemRecipeRequirement[] = [];

        //Loop through the units item slots
        for (let x = 0; x < 6; x++) {
            const currItem = unit?.getItemInSlot(x);

            //Check that the current item matches at least one of the item types in the requirement list
            if (currItem && requiredItems.some((req) => req.itemTypeId === currItem.typeId)) {
                const alreadyStoredItemIndex = matchingItems.findIndex((itemReq) => itemReq.itemTypeId === currItem.typeId);

                //If we already came across this item in the unit inventory then increment the quantity
                if (alreadyStoredItemIndex && matchingItems[alreadyStoredItemIndex]) {
                    matchingItems[alreadyStoredItemIndex].quantity++;
                }
                //otherwise it is our first match with this item type, so add it to our array of matching items
                else {
                    matchingItems.push({ itemTypeId: currItem.typeId, quantity: 1, charges: 0 });
                }
            }
        }

        //Check that every item required is found in the units inventory satisfies the quantity requirement for the recipe
        const satisfiesRecipe =
            requiredItems.every((reqItemData) => {
                const matching = matchingItems?.find((matchingItemData) => matchingItemData.itemTypeId === reqItemData.itemTypeId);

                if (matching) {
                    return reqItemData.quantity >= matching.quantity;
                }

                return false;
            }) && matchingItems.length > 0;

        // const satisfiesRecipe =
        //     matchingItems.every((foundItemData) => {
        //         const requiredItem = requiredItems?.find((reqItemData) => reqItemData.itemTypeId === foundItemData.itemTypeId);
        //         if (requiredItem) {
        //             print(`${requiredItem.itemTypeId}`)
        //             return foundItemData.quantity >= requiredItem.quantity;
        //         }

        //         return false;
        //     }) && matchingItems.length > 0;

        if (!itemToCreateId) {
            print("Missing the item type id of the item to create for this recipe: ", recipeItem.name);
        }

        if (satisfiesRecipe && itemToCreateId) {
            //add the item

            requiredItems.forEach((req: ItemRecipeRequirement) => {
                for (let x = 0; x < req.quantity; x++) {
                    for (let x = 0; x < 6; x++) {
                        const currItem = unit?.getItemInSlot(x);
                        if (currItem?.typeId === req.itemTypeId) {
                            print(`Destroyed item: ${currItem?.name}`);
                            currItem?.destroy();
                        }
                    }
                }
            });

            recipeItem.destroy();

            unit.addItemById(itemToCreateId);
            useTempEffect(Effect.create("Abilities\\Spells\\Other\\Monsoon\\MonsoonBoltTarget.mdl", unit.x, unit.y));
        }

        if (!satisfiesRecipe) {
            //refund the gold
            notifyPlayer(`Missing recipe requirements for: ${recipeItem.name}.`);
        }

        //use if or rf to store item gold cost in the world editor
    }
}

interface ItemRecipeRequirement {
    itemTypeId: ITEMS;
    quantity: number;
    charges: number;
}

interface RecipeItem {
    recipeId: number;
    itemId: number;
}

const itemRecipesMap = new Map<RecipeItem, ItemRecipeRequirement[]>([
    //
    [
        { recipeId: ITEMS.recipe_blinkTreads, itemId: ITEMS.blinkTreads },
        [
            { itemTypeId: ITEMS.bootsOfSpeed, quantity: 1, charges: 0 },
            { itemTypeId: ITEMS.blinkDagger, quantity: 2, charges: 0 },
        ],
    ],
    //
]);
