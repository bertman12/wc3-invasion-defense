import { Effect, MapPlayer, Sound, Timer, Trigger, Unit, Widget } from "w3ts";
import { OrderId, Players } from "w3ts/globals";
import { TimerManager } from "./shared/Timers";
import { economicConstants } from "./shared/constants";
import { ABILITIES, PlayerIndices, TERRAIN_CODE, UNITS, UpgradeCodes, laborerUnitSet } from "./shared/enums";
import { RoundManager } from "./shared/round-manager";
import { notifyPlayer, tColor } from "./utils/misc";
import { adjustFoodCap, adjustGold, adjustLumber, forEachAlliedPlayer, forEachPlayer, forEachUnitOfPlayerWithAbility, forEachUnitTypeOfPlayer, isPlayingUser } from "./utils/players";
import { createUnits } from "./utils/units";

export const playerStates = new Map<number, PlayerState>();

/**
 * Helps keep track of player data
 */
class PlayerState {
    player: MapPlayer;
    maxSupplyHorses: number = 3;
    playerHero: Unit | undefined;
    rallyToHero: boolean = false;
    foodCapIncrease: number = 0;
    /**
     * grain silos will permanently increase your food
     */
    permanentFoodCapIncrease: number = 0;

    constructor(player: MapPlayer) {
        this.player = player;
    }

    createSupplyHorse() {
        let horseCount = 0;

        forEachUnitTypeOfPlayer("h001", this.player, (u) => {
            horseCount++;
        });

        if (horseCount < this.maxSupplyHorses) {
            const u = Unit.create(this.player, FourCC("h001"), -300 + this.player.id * 50, 300);
            const widget = Widget.fromHandle(this.playerHero?.handle);

            if (u && widget) {
                u.issueTargetOrder(OrderId.Move, widget);
            }
        }
    }
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
                u.revive(0, 0, true);
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
        //send to hero
        if (u && playerStates.get(u.owner.id)?.rallyToHero) {
            const widget = Widget.fromHandle(playerStates.get(u.owner.id)?.playerHero?.handle);

            if (widget) {
                u.issueTargetOrder(OrderId.Move, widget);
            }
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
            forEachUnitTypeOfPlayer(UNITS.farmTown, p, (u) => {
                createUnits(4, false, p, UNITS.militia, p.startLocationX, p.startLocationY);
            });
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

        createdUnit.x = -300;
        createdUnit.y = -300;
        createdUnit?.addItemById(FourCC("ankh"));
        createdUnit?.addItemById(FourCC("stel"));
        seller?.select(false);
        createdUnit.select(true);

        SetCameraPositionForPlayer(buyingUnit.owner.handle, createdUnit.x, createdUnit.y);

        playerState?.createSupplyHorse();

        const engineer = Unit.create(createdUnit.owner, UNITS.engineer, -300 + createdUnit.owner.id * 50, 300);
        const farmHand = Unit.create(createdUnit.owner, UNITS.farmHand, -300 + createdUnit.owner.id * 50, 300);

        if (engineer && farmHand) {
            engineer.setUseFood(false);
            farmHand.setUseFood(false);
            const playerHero = playerState?.playerHero;

            if (playerHero) {
                engineer.issueTargetOrder(OrderId.Move, playerHero);
                farmHand.issueTargetOrder(OrderId.Move, playerHero);
            }
        }
    });
}

