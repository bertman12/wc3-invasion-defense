import { forEachUnitOfPlayer } from "src/utils/players";
import { MapPlayer, Sound, Timer, Trigger, Unit } from "w3ts";
import { OrderId, Players } from "w3ts/globals";
import { buildingOwnerDailyUnitBonusMap, buildingOwnerIncomeBonusMap, dailyProgressStructures, economicConstants, improvedLeviesUnitBonus } from "./shared/constants";
import { ABILITIES, PlayerIndices, TERRAIN_CODE, UNITS, UpgradeCodes, laborerUnitSet } from "./shared/enums";
import { PlayerState, playerStates } from "./shared/playerState";
import { RoundManager } from "./shared/round-manager";
import { notifyPlayer, tColor } from "./utils/misc";
import { adjustFoodCap, adjustGold, adjustLumber, forEachAlliedPlayer, forEachPlayer, forEachUnitOfPlayerWithAbility, forEachUnitTypeOfPlayer, isPlayingUser } from "./utils/players";
import { createUnits } from "./utils/units";

export function setupPlayers() {
    initializePlayerStateInstances();
    trig_playerBuysUnit();
    trig_heroPurchased();
    trig_heroDies();
    trig_checkFarmLaborerPlacement();
    playerLeaves();
    laborerBuilt();
    antiGrief();
    selectionMistake();
    forEachAlliedPlayer((p, index) => {
        //Create Sheep to buy hero
        const u = Unit.create(p, FourCC("nshe"), 18600 + 25 * index, -28965);
        if (u) {
            SetCameraPositionForPlayer(p.handle, u.x, u.y);
        }

        SetPlayerHandicapXP(p.handle, 0.4);
    });
}

function trig_heroDies() {
    const t = Trigger.create();
    t.registerAnyUnitEvent(EVENT_PLAYER_UNIT_DEATH);

    t.addCondition(() => {
        const u = Unit.fromHandle(GetDyingUnit());

        if (u && u.isHero() && u.owner.race !== RACE_UNDEAD) {
            Sound.fromHandle(gg_snd_QuestFailed)?.start();
            const respawnTime = 15 + u.level + RoundManager.currentRound;
            print(`${tColor("!", "goldenrod")} - ${u.owner.name}, your hero will revive in ${respawnTime} seconds.`);
            const timer = Timer.create();

            timer.start(respawnTime, false, () => {
                u.revive(u.owner.startLocationX, u.owner.startLocationY, true);
            });

            return true;
        }

        return false;
    });
}

function trig_playerBuysUnit() {
    const t = Trigger.create();

    t.registerAnyUnitEvent(EVENT_PLAYER_UNIT_SELL);

    t.addAction(() => {
        const u = Unit.fromHandle(GetSoldUnit());
        const seller = Unit.fromHandle(GetSellingUnit());

        if (!u || !seller) {
            return;
        }
        const playerState = playerStates.get(u.owner.id);
        if (seller.typeId === UNITS.unitShop && playerState) {
            u.x = (playerState?.playerHero?.x ?? 0) - 25;
            u.y = (playerState?.playerHero?.y ?? 0) - 25;
            u.issueImmediateOrder(OrderId.Stop);
        }

        //send to hero
        if (u) {
            playerStates.get(u.owner.id)?.sendUnitsToHero([u]);
        }

        // else if (seller.rallyUnit) {
        //     u.issueOrderAt(OrderId.Move, seller.rallyUnit.x, seller.rallyUnit.y);
        // }
        // // send to rally point
        // else if (seller.rallyPoint) {
        //     u.issueOrderAt(OrderId.Move, seller.rallyPoint.x, seller.rallyPoint.y);
        // }
    });
}

function createDailyUnits() {
    forEachAlliedPlayer((p) => {
        // PLAYER_STATE_FOOD_CAP_CEILING

        if (isPlayingUser(p)) {
            forEachUnitOfPlayer(p, (u) => {
                if (buildingOwnerDailyUnitBonusMap.has(u.typeId)) {
                    const unitData = buildingOwnerDailyUnitBonusMap.get(u.typeId);

                    if (!unitData) {
                        return;
                    }

                    const improvedLeviesLevel = GetPlayerTechCount(p?.handle, UpgradeCodes.improvedLevies, true);
                    let unitCount = unitData.quantity;

                    if (improvedLeviesLevel == 1) {
                        const bonus = improvedLeviesUnitBonus.get(unitData.unitType);
                        unitCount += bonus ? bonus : 0;
                    }

                    playerStates.get(p.id)?.sendUnitsToHero(createUnits(unitCount, false, p, unitData.unitType, p.startLocationX, p.startLocationY));
                }
            });
        }
    });
}

