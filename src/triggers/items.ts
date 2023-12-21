import { ABILITIES, ITEMS, UNITS } from "src/shared/enums";
import { applyForce } from "src/shared/physics";
import { allCapturableStructures } from "src/towns";
import { onUnitAttacked, unitGetsNearThisUnit, useTempDummyUnit } from "src/utils/abilities";
import { unitHasItem } from "src/utils/item";
import { getRelativeAngleToUnit, notifyPlayer, useTempEffect } from "src/utils/misc";
import { adjustGold } from "src/utils/players";
import { delayedTimer } from "src/utils/timer";
import { Effect, Item, Timer, Trigger, Unit } from "w3ts";
import { OrderId } from "w3ts/globals";

export function init_itemAbilities() {
    trig_forceBoots();
    // handOfMidas();
    itemRecipes();
    chainLightningProcItem();
    demonsEyeTrinketProcItem();
    gemOfTheTimeMage();
    nerfedMidas();
    item_yserasGraceTranquility();
    demonBladeProcItem();
    playerPicksUpDemonBlade();
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

        const { cleanupUnitGetsNearThisUnit: destroy } = unitGetsNearThisUnit(
            caster,
            200,
            (u) => {
                //to prevent moving things like rampart canon tower which is a flying unit
                if (allCapturableStructures.has(u.typeId) || u.isUnitType(UNIT_TYPE_STRUCTURE) || u.typeId === UNITS.goblinLandMine) {
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

function handOfMidas() {
    const t = Trigger.create();

    t.registerAnyUnitEvent(EVENT_PLAYER_UNIT_DAMAGED);

    t.addCondition(() => {
        const victim = Unit.fromHandle(GetAttackedUnitBJ());
        const damageSource = Unit.fromHandle(GetEventDamageSource());

        if (damageSource && victim && !damageSource.owner.isPlayerAlly(victim.owner)) {
            const handOfMidas = GetItemOfTypeFromUnitBJ(damageSource.handle, ITEMS.handOfMidas);
            const ghoulishMaskOfMidas = GetItemOfTypeFromUnitBJ(damageSource.handle, ITEMS.ghoulishMaskOfMidas);
            let itemProcChance = -1;

            if (ghoulishMaskOfMidas) {
                itemProcChance = 25;
            } else if (handOfMidas) {
                itemProcChance = 10;
            }

            if ((handOfMidas || ghoulishMaskOfMidas) && math.random(0, 100) <= itemProcChance) {
                const e = Effect.createAttachment("Abilities\\Spells\\Other\\Transmute\\PileofGold.mdl", victim, "origin");
                const t = Timer.create();

                adjustGold(damageSource.owner, ghoulishMaskOfMidas ? 25 : 10);

                if (ghoulishMaskOfMidas) {
                    useTempEffect(Effect.create("Abilities\\Spells\\Undead\\RaiseSkeletonWarrior\\RaiseSkeleton.mdl", damageSource.x, damageSource.y));
                    damageSource.life -= 35;
                }

                t.start(1.5, false, () => {
                    e?.destroy();
                    t.destroy();
                });
            }
        }

        return false;
    });
}

function chainLightningProcItem() {
    onUnitAttacked(
        (attacker, victim) => {
            if (unitHasItem(attacker, ITEMS.alaricsSpearOfThunder)) {
                useTempDummyUnit(
                    (dummy) => {
                        dummy.issueTargetOrder(OrderId.Chainlightning, victim);
                    },
                    // FourCC("A03L"),
                    ABILITIES.proc_greaterChainLightning,
                    3,
                    attacker.owner,
                    attacker.x,
                    attacker.y,
                    attacker.facing,
                );
            }
        },
        { attackerCooldown: true, procChance: 25 },
    );
}

function nerfedMidas() {
    onUnitAttacked(
        (attacker, victim) => {
            if (unitHasItem(attacker, ITEMS.ghoulishMaskOfMidas)) {
                useTempEffect(Effect.createAttachment("Abilities\\Spells\\Other\\Transmute\\PileofGold.mdl", victim, "origin"));
                useTempEffect(Effect.create("Abilities\\Spells\\Undead\\RaiseSkeletonWarrior\\RaiseSkeleton.mdl", attacker.x, attacker.y));
                adjustGold(attacker.owner, 25);
                attacker.life -= 35;
            }
        },
        { attackerCooldown: true, procChance: 25 },
    );
    onUnitAttacked(
        (attacker, victim) => {
            if (unitHasItem(attacker, ITEMS.handOfMidas)) {
                useTempEffect(Effect.createAttachment("Abilities\\Spells\\Other\\Transmute\\PileofGold.mdl", victim, "origin"));
                adjustGold(attacker.owner, 10);
            }
        },
        { attackerCooldown: true, procChance: 10 },
    );
}

function item_yserasGraceTranquility() {
    const t = Trigger.create();

    t.registerAnyUnitEvent(EVENT_PLAYER_UNIT_SPELL_CAST);
    t.addAction(() => {
        const caster = Unit.fromEvent();
        const spellNumberCast = GetSpellAbilityId();
        // print("Spell number cast: ", spellNumberCast);
        if (caster && caster.isHero() && spellNumberCast === ABILITIES.item_tranquility) {
            const timer = Timer.create();
            const protectorsCreated: Unit[] = [];
            useTempDummyUnit(
                (dummy) => {
                    dummy.name = "Servant of Ysera";
                    dummy.issueImmediateOrder(OrderId.Tranquility);
                    timer.start(3, true, () => {
                        useTempEffect(Effect.create("Objects\\Spawnmodels\\NightElf\\EntBirthTarget\\EntBirthTarget.mdl", dummy.x, dummy.y));
                        const protector = Unit.create(caster.owner, UNITS.purifiedProtector, dummy.x, dummy.y);

                        if (protector) {
                            protectorsCreated.push(protector);
                        }
                    });
                },
                ABILITIES.item_tranquility,
                20,
                caster.owner,
                caster.x,
                caster.y,
                caster.facing,
                { modelType: "cenariusGhost" },
            );

            delayedTimer(20, () => {
                timer.pause();
            });

            delayedTimer(40, () => {
                timer.destroy();
                protectorsCreated.forEach((u) => u.kill());
            });
        }
    });
}

/**
 * @todo make it so the cooldown for teh ability isnt permanently reduced.
 *
 * I could also just use a timer to set the ability cooldown back to the original value
 * Reduces spell cooldowns
 */
function gemOfTheTimeMage() {
    // const t = Trigger.create();
    // t.registerAnyUnitEvent(EVENT_PLAYER_UNIT_SPELL_CAST);
    // // t.regist
    // t.addAction(() => {
    //     const caster = Unit.fromEvent();
    //     const spellNumberCast = GetSpellAbilityId();
    //     // print("Spell number cast: ", spellNumberCast);
    //     if (caster && spellNumberCast > 0) {
    //         const spellLevel = caster.getAbilityLevel(spellNumberCast);
    //         // print("Spell level: ", spellLevel);
    //         if (spellLevel > 0) {
    //             const baseCooldown = caster.getAbilityCooldown(spellNumberCast, spellLevel - 1);
    //             caster.setAbilityCooldown(spellNumberCast, spellLevel - 1, baseCooldown * 0.75);
    //             // caster.setAbilityCooldown()
    //         }
    //     }
    // });
}

/**
 * Causes your hero to explode, dealing 10% of their health to all enemies in 600 range/
 */
function bloodGem() {}

function demonsEyeTrinketProcItem() {
    const undeadHeroes = [UNITS.uh_cryptLord, UNITS.uh_deathKnight, UNITS.uh_dreadLord, UNITS.uh_lich];

    onUnitAttacked(
        (attacker, victim) => {
            if (unitHasItem(attacker, ITEMS.demonsEyeTrinket) && !unitHasItem(attacker, ITEMS.demonBlade)) {
                useTempEffect(Effect.createAttachment("Abilities\\Spells\\NightElf\\shadowstrike\\shadowstrike.mdl", attacker, "overhead"), 5);

                useTempDummyUnit(
                    (dummy) => {
                        dummy.issueTargetOrder(OrderId.Unholyfrenzy, attacker);
                    },
                    ABILITIES.proc_unholyFrenzy_demonsEyeTrinket,
                    1,
                    attacker.owner,
                    attacker.x,
                    attacker.y,
                    attacker.facing,
                );

                attacker.setScale(2, 1, 1);
                attacker.setVertexColor(255, 100, 100, 255);
                delayedTimer(5, () => {
                    attacker.setVertexColor(255, 255, 255, 255);
                    if (attacker.typeId === FourCC("Nfir")) {
                        attacker.setScale(1.15, 1, 1);
                    }
                    if (undeadHeroes.includes(attacker.typeId)) {
                        attacker.setScale(2.2, 1, 1);
                        attacker.setVertexColor(255, 100, 100, 255);
                    }
                });
            }
        },
        { attackerCooldown: true, procChance: 10 },
    );
}

function playerPicksUpDemonBlade() {
    const t = Trigger.create();

    t.registerAnyUnitEvent(EVENT_PLAYER_UNIT_PICKUP_ITEM);
    t.addAction(() => {
        const item = Item.fromEvent();
        const unit = Unit.fromHandle(GetTriggerUnit());

        if (!unit || !item) {
            return;
        }

        if (item.typeId === ITEMS.demonBlade) {
            const demonBladeEffect = Effect.createAttachment("Abilities\\Spells\\Other\\Doom\\DoomTarget.mdl", unit, "foot");

            const dropTrigger = Trigger.create();

            dropTrigger.registerAnyUnitEvent(EVENT_PLAYER_UNIT_DROP_ITEM);

            dropTrigger.addAction(() => {
                const dropUnit = Unit.fromHandle(GetTriggerUnit());
                if (dropUnit && dropUnit === unit) {
                    demonBladeEffect?.destroy();
                    dropTrigger.destroy();
                }
            });
        }
    });
}

function demonBladeProcItem() {
    const undeadHeroes = [UNITS.uh_cryptLord, UNITS.uh_deathKnight, UNITS.uh_dreadLord, UNITS.uh_lich];

    onUnitAttacked(
        (attacker, victim) => {
            if (unitHasItem(attacker, ITEMS.demonBlade)) {
                useTempEffect(Effect.createAttachment("Abilities\\Spells\\NightElf\\shadowstrike\\shadowstrike.mdl", attacker, "overhead"), 5);

                useTempDummyUnit(
                    (dummy) => {
                        dummy.issueTargetOrder(OrderId.Unholyfrenzy, attacker);
                    },
                    ABILITIES.proc_unholyFrenzy_demonBlade,
                    1,
                    attacker.owner,
                    attacker.x,
                    attacker.y,
                    attacker.facing,
                );

                attacker.setScale(3, 1, 1);
                attacker.setVertexColor(255, 0, 0, 255);

                delayedTimer(5, () => {
                    attacker.setVertexColor(255, 255, 255, 255);
                    if (attacker.typeId === FourCC("Nfir")) {
                        attacker.setScale(1.15, 1, 1);
                    }
                    if (undeadHeroes.includes(attacker.typeId)) {
                        attacker.setScale(2.2, 1, 1);
                        attacker.setVertexColor(255, 100, 100, 255);
                    }
                });
            }
        },
        { attackerCooldown: true, procChance: 15 },
    );
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
        let requiredItems: RecipeItemRequirement[] | null = null;
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
        const matchingItems: RecipeItemRequirement[] = [];

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
                    return matching.quantity >= reqItemData.quantity;
                }

                return false;
            }) && matchingItems.length > 0;

        if (!itemToCreateId) {
            print("Missing the item type id of the item to create for this recipe: ", recipeItem.name);
        }

        //destroys more items than it needds to
        if (satisfiesRecipe && itemToCreateId) {
            //add the item
            requiredItems.forEach((req: RecipeItemRequirement) => {
                for (let x = 0; x < req.quantity; x++) {
                    for (let x = 0; x < 6; x++) {
                        const currItem = unit?.getItemInSlot(x);
                        if (currItem?.typeId === req.itemTypeId) {
                            currItem?.destroy();
                            break;
                        }
                    }
                }
            });

            recipeItem.destroy();

            unit.addItemById(itemToCreateId);

            useTempEffect(Effect.create("Abilities\\Spells\\Other\\Monsoon\\MonsoonBoltTarget.mdl", unit.x, unit.y));
            const clap = Effect.create("Abilities\\Spells\\Human\\Thunderclap\\ThunderClapCaster.mdl", unit.x, unit.y);
            clap?.setScaleMatrix(0.5, 0.5, 0.5);
            useTempEffect(clap);
        }

        if (!satisfiesRecipe) {
            //refund the gold
            notifyPlayer(`Missing recipe requirements for: ${recipeItem.name}.`);
        }

        //use if or rf to store item gold cost in the world editor
    }
}

