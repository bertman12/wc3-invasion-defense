import { adjustGold, adjustLumber } from "src/players";
import { ABILITIES, CUSTOM_UNITS } from "src/shared/enums";
import { applyForce } from "src/shared/physics";
import { notifyPlayer, tColor } from "src/utils/misc";
import { isPlayingUser } from "src/utils/players";
import { MapPlayer, Trigger, Unit } from "w3ts";
import { Players } from "w3ts/globals";

export function init_humanSpells() {
    makeAlliance();
    trig_hireFlyingMachine();
    trig_heroicLeap();
    purchaseStructure();
    trig_battleCharge();
}

function makeAlliance() {
    const t = Trigger.create();

    t.registerAnyUnitEvent(EVENT_PLAYER_UNIT_SPELL_CAST);

    t.addCondition(() => {
        const castedSpellId = GetSpellAbilityId();
        const caster = Unit.fromEvent();
        const target = Unit.fromHandle(GetSpellTargetUnit());

        if (castedSpellId === ABILITIES.makeAlliance && caster && target) {
            print(`[${tColor("Alliance", "goldenrod")}] - An alliance has been made with ${target.owner.name}`);
            const targetPlayer = target.owner.handle;
            const redPlayerForce = GetForceOfPlayer(Players[0].handle);

            if (redPlayerForce) {
                ForForce(redPlayerForce, () => {
                    const player = GetEnumPlayer();

                    if (player) {
                        //Player -> Target
                        SetPlayerAllianceBJ(player, ALLIANCE_SHARED_VISION_FORCED, true, targetPlayer);
                        SetPlayerAllianceBJ(player, ALLIANCE_PASSIVE, true, targetPlayer);
                        SetPlayerAllianceStateAllyBJ(player, targetPlayer, true);

                        //Target -> Player
                        SetPlayerAllianceBJ(targetPlayer, ALLIANCE_SHARED_VISION_FORCED, true, player);
                        SetPlayerAllianceBJ(targetPlayer, ALLIANCE_PASSIVE, true, player);
                        SetPlayerAllianceStateAllyBJ(targetPlayer, player, true);
                    }
                });
            }

            SetPlayerName(target.owner.handle, target.owner.name.replace("Neutral", "Ally"));

            caster.kill();

            return true;
        }

        return false;
    });
}

function trig_hireFlyingMachine() {
    const t = Trigger.create();

    t.registerAnyUnitEvent(EVENT_PLAYER_UNIT_SPELL_CAST);
    t.addCondition(() => {
        const castedSpellId = GetSpellAbilityId();
        const caster = Unit.fromEvent();
        const triggeringPlayer = MapPlayer.fromHandle(GetTriggerPlayer());

        const units: Unit[] = [];

        if (castedSpellId === ABILITIES.hireFlyingMachinePatrol && caster && triggeringPlayer) {
            while (units.length < 6) {
                const u = Unit.create(triggeringPlayer, CUSTOM_UNITS.flyingMachine, caster.x, caster.y);
                if (u) {
                    units.push(u);
                }
            }
        }

        return false;
    });
}

function trig_heroicLeap() {
    const trig = Trigger.create();

    trig.registerAnyUnitEvent(EVENT_PLAYER_UNIT_SPELL_CAST);
    trig.addCondition(() => {
        const castedSpellId = GetSpellAbilityId();
        const caster = Unit.fromEvent();
        if (castedSpellId === ABILITIES.heroicLeap && caster) {
            caster.paused = true;
            caster.setTimeScale(0);
            caster.setVertexColor(50, 50, 50, 255);
            caster.setScale(2, 0, 0);
            caster.setDiceNumber(0, 0);
            applyForce(caster.facing, caster, 600, {
                sustainedForceDuration: 0,
                whileActive(currentSpeed, timeElapsed) {
                    print("My while active function is running!");
                },
            });
        }

        return false;
    });
}

/**
 * Handles all events where there is a unit you can buy that grants ownership over a building
 */