function selectionMistake() {
    const t = Trigger.create();

    t.registerAnyUnitEvent(EVENT_PLAYER_UNIT_SELECTED);

    t.addAction(() => {
        const u = Unit.fromEvent();

        if (u?.typeId === UNITS.upgradeCenter && GetTriggerPlayer() !== u.owner.handle) {
            u.select(false);
        }
    });
}

function trig_heroPurchased() {
    const t = Trigger.create();

    t.registerAnyUnitEvent(EVENT_PLAYER_UNIT_SELL);

    t.addCondition(() => {
        const u = Unit.fromHandle(GetBuyingUnit());
        if (u && u.typeId === FourCC("nshe")) {
            return true;
        }

        return false;
    });

    t.addAction(() => {
        const buyingUnit = Unit.fromHandle(GetBuyingUnit());
        const createdUnit = Unit.fromHandle(GetSoldUnit());

        if (!buyingUnit || !createdUnit) {
            return;
        }

        buyingUnit.kill();
        const seller = Unit.fromHandle(GetSellingUnit());
        const playerState = playerStates.get(createdUnit.owner.id);

        if (playerState) {
            playerState.playerHero = createdUnit;
        }

        createdUnit?.addItemById(FourCC("stel"));
        createdUnit?.addItemById(FourCC("tcas"));
        // seller?.select(false);
        // createdUnit.select(true);

        // playerState?.createSupplyHorse();

        const startX = createdUnit.owner.startLocationX;
        const startY = createdUnit.owner.startLocationY;
        SetCameraPositionForPlayer(buyingUnit.owner.handle, startX, startY);

        createdUnit.x = startX;
        createdUnit.y = startY;

        const engineer = Unit.create(createdUnit.owner, UNITS.engineer, startX, startY);
        const farmHand = Unit.create(createdUnit.owner, UNITS.farmHand, startX, startY);
        const peasant = Unit.create(createdUnit.owner, UNITS.customPeasant, startX, startY);

        // const engineer = Unit.create(createdUnit.owner, UNITS.engineer, -300 + createdUnit.owner.id * 50, 300);
        // const farmHand = Unit.create(createdUnit.owner, UNITS.farmHand, -300 + createdUnit.owner.id * 50, 300);

        const armyController = Unit.create(createdUnit.owner, UNITS.armyController, -28950 + createdUnit.owner.id * 50 - 250 * Math.floor(createdUnit.owner.id / 5), -28950 - Math.floor(createdUnit.owner.id / 5) * 75);
        armyController?.setHeroLevel(18, false);
        // const unitShop = Unit.create(createdUnit.owner, UNITS.unitShop, -28950 + createdUnit.owner.id * 50 - 250 * Math.floor(createdUnit.owner.id / 5), -28950 - Math.floor(createdUnit.owner.id / 5) * 75);
        // unitShop?.setHeroLevel(18, false);

        // if (engineer && farmHand) {
        // engineer.setUseFood(false);
        // farmHand.setUseFood(false);
        // const playerHero = playerState?.playerHero;

        // if (playerHero) {
        //     engineer.issueTargetOrder(OrderId.Move, playerHero);
        //     farmHand.issueTargetOrder(OrderId.Move, playerHero);
        // }
        // }
    });
}

export function players_nightStart() {
    forEachPlayer((p) => {
        p.setTechResearched(UpgradeCodes.dayTime, 0);
        p.setTechResearched(UpgradeCodes.nightTime, 1);
    });
}

/**
 * Should be first trigger to run
 */
export function initializePlayerStateInstances() {
    forEachAlliedPlayer((p) => {
        playerStates.set(p.id, new PlayerState(p));
        SetCameraFieldForPlayer(p.handle, CAMERA_FIELD_FARZ, 10000, 0.25);
        SetCameraFieldForPlayer(p.handle, CAMERA_FIELD_TARGET_DISTANCE, 4000, 0.25);
    });

    grantStartOfDayBonuses();
}

export function init_startingResources() {
    Players.forEach((player) => {
        player.setState(PLAYER_STATE_RESOURCE_GOLD, economicConstants.startingGold);
        player.setState(PLAYER_STATE_RESOURCE_LUMBER, economicConstants.startingLumber);
    });
}

