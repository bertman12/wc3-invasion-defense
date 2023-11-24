import { ABILITIES, ITEMS } from "src/shared/enums";
import { applyForce } from "src/shared/physics";
import { allCapturableStructures } from "src/towns";
import { unitGetsNearThisUnit } from "src/utils/abilities";
import { getRelativeAngleToUnit } from "src/utils/misc";
import { adjustGold } from "src/utils/players";
import { Effect, Item, Timer, Trigger, Unit } from "w3ts";

export function init_itemAbilities() {
    trig_forceBoots();
    handOfMidas();
    addBlinkToBoots();
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
        const i = Item.fromEvent();

        print(i?.name);

        if (i?.name.toLowerCase().includes("recipe")) {
            print("item has recipe in its name!");
            //check if the player has all the required items.
            //if not then refund gold
        }
    });
    //
}
