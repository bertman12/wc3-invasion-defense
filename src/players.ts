import { forEachUnitOfPlayer } from "src/utils/players";
import { MapPlayer, Sound, Trigger, Unit } from "w3ts";
import { OrderId, Players } from "w3ts/globals";
import { GameConfig } from "./shared/GameConfig";
import { buildingOwnerDailyUnitBonusMap, buildingOwnerIncomeBonusMap, economicConstants, improvedLeviesUnitBonus } from "./shared/constants";
import { ABILITIES, PlayerIndices, TERRAIN_CODE, UNITS, UpgradeCodes, laborerUnitSet } from "./shared/enums";
import { PlayerState, playerStates } from "./shared/playerState";
import { notifyPlayer, tColor } from "./utils/misc";
import { adjustGold, adjustLumber, forEachAlliedPlayer, forEachPlayer, forEachUnitOfPlayerWithAbility, isPlayingUser } from "./utils/players";
import { createUnits } from "./utils/units";
// import { trig_heroPurchasedAfterPrepTime } from "./triggers/heroes/heroPurchasing";

/**
 * PLayer states are initialized here
 */
export function setupPlayers() {
    initializePlayerStateInstances();
    trig_playerBuysUnit();
    // trig_heroPurchasedAfterPrepTime();
    // trig_heroDies();
    trig_checkFarmLaborerPlacement();
    playerLeaves();
    antiGrief();
    initPlayerSettings();
    lossCondition();
    forEachAlliedPlayer((p, index) => {
        //Create Sheep to buy hero
        const u = Unit.create(p, FourCC("nshe"), 18600 + 25 * index, -28965);

        if (!u) {
            return;
        }

        SelectUnitForPlayerSingle(u?.handle, u?.owner.handle);
        SetCameraPositionForPlayer(p.handle, u.x, u.y);
    });
}

export function trig_playerBuysUnit() {
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
    });
}

function createDailyUnits() {
    forEachAlliedPlayer((p) => {
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
        player.setState(PLAYER_STATE_RESOURCE_FOOD_CAP, economicConstants.startingFood);
    });
}

function initPlayerSettings() {
    forEachAlliedPlayer((p) => {
        SetPlayerTechMaxAllowed(p.handle, UNITS.druidLaborer, 8);
        SetPlayerTechMaxAllowed(p.handle, FourCC("e001"), 15);
    });
}