interface RecipeItemRequirement {
    itemTypeId: ITEMS;
    quantity: number;
    charges: number;
}

interface RecipeItem {
    recipeId: number;
    itemId: number;
}

//The item cost of a recipe should be the added value of whatever stats +100 gold for freeing up a slot
//50 gold per stat?

//thunder lizard gems and a staff of knowledge

const itemRecipesMap = new Map<RecipeItem, RecipeItemRequirement[]>([
    [
        { recipeId: ITEMS.recipe_blinkTreads, itemId: ITEMS.blinkTreads },
        [
            { itemTypeId: ITEMS.bootsOfSpeed, quantity: 1, charges: 0 }, //
            { itemTypeId: ITEMS.blinkDagger, quantity: 1, charges: 0 }, //
        ],
    ],
    [
        { recipeId: ITEMS.recipe_greaterSobiMask, itemId: ITEMS.greaterSobiMask },
        [
            { itemTypeId: ITEMS.sobiMask, quantity: 2, charges: 0 }, //
        ],
    ],
    [
        { recipeId: ITEMS.recipe_swordMastersBlade, itemId: ITEMS.swordMastersBlade },
        [
            { itemTypeId: ITEMS.windWalkerTreads, quantity: 1, charges: 0 }, //
            { itemTypeId: ITEMS.savageBlade, quantity: 1, charges: 0 }, //
            { itemTypeId: ITEMS.clawsOfAttack_10, quantity: 1, charges: 0 }, //
        ],
    ],
    [
        { recipeId: ITEMS.recipe_staffOfPrimalThunder, itemId: ITEMS.staffOfPrimalThunder },
        [
            { itemTypeId: ITEMS.staffOfKnowledge, quantity: 2, charges: 0 }, //
            { itemTypeId: ITEMS.thunderLizardDiamond, quantity: 2, charges: 0 }, //
        ],
    ],
    [
        { recipeId: ITEMS.recipe_berserkersCleaver, itemId: ITEMS.berserkersCleaver },
        [
            { itemTypeId: ITEMS.helmOfBattleThirst, quantity: 1, charges: 0 }, //
            { itemTypeId: ITEMS.corpseCleaver, quantity: 1, charges: 0 }, //
            { itemTypeId: ITEMS.clawsOfAttack_5, quantity: 1, charges: 0 }, //
        ],
    ],
    [
        { recipeId: ITEMS.recipe_crownOfReanimation_lvl1, itemId: ITEMS.crownOfReanimation_lvl1 },
        [
            { itemTypeId: ITEMS.crownOfKings_5, quantity: 1, charges: 0 }, //
            { itemTypeId: ITEMS.pendantOfEnergy_200, quantity: 1, charges: 0 }, //
        ],
    ],
    [
        { recipeId: ITEMS.recipe_crownOfReanimation_lvl2, itemId: ITEMS.crownOfReanimation_lvl2 },
        [
            { itemTypeId: ITEMS.pendantOfEnergy_200, quantity: 1, charges: 0 }, //
            { itemTypeId: ITEMS.crownOfReanimation_lvl1, quantity: 1, charges: 0 }, //
        ],
    ],
    [
        { recipeId: ITEMS.recipe_crownOfReanimation_lvl3, itemId: ITEMS.crownOfReanimation_lvl3 },
        [
            { itemTypeId: ITEMS.pendantOfEnergy_200, quantity: 1, charges: 0 }, //
            { itemTypeId: ITEMS.crownOfReanimation_lvl2, quantity: 1, charges: 0 }, //
        ],
    ],
    [
        { recipeId: ITEMS.recipe_amuletOfTheSentinel, itemId: ITEMS.amuletOfTheSentinel },
        [
            { itemTypeId: ITEMS.amuletOfSpellShield, quantity: 1, charges: 0 }, //
            { itemTypeId: ITEMS.talismanOfEvasion_15, quantity: 1, charges: 0 }, //
            { itemTypeId: ITEMS.crownOfKings_5, quantity: 1, charges: 0 }, //
            { itemTypeId: ITEMS.ringOfProtection_5, quantity: 1, charges: 0 }, //
            { itemTypeId: ITEMS.staffOfTeleportation, quantity: 1, charges: 0 }, //
        ],
    ],
    [
        { recipeId: ITEMS.recipe_ghoulishMaskOfMidas, itemId: ITEMS.ghoulishMaskOfMidas },
        [
            { itemTypeId: ITEMS.handOfMidas, quantity: 1, charges: 0 }, //
            { itemTypeId: ITEMS.maskOfTheFrenziedGhoul, quantity: 1, charges: 0 }, //
        ],
    ],
    [
        { recipeId: ITEMS.recipe_alaricsSpearOfThunder, itemId: ITEMS.alaricsSpearOfThunder },
        [
            { itemTypeId: ITEMS.assassinsRing, quantity: 2, charges: 0 }, //
            { itemTypeId: ITEMS.clawsOfAttack_20, quantity: 1, charges: 0 }, //
            { itemTypeId: ITEMS.thunderLizardDiamond, quantity: 1, charges: 0 }, //
        ],
    ],
    [
        { recipeId: ITEMS.recipe_demonsEyeTrinket, itemId: ITEMS.demonsEyeTrinket },
        [
            { itemTypeId: ITEMS.crownOfKings_5, quantity: 2, charges: 0 }, //
            { itemTypeId: ITEMS.helmOfBattleThirst, quantity: 1, charges: 0 }, //
        ],
    ],
    [
        { recipeId: ITEMS.recipe_shieldOfTheGuardian, itemId: ITEMS.shieldOfTheGuardian },
        [
            { itemTypeId: ITEMS.ringOfProtection_5, quantity: 1, charges: 0 }, //
            { itemTypeId: ITEMS.ringOfRegeneration_2, quantity: 2, charges: 0 }, //
            { itemTypeId: ITEMS.stalwartShield, quantity: 1, charges: 0 }, //
            { itemTypeId: ITEMS.khadgarsGemOfHealth, quantity: 1, charges: 0 }, //
        ],
    ],
    [
        { recipeId: ITEMS.recipe_bloodRitualPendant, itemId: ITEMS.bloodRitualPendant },
        [
            { itemTypeId: ITEMS.crownOfKings_5, quantity: 1, charges: 0 }, //
            { itemTypeId: ITEMS.staffOfTheArchmage, quantity: 1, charges: 0 }, //
            { itemTypeId: ITEMS.staffOfKnowledge, quantity: 1, charges: 0 }, //
            { itemTypeId: ITEMS.pendantOfEnergy_200, quantity: 1, charges: 0 }, //
            { itemTypeId: ITEMS.greaterSobiMask, quantity: 1, charges: 0 }, //
        ],
    ],
    [
        { recipeId: ITEMS.recipe_yserasGrace, itemId: ITEMS.yserasGrace },
        [
            { itemTypeId: ITEMS.fragmentOfTheEmeraldDream, quantity: 1, charges: 0 }, //
            { itemTypeId: ITEMS.trinity, quantity: 1, charges: 0 }, //
            { itemTypeId: ITEMS.crownOfKings_5, quantity: 1, charges: 0 }, //
        ],
    ],
    [
        { recipeId: ITEMS.recipe_trinity, itemId: ITEMS.trinity },
        [
            { itemTypeId: ITEMS.assassinsRing, quantity: 1, charges: 0 }, //
            { itemTypeId: ITEMS.beltOfGiantStrength, quantity: 1, charges: 0 }, //
            { itemTypeId: ITEMS.staffOfTheArchmage, quantity: 1, charges: 0 }, //
        ],
    ],
    [
        { recipeId: ITEMS.recipe_spikedArmor, itemId: ITEMS.spikedArmor },
        [
            { itemTypeId: ITEMS.beltOfGiantStrength, quantity: 1, charges: 0 }, //
            { itemTypeId: ITEMS.khadgarsGemOfHealth, quantity: 1, charges: 0 }, //
        ],
    ],
    [
        { recipeId: ITEMS.recipe_shieldOfTheCorruptor, itemId: ITEMS.shieldOfTheCorruptor },
        [
            { itemTypeId: ITEMS.shieldOfTheGuardian, quantity: 1, charges: 0 }, //
            { itemTypeId: ITEMS.spikedArmor, quantity: 1, charges: 0 }, //
            { itemTypeId: ITEMS.amuletOfCorruption, quantity: 1, charges: 0 }, //
            { itemTypeId: ITEMS.beltOfGiantStrength, quantity: 1, charges: 0 }, //
        ],
    ],
    [
        { recipeId: ITEMS.recipe_demonBlade, itemId: ITEMS.demonBlade },
        [
            { itemTypeId: ITEMS.swordMastersBlade, quantity: 1, charges: 0 }, //
            { itemTypeId: ITEMS.demonsEyeTrinket, quantity: 1, charges: 0 }, //
            { itemTypeId: ITEMS.clawsOfAttack_20, quantity: 1, charges: 0 }, //
        ],
    ],
]);