export function setupPlayers() {
    initializePlayerStateInstances();
    trig_playerBuysUnit();
    trig_heroPurchased();
    trig_heroDies();
    trig_checkFarmLaborerPlacement();
    playerLeaves();
    laborerBuilt();
    forEachAlliedPlayer((p, index) => {
        //Create Sheep to buy hero
        const u = Unit.create(p, FourCC("nshe"), 18600 + 25 * index, -28965);
        if (u) {
            SetCameraPositionForPlayer(p.handle, u.x, u.y);
        }

        SetPlayerHandicapXP(p.handle, 0.25);
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
    const basePlayerFoodCap = 0;
    let totalSupplyBuildings = 0;
    let meleeWeaponUpgradeCount = 0;
    let armorUpgradeCount = 0;
    let foodReserveStructures = 0;
    let magicGuardStructures = 0;

    const foodRoundBonus = economicConstants.capitalDailyFoodCapValue * RoundManager.currentRound;

    createDailyUnits();
    forEachAlliedPlayer((p) => {
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
                playerState.foodCapIncrease++;
            }
        });
    });

    const calculatedFoodCap = basePlayerFoodCap + foodRoundBonus + economicConstants.granaryFoodCapIncrease * foodReserveStructures;

    // print("Base food ", basePlayerFoodCap);
    // print("Food round bonus ", foodRoundBonus);
    // print("Food reserve structure ", 2 * foodReserveStructures);
    // print("grain silos ", 5 * grainSiloCount);
    // print("New food cap - ", calculatedFoodCap);

    forEachAlliedPlayer((p) => {
        //Reset to 0
        p.setTechResearched(UpgradeCodes.armor, 0);
        p.setTechResearched(UpgradeCodes.meleeWeapons, 0);
        p.setTechResearched(UpgradeCodes.supplyUpgrade, 0);
        p.setTechResearched(UpgradeCodes.magicGuardUpgrade, 0);
        p.setState(PLAYER_STATE_RESOURCE_FOOD_CAP, 0);

        //Adjust accordingly
        p.setTechResearched(UpgradeCodes.armor, armorUpgradeCount);
        p.setTechResearched(UpgradeCodes.meleeWeapons, meleeWeaponUpgradeCount);
        p.setTechResearched(UpgradeCodes.supplyUpgrade, totalSupplyBuildings);
        p.setTechResearched(UpgradeCodes.magicGuardUpgrade, magicGuardStructures);
        //Set player food cap

        const playerState = playerStates.get(p.id);

        if (playerState) {
            // print("Personal food cap for  ", p.name, " : ", playerState.foodCapIncrease);
            adjustFoodCap(p, playerState.foodCapIncrease + calculatedFoodCap);
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
        forEachUnitOfPlayerWithAbility(p, ABILITIES.replenishLifeAndMana, (u) => {
            u.mana = u.maxMana;
        });
        p.setTechResearched(UpgradeCodes.dayTime, 1);
        p.setTechResearched(UpgradeCodes.nightTime, 0);
    });

    let totalIncomeBuildings = 0;
    let totalSupplyBuildings = 0;
    let lumberAbilityCount = 0;
    let playerOwnedIncomeBuildings = 0;
    let playerOwnedLumberBuildings = 0;

    forEachAlliedPlayer((p) => {
        forEachUnitOfPlayerWithAbility(p, ABILITIES.income, (u) => {
            totalIncomeBuildings++;
            if (u.owner === p) {
                playerOwnedIncomeBuildings++;
                adjustGold(p, economicConstants.goldProducingAbility);
            }
        });
        forEachUnitOfPlayerWithAbility(p, ABILITIES.supplies, (u) => {
            totalSupplyBuildings++;
        });
        forEachUnitOfPlayerWithAbility(p, ABILITIES.lumberIncome, (u) => {
            lumberAbilityCount++;
            if (u.owner === p) {
                playerOwnedLumberBuildings++;
                adjustGold(p, economicConstants.lumberProducingAbility);
            }
        });

        // forEachUnitTypeOfPlayer(UNITS.farmTown, p, (u) => {
        //     print("farm grant ability level: ", GetUnitAbilityLevel(u.handle, ABILITIES.purchaseFarmGrant));
        // });
    });

    grantStartOfDayBonuses();

    const baseGold = economicConstants.baseGoldPerRound;
    const baseWood = economicConstants.baseLumberPerRound;
    const roundGold = economicConstants.goldRoundMultiplier * round;
    const roundLumber = economicConstants.lumberRoundMultiplier * round;

    const incomeBuildingGold = economicConstants.goldProducingAbility * totalIncomeBuildings;
    const lumberIncome = economicConstants.lumberProducingAbility * lumberAbilityCount;

    const totalGold = baseGold + roundGold + incomeBuildingGold;
    const totalLumber = baseWood + roundLumber + lumberIncome;

    print("===Income Report===");
    print(`${tColor("Base Amount", "goldenrod")} - ${tColor("Gold", "yellow")}: ${baseGold}`);
    print(`${tColor("Round Bonus", "goldenrod")} #${round} - ${tColor("Gold", "yellow")}: ${roundGold}`);
    print(`${tColor("Shared Gold Buildings", "goldenrod")} (${totalIncomeBuildings}) - ${tColor("Gold", "yellow")}: ${incomeBuildingGold}`);
    print(`${tColor("Total", "goldenrod")}: ${tColor("Gold", "yellow")}: ${totalGold}`);
    print("                                  ");
    print(`${tColor("Base Amount", "goldenrod")} - ${tColor("Lumber", "green")} - ${baseWood}`);
    print(`${tColor("Round Bonus", "goldenrod")} #${round} - ${tColor("Lumber", "green")}: ${roundLumber}`);
    print(`${tColor("Shared Lumber Buildings", "goldenrod")} (${lumberAbilityCount}) - ${tColor("Lumber", "green")}: ${lumberIncome}`);
    print(`${tColor("Total", "goldenrod")}: ${tColor("Lumber", "green")}: ${totalLumber}`);
    print("==================");

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

        //prevents anything but laborers to be built on crop tiles
        // else if ([UNITS.humanLaborer, UNITS.peonLaborer].includes(u.typeId) && GetTerrainType(u.x, u.y) === TERRAIN_CODE.crops) {
        //     const g = GetUnitGoldCost(u.typeId);
        //     const w = GetUnitWoodCost(u.typeId);

        //     print(`Only laborers can be built on crop tiles. Refunding ${g} gold and ${w} wood.`);

        //     const p = u.owner;
        //     adjustGold(p, g);
        //     adjustLumber(p, w);

        //     u.destroy();
        // }

        return false;
    });
}

