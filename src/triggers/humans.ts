import { ownershipGrantingUnits } from "src/shared/constants";
import { ABILITIES, ITEMS, MinimapIconPath, PlayerIndices, UNITS } from "src/shared/enums";
import { applyForce } from "src/shared/physics";
import { playerStates } from "src/shared/playerState";
import { RoundManager } from "src/shared/round-manager";
import { allCapturableStructures } from "src/towns";
import { onUnitAttacked, unitGetsNearThisUnit, useTempDummyUnit } from "src/utils/abilities";
import { getRelativeAngleToUnit, notifyPlayer, tColor, useEffects, useTempEffect } from "src/utils/misc";
import { adjustGold, adjustLumber, forEachAlliedPlayer, forEachUnitTypeOfPlayer, isPlayingUser } from "src/utils/players";
import { delayedTimer } from "src/utils/timer";
import { Effect, Group, Item, MapPlayer, Timer, Trigger, Unit } from "w3ts";
import { OrderId, Players } from "w3ts/globals";

export function init_humanSpells() {
    purchaseStructure();
    trig_battleCharge();
    generalHired();
    trig_disbandUnit();
    thunderousStrikes();
    proc_summonLavaSpawn();
    howlOfTerror();
    timeDistortion();
    RoundManager.onDayStart(removeCaltrops);
}

function makeAlliance() {
    const t = Trigger.create();

    // t.registerAnyUnitEvent(EVENT_PLAYER_UNIT_SPELL_CAST);

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
                const u = Unit.create(triggeringPlayer, UNITS.flyingMachine, caster.x, caster.y);
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
            });
        }

        return false;
    });
}