function purchaseStructure() {
    const t = Trigger.create();

    t.registerAnyUnitEvent(EVENT_PLAYER_UNIT_SELL);

    t.addAction(() => {
        const sellingUnit = Unit.fromHandle(GetSellingUnit());
        const soldUnit = Unit.fromHandle(GetSoldUnit());

        if (!sellingUnit || !soldUnit) {
            return;
        }

        //First we check to see if the the unit sold is one that may grant ownership. then we must also check that the seller is the unit type the sold unit can grant ownership for. then we proceed
        if (ownershipGrantingUnits.has(sellingUnit.typeId) && ownershipGrantingUnits.get(sellingUnit.typeId) === soldUnit.typeId) {
            soldUnit.destroy();
            AddUnitToStockBJ(CUSTOM_UNITS.gargoyle, sellingUnit.handle, 3, 3);
            if (isPlayingUser(sellingUnit.owner) || sellingUnit.owner === soldUnit.owner) {
                adjustGold(soldUnit.owner, GetUnitGoldCost(soldUnit.typeId));
                adjustLumber(soldUnit.owner, GetUnitWoodCost(soldUnit.typeId));
                notifyPlayer(`Cannot purchase ${sellingUnit.name} - Player refunded.`);
                return;
            }

            const soldUnitOwner = soldUnit.getOwner();

            if (soldUnitOwner) {
                sellingUnit.setOwner(soldUnitOwner, true);
            }
        }
    });
}

function trig_battleCharge() {
    const trig = Trigger.create();

    trig.registerAnyUnitEvent(EVENT_PLAYER_UNIT_SPELL_CAST);

    trig.addCondition(() => {
        const castedSpellId = GetSpellAbilityId();

        if (castedSpellId === ABILITIES.battleCharge) {
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
                print("Unit was found in 300 range of the Demigod!");
                print(u.name);
                u.setVertexColor(255, 0, 0, 255);
                applyForce(getRelativeAngleToUnit(caster, u), u, 500);
            },
            {
                uniqueUnitsOnly: true,
                onDestroy: (units) => {
                    // units.forEach((u) => u.kill());
                },
            },
        );

        applyForce(caster.facing, caster, 600, {
            sustainedForceDuration: 1.5,
            onEnd(currentSpeed, timeElapsed) {
                caster.setTimeScale(1);
                SetUnitAnimationByIndex(caster.handle, 0);
                destroy();
            },
        });
    });
}

function unitGetsNearThisUnit(unit: Unit, range: number, cb: (u: Unit) => void, config?: { uniqueUnitsOnly: boolean; condition?: boolexpr | (() => boolean); onDestroy: (unitsEffected: Unit[]) => void }) {
    const t = Trigger.create();
    /**
     * A unique set of the units effected
     */
    const effectedUnitPool: Unit[] = [];

    t.registerUnitInRage(unit.handle, range, config?.condition ?? (() => true));
    t.addAction(() => {
        const u = Unit.fromEvent();

        if (!u) {
            return;
        }

        if (!effectedUnitPool.includes(u)) {
            effectedUnitPool.push(u);
        }

        if (config?.uniqueUnitsOnly && !effectedUnitPool.includes(u)) {
            cb(u);
        } else {
            cb(u);
        }
    });

    return {
        destroy: () => {
            config?.onDestroy(effectedUnitPool);
            t.destroy();
        },
    };
}

function getRelativeAngleToUnit(unit: Unit, relativeUnit: Unit) {
    const locA = GetUnitLoc(unit.handle);
    const locB = GetUnitLoc(relativeUnit.handle);

    return AngleBetweenPoints(locA, locB);
}

/**
 * map unit sold to the unit the will transfer ownership
 *
 * then we only need one function to handle this behavior as long as it do so according to the map
 */
const ownershipGrantingUnits = new Map<number, number>([[CUSTOM_UNITS.farmTown, CUSTOM_UNITS.nullUnit]]);

// caster?.hasBuffs