function grantStartOfDayBonuses() {
    let totalSupplyBuildings = 0;
    let meleeWeaponUpgradeCount = 0;
    let armorUpgradeCount = 0;
    let foodReserveStructures = 0;
    let magicGuardStructures = 0;

    // const foodRoundBonus = economicConstants.capitalDailyFoodCapValue * RoundManager.currentRound;

    createDailyUnits();
    forEachAlliedPlayer((p) => {
        const playerState = playerStates.get(p.id);
        //set the food cap increase to 0
        if (playerState) {
            playerState.temporaryFoodCapIncrease = 0;
        }

        forEachUnitOfPlayerWithAbility(p, ABILITIES.supplies, (u) => {
            totalSupplyBuildings++;
        });
        forEachUnitOfPlayerWithAbility(p, ABILITIES.weaponUpgrade, (u) => {
            meleeWeaponUpgradeCount++;
        });
        forEachUnitOfPlayerWithAbility(p, ABILITIES.armorUpgrade, (u) => {
            armorUpgradeCount++;
        });
        forEachUnitOfPlayerWithAbility(p, ABILITIES.foodCapBonus, (u) => {
            foodReserveStructures++;
        });
        forEachUnitOfPlayerWithAbility(p, ABILITIES.magicGuardInfo, (u) => {
            magicGuardStructures++;
        });

        //increment for each player
        forEachUnitOfPlayerWithAbility(p, ABILITIES.grainSiloInfo, (u) => {
            const playerState = playerStates.get(p.id);

            if (playerState) {
                playerState.temporaryFoodCapIncrease = playerState.temporaryFoodCapIncrease + economicConstants.grainSiloFoodBonus;
            }
        });
    });

    //should be adding the food cap gained from the capital, the food gained from teh granaries, and the food cap increase from the grain silos players have built
    const sharedFoodCapIncrease = economicConstants.playerBaseFoodCap + economicConstants.granaryFoodCapIncrease * foodReserveStructures;

    forEachAlliedPlayer((p) => {
        /**
         * @SIMPLIFIED
         */
        //Reset to 0
        // p.setTechResearched(UpgradeCodes.armor, 0);
        // p.setTechResearched(UpgradeCodes.meleeWeapons, 0);
        p.setTechResearched(UpgradeCodes.supplyUpgrade, 0);
        // p.setTechResearched(UpgradeCodes.magicGuardUpgrade, 0);
        p.setState(PLAYER_STATE_RESOURCE_FOOD_CAP, 0);

        //Adjust accordingly
        // p.setTechResearched(UpgradeCodes.armor, armorUpgradeCount);
        // p.setTechResearched(UpgradeCodes.meleeWeapons, meleeWeaponUpgradeCount);
        p.setTechResearched(UpgradeCodes.supplyUpgrade, totalSupplyBuildings);
        // p.setTechResearched(UpgradeCodes.magicGuardUpgrade, magicGuardStructures);
        //Set player food cap

        const playerState = playerStates.get(p.id);

        if (playerState) {
            //The destruction of grain silos should happen before food calculations
            adjustFoodCap(p, playerState.temporaryFoodCapIncrease + sharedFoodCapIncrease + playerState.permanentFoodCapIncrease);
            // print(`Food gained from personal grain silos for player ${p.name}: `, playerState.temporaryFoodCapIncrease);
        }

        p.setTechResearched(UpgradeCodes.dayTime, 1);
        p.setTechResearched(UpgradeCodes.nightTime, 0);
    });
}