function grantStartOfDayBonuses() {
    let totalSupplyBuildings = 0;
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
        //increment for each player
        forEachUnitOfPlayerWithAbility(p, ABILITIES.grainSiloInfo, (u) => {
            const playerState = playerStates.get(p.id);

            if (playerState) {
                playerState.temporaryFoodCapIncrease = playerState.temporaryFoodCapIncrease + economicConstants.grainSiloFoodBonus;
            }
        });
    });

    //should be adding the food cap gained from the capital, the food gained from teh granaries, and the food cap increase from the grain silos players have built
    // const sharedFoodCapIncrease = economicConstants.playerBaseFoodCap;

    forEachAlliedPlayer((p) => {
        /**
         * @SIMPLIFIED
         */
        // p.setTechResearched(UpgradeCodes.supplyUpgrade, 0);
        // p.setState(PLAYER_STATE_RESOURCE_FOOD_CAP, 0);

        //Adjust accordingly
        // p.setTechResearched(UpgradeCodes.supplyUpgrade, totalSupplyBuildings);

        //Set player food cap
        // const playerState = playerStates.get(p.id);

        // if (playerState) {
        //     //The destruction of grain silos should happen before food calculations
        //     adjustFoodCap(p, playerState.temporaryFoodCapIncrease + sharedFoodCapIncrease + playerState.permanentFoodCapIncrease);
        // }

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

        if (GameConfig.heroModeEnabled) {
            const armorUpgradeLevel = p.getTechCount(UpgradeCodes.armor, true);
            const weaponUpgradeLevel = p.getTechCount(UpgradeCodes.meleeWeapons, true);
            p.setTechResearched(UpgradeCodes.armor, armorUpgradeLevel + 1);
            p.setTechResearched(UpgradeCodes.meleeWeapons, weaponUpgradeLevel + 1);
        }
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

    const baseGold = GameConfig.roundGoldBaseAmount; //economicConstants.baseGoldPerRound;
    // const baseWood = economicConstants.baseLumberPerRound;
    const roundGold = GameConfig.roundGoldMultiplier * round; //economicConstants.goldRoundMultiplier * round;
    // const roundLumber = economicConstants.lumberRoundMultiplier * round;

    const totalGold = baseGold + roundGold;
    // const totalLumber = baseWood + roundLumber;

    // print("===Night Completion Reward===");
    // print(`${tColor("Base Amount", "goldenrod")} - ${tColor("Gold", "yellow")}: ${baseGold}`);
    // print(`${tColor("Round Bonus", "goldenrod")} #${round} - ${tColor("Gold", "yellow")}: ${roundGold}`);
    // print(`${tColor("Total", "goldenrod")}: ${tColor("Gold", "yellow")}: ${totalGold}`);
    // print("                                  ");
    // // print(`${tColor("Base Amount", "goldenrod")} - ${tColor("Lumber", "green")} - ${baseWood}`);
    // // print(`${tColor("Round Bonus", "goldenrod")} #${round} - ${tColor("Lumber", "green")}: ${roundLumber}`);
    // // print(`${tColor("Total", "goldenrod")}: ${tColor("Lumber", "green")}: ${totalLumber}`);
    // print("==================");
    // print("");
    if (!GameConfig.heroModeEnabled) {
        print("Use your |cffffcc00engineers|r to rebuild your defenses.");
        print("Remember to keep building |cffffcc00Druid Farmers|r with your |cffffcc00peasant|r when you can.");
    }

    //Gives gold and wood
    forEachAlliedPlayer((player) => {
        adjustGold(player, totalGold);
        // adjustLumber(player, totalLumber);
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
                if (isPlayingUser(p)) {
                    playerCount++;
                }
            });

            forEachAlliedPlayer((p) => {
                if (p.id !== PlayerIndices.HumanDefenders && playerCount > 0) {
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

            leaver.setState(PLAYER_STATE_RESOURCE_GOLD, 0);
            leaver.setState(PLAYER_STATE_RESOURCE_LUMBER, 0);
        }
    });
}

// function trig_registerDisconnect(){
//     const t = Trigger.create()
//     t.registerGameStateEvent(GAME_STATE_DISCONNECTED, ConvertLimitOp(1), 1);
// }

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

function lossCondition() {
    if (GameConfig.setup_defeatCondition) {
        GameConfig.setup_defeatCondition();
    } else {
        const t = Trigger.create();

        t.registerAnyUnitEvent(EVENT_PLAYER_UNIT_DEATH);

        t.addAction(() => {
            const unit = Unit.fromEvent();

            if (unit && unit.typeId === FourCC("htow")) {
                let foundAlliedTownHall = false;
                //check if any other allied player town halls exist
                forEachAlliedPlayer((p) => {
                    if (isPlayingUser(p)) {
                        forEachUnitOfPlayer(p, (u) => {
                            if (u.typeId === FourCC("htow") && u.isAlive()) {
                                foundAlliedTownHall = true;
                            }
                        });
                    }
                });

                if (!foundAlliedTownHall) {
                    StopMusic(false);
                    PlayMusic(gg_snd_UndeadVictory);
                    //play sad sound
                    Sound.fromHandle(gg_snd_SargerasLaugh)?.start();
                    print(tColor("No town halls remain. You have been defeated!", "red"));
                    print(tColor("No town halls remain. You have been defeated!", "red"));
                    print(tColor("No town halls remain. You have been defeated!", "red"));
                    print(tColor("No town halls remain. You have been defeated!", "red"));
                    print(tColor("No town halls remain. You have been defeated!", "red"));
                }
            }
        });
    }
}
