import { MapPlayer, Sound, Timer, Trigger, Unit, Widget } from "w3ts";
import { OrderId, Players } from "w3ts/globals";
import { economicConstants } from "./shared/constants";
import { ABILITIES, UpgradeCodes } from "./shared/enums";
import { RoundManager } from "./shared/round-manager";
import { tColor } from "./utils/misc";
import { forEachAlliedPlayer, forEachPlayer, forEachUnitOfPlayerWithAbility, forEachUnitTypeOfPlayer } from "./utils/players";

export const playerStates = new Map<number, PlayerState>();

/**
 * Helps keep track of player data
 */
class PlayerState {
    player: MapPlayer;
    maxSupplyHorses: number = 3;
    playerHero: Unit | undefined;
    rallyToHero: boolean = false;

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
            print(`${tColor("!", "goldenrod")} - Your hero will revive in 15 seconds.`);
            const timer = Timer.create();

            timer.start(15, false, () => {
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

    t.addCondition(() => {
        const u = Unit.fromHandle(GetSoldUnit()) as Unit;

        if (u && playerStates.get(u.owner.id)?.rallyToHero) {
            return true;
        }

        return false;
    });

    t.addAction(() => {
        const u = Unit.fromHandle(GetSoldUnit()) as Unit;
        const widget = Widget.fromHandle(playerStates.get(u.owner.id)?.playerHero?.handle);

        if (u && widget) {
            u.issueTargetOrder(OrderId.Move, widget);
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
        const buyingUnit = Unit.fromHandle(GetBuyingUnit()) as Unit;
        buyingUnit.kill();

        const createdUnit = Unit.fromHandle(GetSoldUnit()) as Unit;
        const playerState = playerStates.get(createdUnit.owner.id);
        if (playerState) {
            playerState.playerHero = createdUnit;
        }

        createdUnit.x = -300;
        createdUnit.y = -300;
        createdUnit?.addItemById(FourCC("cnob"));
        createdUnit?.addItemById(FourCC("ankh"));
        createdUnit?.addItemById(FourCC("stel"));
        createdUnit?.addItemById(FourCC("I001"));

        SetCameraPositionForPlayer(buyingUnit.owner.handle, createdUnit.x, createdUnit.y);

        playerState?.createSupplyHorse();
    });
}

export function initializePlayers() {
    initializePlayerStateInstances();
    trig_playerBuysUnit();
    trig_heroPurchased();
    trig_heroDies();
    players_dayStart();

    forEachAlliedPlayer((p, index) => {
        //Create Sheep
        const u = Unit.create(p, FourCC("nshe"), 18600 + 25 * index, -28965);
        if (u) {
            SetCameraPositionForPlayer(p.handle, u.x, u.y);
        }
    });

    //Setup round end functions
    RoundManager.onDayStart((round) => {
        player_giveHumansStartOfDayResources(round);
        players_dayStart();
    });

    RoundManager.onNightStart(() => {
        players_nightStart();
    });
}

function players_dayStart() {
    forEachPlayer((p) => {
        p.setTechResearched(UpgradeCodes.dayTime, 1);
        p.setTechResearched(UpgradeCodes.nightTime, 0);
    });
}

function players_nightStart() {
    forEachPlayer((p) => {
        p.setTechResearched(UpgradeCodes.dayTime, 0);
        p.setTechResearched(UpgradeCodes.nightTime, 1);
    });
}

/**
 * Should be first trigger to run
 */
export function initializePlayerStateInstances() {
    forEachAlliedPlayer((player) => {
        playerStates.set(player.id, new PlayerState(player));
    });

    grantStartOfDayBonuses();
}

export function init_startingResources() {
    Players.forEach((player) => {
        player.setState(PLAYER_STATE_RESOURCE_GOLD, 350);
        player.setState(PLAYER_STATE_RESOURCE_LUMBER, 300);
    });

    // //Allow bounty from zombies.
    // Players.forEach(p => {
    //     if(p.race === RACE_UNDEAD){
    //         p.setState(PLAYER_STATE_GIVES_BOUNTY, 1);
    //     }
    // });
}

function grantStartOfDayBonuses() {
    let totalSupplyBuildings = 0;
    let meleeWeaponUpgradeCount = 0;
    let armorUpgradeCount = 0;
    let foodReserveStructures = 0;
    const basePlayerFoodCap = 20;

    const foodRoundBonus = 5 * RoundManager.currentRound;

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
    });

    const calculatedFoodCap = basePlayerFoodCap + foodRoundBonus + 2 * foodReserveStructures;

    forEachAlliedPlayer((p) => {
        //Reset to 0
        p.setTechResearched(UpgradeCodes.armor, 0);
        p.setTechResearched(UpgradeCodes.meleeWeapons, 0);
        p.setTechResearched(UpgradeCodes.supplyUpgrade, 0);
        p.setState(PLAYER_STATE_RESOURCE_FOOD_CAP, 0);

        //Adjust accordingly
        p.setTechResearched(UpgradeCodes.armor, armorUpgradeCount);
        p.setTechResearched(UpgradeCodes.meleeWeapons, meleeWeaponUpgradeCount);
        p.setTechResearched(UpgradeCodes.supplyUpgrade, totalSupplyBuildings);

        //Set player food cap
        adjustFoodCap(p, calculatedFoodCap);
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
                print("Player owned the farm!");
                adjustGold(p, economicConstants.goldIncomeAbility);
            }
        });
        forEachUnitOfPlayerWithAbility(p, ABILITIES.supplies, (u) => {
            totalSupplyBuildings++;
        });
        forEachUnitOfPlayerWithAbility(p, ABILITIES.lumberIncome, (u) => {
            lumberAbilityCount++;
            if (u.owner === p) {
                playerOwnedLumberBuildings++;
                adjustGold(p, economicConstants.lumberIncomeAbility);
            }
        });
    });

    grantStartOfDayBonuses();

    const baseGold = 100;
    const baseWood = 50;
    const roundGold = 25 * round;
    const roundWood = 10 * round;

    const incomeBuildingGold = economicConstants.goldIncomeAbility * totalIncomeBuildings;
    const lumberIncome = economicConstants.lumberIncomeAbility * lumberAbilityCount;

    const totalGold = baseGold + roundGold + incomeBuildingGold;
    const totalLumber = baseWood + roundWood + lumberIncome;

    print("===Income Report===");
    print(`${tColor("Base Amount", "goldenrod")} - ${tColor("Gold", "yellow")}: ${baseGold}`);
    print(`${tColor("Round Bonus", "goldenrod")} #${round} - ${tColor("Gold", "yellow")}: ${roundGold}`);
    print(`${tColor("Shared Gold Buildings", "goldenrod")} (${totalIncomeBuildings}) - ${tColor("Gold", "yellow")}: ${incomeBuildingGold}`);
    print(`${tColor("Total", "goldenrod")}: ${tColor("Gold", "yellow")}: ${totalGold}`);
    print("                                  ");
    print(`${tColor("Base Amount", "goldenrod")} - ${tColor("Lumber", "green")} - ${baseWood}`);
    print(`${tColor("Round Bonus", "goldenrod")} #${round} - ${tColor("Lumber", "green")}: ${roundWood}`);
    print(`${tColor("Shared Lumber Buildings", "goldenrod")} (${lumberAbilityCount}) - ${tColor("Lumber", "green")}: ${lumberIncome}`);
    print(`${tColor("Total", "goldenrod")}: ${tColor("Lumber", "green")}: ${totalLumber}`);
    print("==================");

    //Gives gold and wood
    forEachAlliedPlayer((player) => {
        adjustGold(player, totalGold);
        adjustLumber(player, totalLumber);
    });
}

export function adjustPlayerState(player: MapPlayer, whichState: playerstate, amount: number) {
    player.setState(whichState, player.getState(whichState) + amount);
}

export function adjustGold(player: MapPlayer, amount: number) {
    player.setState(PLAYER_STATE_RESOURCE_GOLD, player.getState(PLAYER_STATE_RESOURCE_GOLD) + amount);
}

export function adjustLumber(player: MapPlayer, amount: number) {
    player.setState(PLAYER_STATE_RESOURCE_LUMBER, player.getState(PLAYER_STATE_RESOURCE_LUMBER) + amount);
}

export function adjustFoodCap(player: MapPlayer, amount: number) {
    // print("Adjusting food cap:", amount);

    player.setState(PLAYER_STATE_RESOURCE_FOOD_CAP, player.getState(PLAYER_STATE_RESOURCE_FOOD_CAP) + amount);
}