export function player_giveHumansStartOfDayResources(round: number) {
    //Creates supply horses for the player
    forEachAlliedPlayer((player) => {
        playerStates.get(player.id)?.createSupplyHorse();
    });

    //Restock supplies for supply bearing units.
    forEachPlayer((p) => {
        forEachUnitOfPlayerWithAbility(p, ABILITIES.supplyUsingUnit, (u) => {
            u.mana = u.maxMana;
        });
        p.setTechResearched(UpgradeCodes.dayTime, 1);
        p.setTechResearched(UpgradeCodes.nightTime, 0);
    });

    let totalIncomeBuildings = 0;
    let totalSupplyBuildings = 0;
    let lumberAbilityCount = 0;
    const playerOwnedGoldResourceBonuses = new Map<number, number>();
    const playerOwnedLumberResourceBonuses = new Map<number, number>();

    forEachAlliedPlayer((p) => {
        forEachUnitOfPlayerWithAbility(p, ABILITIES.goldIncome, (u) => {
            totalIncomeBuildings++;
            if (u.owner === p) {
                if (buildingOwnerIncomeBonusMap.has(u.typeId)) {
                    //default 1 if wwe cant find however should be unlikely
                    const bonusValue = buildingOwnerIncomeBonusMap.get(u.typeId) ?? 1;
                    const goldAward = economicConstants.goldProducingAbility * bonusValue;
                    let currentPlayerGoldAmount = playerOwnedGoldResourceBonuses.get(p.id);

                    playerOwnedGoldResourceBonuses.set(p.id, currentPlayerGoldAmount ? (currentPlayerGoldAmount += goldAward) : goldAward);
                    adjustGold(p, goldAward);
                }
            }
        });
        forEachUnitOfPlayerWithAbility(p, ABILITIES.supplies, (u) => {
            totalSupplyBuildings++;
        });
        forEachUnitOfPlayerWithAbility(p, ABILITIES.lumberIncome, (u) => {
            lumberAbilityCount++;
            if (u.owner === p) {
                if (buildingOwnerIncomeBonusMap.has(u.typeId)) {
                    //default 1 if wwe cant find however should be unlikely
                    const bonusValue = buildingOwnerIncomeBonusMap.get(u.typeId) ?? 1;
                    const lumberAward = economicConstants.goldProducingAbility * bonusValue;
                    let currentPlayerLumberAmount = playerOwnedLumberResourceBonuses.get(p.id);

                    playerOwnedLumberResourceBonuses.set(p.id, currentPlayerLumberAmount ? (currentPlayerLumberAmount += lumberAward) : lumberAward);
                    adjustLumber(p, lumberAward);
                }
            }
        });
    });

    grantStartOfDayBonuses();

    const baseGold = economicConstants.baseGoldPerRound;
    const baseWood = economicConstants.baseLumberPerRound;
    const roundGold = economicConstants.goldRoundMultiplier * round;
    const roundLumber = economicConstants.lumberRoundMultiplier * round;

    const incomeBuildingGold = economicConstants.goldProducingAbility * totalIncomeBuildings;
    const lumberIncome = economicConstants.lumberProducingAbility * lumberAbilityCount;

    const totalGold = baseGold + roundGold;
    const totalLumber = baseWood + roundLumber;
    // const totalGold = baseGold + roundGold + incomeBuildingGold;
    // const totalLumber = baseWood + roundLumber + lumberIncome;

    print("===Income Report===");
    print(`${tColor("Base Amount", "goldenrod")} - ${tColor("Gold", "yellow")}: ${baseGold}`);
    print(`${tColor("Round Bonus", "goldenrod")} #${round} - ${tColor("Gold", "yellow")}: ${roundGold}`);
    // print(`${tColor("Shared Gold Buildings", "goldenrod")} (${totalIncomeBuildings}) - ${tColor("Gold", "yellow")}: ${incomeBuildingGold}`);
    print(`${tColor("Total", "goldenrod")}: ${tColor("Gold", "yellow")}: ${totalGold}`);
    print("                                  ");
    print(`${tColor("Base Amount", "goldenrod")} - ${tColor("Lumber", "green")} - ${baseWood}`);
    print(`${tColor("Round Bonus", "goldenrod")} #${round} - ${tColor("Lumber", "green")}: ${roundLumber}`);
    // print(`${tColor("Shared Lumber Buildings", "goldenrod")} (${lumberAbilityCount}) - ${tColor("Lumber", "green")}: ${lumberIncome}`);
    print(`${tColor("Total", "goldenrod")}: ${tColor("Lumber", "green")}: ${totalLumber}`);
    print("==================");
    // print(" ");
    // print("Take your time to prepare for battle.");
    // print(`Invest your |cffffff00Gold|r with |cffffcc00Farm Laborers|r.`);
    // print(`Buy allied structures for more |cffffff00gold|r and |cff00ff00lumber|r income and |cffffcc00free units|r.`);
    // print(`|cffffcc00Free Units|r have arrived at the capital.`);

    //Gives gold and wood
    forEachAlliedPlayer((player) => {
        adjustGold(player, totalGold);
        adjustLumber(player, totalLumber);
    });
}