function trig_disbandUnit() {
    const trig = Trigger.create();

    trig.registerAnyUnitEvent(EVENT_PLAYER_UNIT_SPELL_FINISH);

    trig.addCondition(() => {
        const castedSpellId = GetSpellAbilityId();
        const caster = Unit.fromEvent();

        if (castedSpellId === ABILITIES.disbandUnit && caster) {
            caster.destroy();
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

            if (isPlayingUser(sellingUnit.owner) || sellingUnit.owner === soldUnit.owner) {
                adjustGold(soldUnit.owner, GetUnitGoldCost(soldUnit.typeId));
                adjustLumber(soldUnit.owner, GetUnitWoodCost(soldUnit.typeId));
                notifyPlayer(`Cannot purchase ${sellingUnit.name} - Player refunded.`);
                return;
            }

            const soldUnitOwner = soldUnit.getOwner();

            if (soldUnitOwner) {
                //crashes the game lol - unnecessary to do anyways
                // sellingUnit.removeAbility(ABILITIES.shopShareAlly);
                sellingUnit.setOwner(soldUnitOwner, true);
                if (sellingUnit.typeId === UNITS.citadelOfTheNorthernKnights) {
                    print("You purchased the Duchy of The Northern Knights.");
                    if (playerStates.get(soldUnitOwner.id)?.playerHero) {
                        playerStates.get(soldUnitOwner.id)?.playerHero?.addItemById(ITEMS.crownOfTheNorthernKnights_15);
                    } else {
                        notifyPlayer("Crown of The Northern Knights was placed next to the Citadel of The Northern Knights");
                        Item.create(ITEMS.crownOfTheNorthernKnights_15, sellingUnit.x, sellingUnit.y);
                        //add to player stash -- later
                    }
                }
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
        const { addEffect, destroyAllEffects, getEffects } = useEffects();

        const { cleanupUnitGetsNearThisUnit: destroy } = unitGetsNearThisUnit(
            caster,
            200,
            (u) => {
                //to prevent moving things like rampart canon tower which is a flying unit
                if (allCapturableStructures.has(u.typeId) || u.isUnitType(UNIT_TYPE_STRUCTURE) || u.typeId === UNITS.goblinLandMine) {
                    return;
                }

                applyForce(getRelativeAngleToUnit(caster, u), u, 900, { obeyPathing: true });

                if (u.isAlly(caster.owner)) {
                    return;
                }

                const thunderEffect = Effect.create("Abilities\\Spells\\Human\\Thunderclap\\ThunderClapCaster.mdl", u.x, u.y);
                caster.damageTarget(u.handle, 150, true, false, ATTACK_TYPE_CHAOS, DAMAGE_TYPE_NORMAL, WEAPON_TYPE_WHOKNOWS);

                if (thunderEffect) {
                    thunderEffect.scale = 0.5;
                }

                addEffect(thunderEffect);
            },
            {
                uniqueUnitsOnly: true,
            },
        );

        applyForce(caster.facing, caster, 900, {
            sustainedForceDuration: 1,
            obeyPathing: true,
            onEnd() {
                caster.setTimeScale(1);
                SetUnitAnimationByIndex(caster.handle, 0);
                destroy();
                destroyAllEffects();
            },
        });
    });
}

// caster?.hasBuffs

function removeCaltrops() {
    forEachAlliedPlayer((p) => {
        forEachUnitTypeOfPlayer(UNITS.caltrops, p, (u) => u.destroy());
    });
}

//the spell can only happen once every attackcd/4
function thunderousStrikes() {
    const t = Trigger.create();
    const unitsOnCooldown = new Set<Unit>();

    t.registerAnyUnitEvent(EVENT_PLAYER_UNIT_ATTACKED);

    t.addAction(() => {
        const attacker = Unit.fromHandle(GetAttacker());
        const victim = Unit.fromHandle(GetAttackedUnitBJ());
        const level = attacker?.getAbilityLevel(FourCC("A01Z"));

        if (level && level >= 1 && attacker && victim && Math.ceil(Math.random() * 100) <= 20) {
            if (unitsOnCooldown.has(attacker)) {
                return;
            }

            unitsOnCooldown.add(attacker);

            const t = Timer.create();

            t.start(attacker.getAttackCooldown(0) / 3, false, () => {
                unitsOnCooldown.delete(attacker);
                t.destroy();
            });

            useTempEffect(Effect.create("Abilities\\Spells\\Human\\Thunderclap\\ThunderClapCaster.mdl", victim.x, victim.y));

            const affectedUnits = Group.create();

            if (affectedUnits) {
                affectedUnits.enumUnitsInRange(attacker.x, attacker.y, 400, () => {
                    const unit = Group.getFilterUnit();

                    if (unit && !unit.isAlly(attacker.owner)) {
                        attacker.damageTarget(unit.handle, 100 * level, false, false, ATTACK_TYPE_HERO, DAMAGE_TYPE_DIVINE, WEAPON_TYPE_WHOKNOWS);
                    }

                    return true;
                });

                affectedUnits?.destroy();
            }
        }
    });
}

function generalHired() {
    const t = Trigger.create();

    t.registerAnyUnitEvent(EVENT_PLAYER_UNIT_SELL);

    t.addAction(() => {
        const soldUnit = Unit.fromHandle(GetSoldUnit());

        if (soldUnit && [UNITS.infantryGeneral, UNITS.archerGeneral].includes(soldUnit?.typeId)) {
            notifyPlayer(`An ${soldUnit.name} has arrived at the capital.`);
            const generalMinimapIcon = CreateMinimapIconOnUnit(soldUnit.handle, 255, 255, 255, MinimapIconPath.hero, FOG_OF_WAR_FOGGED);

            const subTrig = Trigger.create();
            subTrig.registerAnyUnitEvent(EVENT_PLAYER_UNIT_DEATH);

            subTrig.addAction(() => {
                const dyingUnit = Unit.fromHandle(GetDyingUnit());
                if (dyingUnit === soldUnit && generalMinimapIcon) {
                    DestroyMinimapIcon(generalMinimapIcon);
                    subTrig.destroy();
                }
            });
        }
    });
}

function proc_summonLavaSpawn() {
    onUnitAttacked(
        (attacker, victim) => {
            const abilityLevel = attacker.getAbilityLevel(ABILITIES.firelord_armyOfFlame);

            if (abilityLevel >= 1) {
                useTempDummyUnit(
                    (dummy) => {
                        const abilityLevel = attacker.getAbilityLevel(ABILITIES.firelord_armyOfFlame);
                        dummy.setAbilityLevel(ABILITIES.firelord_armyOfFlame, abilityLevel);
                        dummy.issueImmediateOrder(OrderId.Lavamonster);
                    },
                    ABILITIES.firelord_armyOfFlame,
                    2,
                    attacker.owner,
                    attacker.x,
                    attacker.y,
                    attacker.facing,
                    {
                        abilityLevel: abilityLevel,
                    },
                );
            }
        },
        { attackerCooldown: true, procChance: 8 },
    );
}

function howlOfTerror() {
    const trig = Trigger.create();

    trig.registerAnyUnitEvent(EVENT_PLAYER_UNIT_SPELL_CAST);

    trig.addCondition(() => {
        const castedSpellId = GetSpellAbilityId();

        if (castedSpellId === ABILITIES.pitLord_howlOfTerror) {
            return true;
        }

        return false;
    });

    trig.addAction(() => {
        const caster = Unit.fromEvent();

        if (!caster) {
            return;
        }
        delayedTimer(0.85, () => {
            const { cleanupUnitGetsNearThisUnit } = unitGetsNearThisUnit(
                caster,
                750,
                (u) => {
                    //to prevent moving things like rampart canon tower which is a flying unit
                    if (allCapturableStructures.has(u.typeId) || u.isUnitType(UNIT_TYPE_STRUCTURE) || u.typeId === UNITS.goblinLandMine) {
                        return;
                    }

                    if (u.isAlly(caster.owner)) {
                        return;
                    }

                    const thunderEffect = Effect.create("Abilities\\Spells\\Human\\Thunderclap\\ThunderClapCaster.mdl", u.x, u.y);

                    if (thunderEffect) {
                        thunderEffect.scale = 0.25;
                    }

                    useTempEffect(thunderEffect);
                    applyForce(getRelativeAngleToUnit(caster, u), u, 1200, { obeyPathing: true });

                    const abilityLevel = caster.getAbilityLevel(ABILITIES.pitLord_howlOfTerror);

                    caster.damageTarget(u.handle, 100 * abilityLevel, true, false, ATTACK_TYPE_CHAOS, DAMAGE_TYPE_NORMAL, WEAPON_TYPE_WHOKNOWS);
                },
                {
                    uniqueUnitsOnly: true,
                },
            );

            cleanupUnitGetsNearThisUnit(1);
        });
    });
}

/**
 * applies slows enemies attack speed and move speed in the ring by 10% every second for 6 seconds then freezes them in time for 6 seconds
 */
function timeDistortion() {
    const t = Trigger.create();
    t.registerAnyUnitEvent(EVENT_PLAYER_UNIT_SPELL_CAST);

    t.addAction(() => {
        const castedSpellId = GetSpellAbilityId();
        const caster = Unit.fromEvent();

        if (castedSpellId === ABILITIES.timeDistortion && caster) {
            const abilityLevel = caster.getAbilityLevel(ABILITIES.timeDistortion);

            const { addEffect, destroyAllEffects } = useEffects();
            const timers: Timer[] = [];
            let unitsAffected: Unit[] = [];
            const timeDilationEffect = Effect.create("Abilities\\Spells\\Other\\Drain\\ManaDrainTarget.mdl", caster.x, caster.y);
            if (!timeDilationEffect) {
                print("Did not cast spell, time dilation effect not present.");
                return;
            }
            timeDilationEffect.setScaleMatrix(25, 25, 1);
            addEffect(timeDilationEffect);
            //Creating the visual ring around the hero
            for (let x = 0; x < 8; x++) {
                const initialAngle = 45 * x;
                const myEffect = Effect.create("Abilities\\Weapons\\DemonHunterMissile\\DemonHunterMissile.mdl", caster.x + 600 * Cos(Deg2Rad(45)), caster.y + 600 * Sin(Deg2Rad(45)));
                addEffect(myEffect);
                if (!myEffect) {
                    return;
                }
                //30degs / second

                let currentDegree = initialAngle;
                let timeElapsed = 0;
                const effectTimer = Timer.create();
                timers.push(effectTimer);
                effectTimer.start(0.01, true, () => {
                    timeDilationEffect.x = caster.x;
                    timeDilationEffect.y = caster.y;
                    myEffect.x = caster.x + 600 * Cos(Deg2Rad(currentDegree));
                    myEffect.y = caster.y + 600 * Sin(Deg2Rad(currentDegree));
                    timeElapsed++;
                    currentDegree -= 60 / 100;
                });
            }

            const { cleanupUnitGetsNearThisUnit } = unitGetsNearThisUnit(
                caster,
                600,
                (u) => {
                    if (!u.isAlly(caster.owner)) {
                        const iceEffect = Effect.createAttachment("Abilities\\Spells\\Human\\slow\\slowtarget.mdl", u, "origin");
                        addEffect(iceEffect);

                        u.moveSpeed = u.defaultMoveSpeed / 2;
                        u.setAttackCooldown(u.getAttackCooldown(0) * 2, 0);
                        unitsAffected.push(u);
                    }
                },
                { uniqueUnitsOnly: false },
            );

            delayedTimer(6, () => {
                cleanupUnitGetsNearThisUnit();
                destroyAllEffects();
                timers.forEach((t) => t.destroy());
                unitsAffected.forEach((u) => {
                    if (!u.isAlly(caster.owner)) {
                        u.moveSpeed = u.defaultMoveSpeed;
                        const tempU = Unit.create(Players[PlayerIndices.NeutralPassive], u.typeId, 0, 0);
                        if (tempU) {
                            u.setAttackCooldown(tempU.getAttackCooldown(0), 0);
                            tempU.destroy();
                        }
                    }
                });

                unitsAffected.forEach((u) => {
                    const isInRange = u.inRangeOfUnit(caster, 600);
                    if (isInRange && !u.isAlly(caster.owner)) {
                        caster.damageTarget(u.handle, 100 * abilityLevel, true, false, ATTACK_TYPE_CHAOS, DAMAGE_TYPE_NORMAL, WEAPON_TYPE_WHOKNOWS);
                        addEffect(Effect.create("Abilities\\Spells\\Undead\\FreezingBreath\\FreezingBreathTargetArt.mdl", u.x, u.y));
                        u.paused = true;
                    }
                });

                delayedTimer(3 + abilityLevel, () => {
                    unitsAffected.forEach((u) => {
                        u.paused = false;
                    });

                    destroyAllEffects();
                    unitsAffected = [];
                    //check if the unit is still in range of the hero then freeze if they are
                });
            });
        }
    });
}

/**
 * mountain king throws his hammer to a target area (pocket factory), which then casts thunderclap every 2 seconds
 */
function stormHammer() {}