const laborerTypes = [
    {
        unitTypeCode: UNITS.peonLaborer,
        goldCostMultiplierAward: 1.3,
        maxManaRequirement: 2,
    },
    {
        unitTypeCode: UNITS.humanLaborer,
        goldCostMultiplierAward: 1.5,
        maxManaRequirement: 4,
    },
    {
        unitTypeCode: UNITS.druidLaborer,
        goldCostMultiplierAward: 2,
        maxManaRequirement: 5,
    },
    {
        unitTypeCode: UNITS.acolyteSlaveLaborer,
        goldCostMultiplierAward: 1.15,
        maxManaRequirement: 1,
    },
    {
        unitTypeCode: UNITS.grainSilo,
        goldCostMultiplierAward: 0,
        maxManaRequirement: 5,
        //onCompletion ... do something maybe different for different structures
    },
];

export function addProgressForLaborers() {
    // GetPlayerTypedUnitCount(p.handle, `custom_h00N`, false, true);
    forEachAlliedPlayer((p) => {
        laborerTypes.forEach((config) => {
            forEachUnitTypeOfPlayer(config.unitTypeCode, p, (u) => {
                u.maxMana++;

                // u.setVertexColor(0, 255, 0, 255);

                if (u.maxMana === config.maxManaRequirement) {
                    const e = Effect.createAttachment("Abilities\\Spells\\Other\\Transmute\\PileofGold.mdl", u, "origin");
                    const t = Timer.create();

                    t.start(1.5, false, () => {
                        e?.destroy();
                        t.destroy();
                    });

                    u.kill();
                    const unitGoldCost = GetUnitGoldCost(config.unitTypeCode);
                    const goldAwarded = unitGoldCost * config.goldCostMultiplierAward;

                    if (goldAwarded > 0) {
                        adjustGold(p, goldAwarded);
                        // print(`${u.owner.name} has been awarded ${tColor(goldAwarded.toString(), "yellow")} gold for ${u.name} completing their work.`);
                    }
                }
            });
        });
    });
}

//if its built during the day then set its max mana to 1
function laborerBuilt() {
    const t = Trigger.create();

    t.registerAnyUnitEvent(EVENT_PLAYER_UNIT_CONSTRUCT_FINISH);

    t.addAction(() => {
        const u = Unit.fromEvent();

        if (u && TimerManager.isDayTime()) {
            u.setAnimation("attack");
            u.addAnimationProps("channel", true);
            // u.maxMana++;
        }
    });
}