function playerLeaves() {
    const t = Trigger.create();

    forEachAlliedPlayer((p) => {
        TriggerRegisterPlayerEventLeave(t.handle, p.handle);
    });

    t.addAction(() => {
        const leaver = MapPlayer.fromHandle(GetTriggerPlayer());

        if (leaver) {
            notifyPlayer(`${leaver.name} has left. Their remaining resources are split up amongst the remaining players.`);

            const leaverGold = leaver.getState(PLAYER_STATE_RESOURCE_GOLD);
            const leaverLumber = leaver.getState(PLAYER_STATE_RESOURCE_LUMBER);

            let playerCount = 0;
            const unitsToRemove = [UNITS.caltrops, UNITS.humanLaborer, UNITS.peonLaborer, UNITS.druidLaborer, UNITS.grainSilo, UNITS.acolyteSlaveLaborer];

            forEachUnitOfPlayer(leaver, (u) => {
                if (unitsToRemove.includes(u.typeId)) {
                    u.destroy();
                }
            });

            forEachAlliedPlayer((p) => {
                playerCount++;
            });

            forEachAlliedPlayer((p) => {
                if (p.id !== PlayerIndices.KingdomOfAlexandria) {
                    adjustGold(p, Math.ceil(leaverGold / playerCount));
                    adjustLumber(p, Math.ceil(leaverLumber / playerCount));

                    p.setAlliance(leaver, ALLIANCE_SHARED_CONTROL, true);
                    p.setAlliance(leaver, ALLIANCE_SHARED_ADVANCED_CONTROL, true);
                    p.setAlliance(leaver, ALLIANCE_SHARED_SPELLS, true);

                    leaver.setAlliance(p, ALLIANCE_SHARED_CONTROL, true);
                    leaver.setAlliance(p, ALLIANCE_SHARED_ADVANCED_CONTROL, true);
                    leaver.setAlliance(p, ALLIANCE_SHARED_SPELLS, true);
                }
            });
        }
    });
}

/**
 * Ensures farms are only placed on crop tiles.
 */
function trig_checkFarmLaborerPlacement() {
    const t = Trigger.create();
    t.registerAnyUnitEvent(EVENT_PLAYER_UNIT_CONSTRUCT_START);

    t.addCondition(() => {
        //Get the building being built
        const u = Unit.fromEvent();

        if (!u) {
            return false;
        }

        if (laborerUnitSet.has(u.typeId) && GetTerrainType(u.x, u.y) === TERRAIN_CODE.crops) {
            return true;
        }
        //refunds laborer if its not built on crop tile
        else if (laborerUnitSet.has(u.typeId) && GetTerrainType(u.x, u.y) != TERRAIN_CODE.crops) {
            const g = GetUnitGoldCost(u.typeId);
            const w = GetUnitWoodCost(u.typeId);

            const p = u.owner;

            adjustGold(p, g);
            adjustLumber(p, w);

            print(`Laborer must be built on crop tiles. Refunding ${g} gold.`);
            u.destroy();
        }

        return false;
    });
}

export function updateDayProgressForDependents() {
    // GetPlayerTypedUnitCount(p.handle, `custom_h00N`, false, true);
    forEachAlliedPlayer((p) => {
        dailyProgressStructures.forEach((config) => {
            forEachUnitTypeOfPlayer(config.unitTypeCode, p, (u) => {
                u.mana++;

                if (u.mana >= config.maxDuration && u.isAlive()) {
                    if (config.onCompletion) {
                        config.onCompletion(u.owner, u, config);
                    }

                    u.kill();
                }
            });
        });
    });
}

function antiGrief() {
    const t = Trigger.create();

    t.registerAnyUnitEvent(EVENT_PLAYER_UNIT_ATTACKED);

    t.addAction(() => {
        const attacker = Unit.fromHandle(GetAttacker());
        const victim = Unit.fromHandle(GetAttackedUnitBJ());
        if (!attacker || !victim) {
            return;
        }

        if (attacker.owner === victim.owner) {
            return;
        }

        if (attacker.isAlly(victim.owner)) {
            attacker.issueImmediateOrder(OrderId.Stop);
        }
    });
}

//if its built during the day then set its max mana to 1
function laborerBuilt() {
    // const t = Trigger.create();
    // t.registerAnyUnitEvent(EVENT_PLAYER_UNIT_CONSTRUCT_FINISH);
    // t.addAction(() => {
    //     const u = Unit.fromEvent();
    //     if (u && TimerManager.isDayTime()) {
    //         // u.setAnimation("attack");
    //         // u.addAnimationProps("channel", true);
    //         // u.maxMana++;
    //     }
    // });
}
