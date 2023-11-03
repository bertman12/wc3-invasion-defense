import { Force, Group, MapPlayer, Unit, color } from "w3ts";
import { Players } from "w3ts/globals";
import { forEachAlliedPlayer, forEachPlayer, forEachUnitOfPlayerWithAbility, forEachUnitTypeOfPlayer } from "./utils/players";
import { ABILITIES, UpgradeCodes } from "./shared/enums";
import { tColor } from "./utils/misc";

const playerStates = new Map<number, PlayerState>();

/**
 * Helps keep track of player data
 */
class PlayerState {
    player: MapPlayer;
    maxSupplyHorses:number = 3;

    constructor(player: MapPlayer){
        this.player = player;
    }

    createSupplyHorse(){
        let horseCount = 0;

        forEachUnitTypeOfPlayer("h001", this.player, (u) => {
            horseCount++;
        })
        
        if(horseCount < this.maxSupplyHorses){
            Unit.create(this.player, FourCC("h001"), 0,0);
        }
    }
}

/**
 * Should be first trigger to run
 */
export function initializePlayerStateInstances(){
    forEachAlliedPlayer(player => {
        playerStates.set(player.id, new PlayerState(player));

        //Lets players have advanced control over light blue.
        player.setAlliance(Players[9], ALLIANCE_SHARED_CONTROL, true);
        player.setAlliance(Players[9], ALLIANCE_SHARED_ADVANCED_CONTROL, true);
        player.setAlliance(Players[9], ALLIANCE_SHARED_SPELLS, true);
    });

}

export function init_startingResources(){
    Players.forEach(player =>{
        player.setState(PLAYER_STATE_RESOURCE_GOLD, 500);
        player.setState(PLAYER_STATE_RESOURCE_LUMBER, 100);
        player.setState(PLAYER_STATE_RESOURCE_FOOD_CAP, 20);
    });

    //Allow bounty from zombies.
    Players[20].setState(PLAYER_STATE_GIVES_BOUNTY, 1);
}

export function player_giveRoundEndResources(round: number){
    //Creates supply horses for the player
    forEachAlliedPlayer((player) => {
        playerStates.get(player.id)?.createSupplyHorse();

        forEachUnitTypeOfPlayer(FourCC("h001"), player, (u) => {
            u.mana = u.maxMana;
        });
    });

    let totalIncomeBuildings = 0;
    let totalSupplyBuildings = 0;

    let meleeWeaponUpgradeCount = 0;
    let armorUpgradeCount = 0;

    forEachAlliedPlayer((p) => {
        forEachUnitOfPlayerWithAbility(p, ABILITIES.income, (u) => {
            totalIncomeBuildings++;
        });
        forEachUnitOfPlayerWithAbility(p, ABILITIES.supplies, (u) => {
            totalSupplyBuildings++;
        });
        forEachUnitOfPlayerWithAbility(p, ABILITIES.weaponUpgrade, (u) => {
            // totalSupplyBuildings++;
            print("FOUND UNIT WITH WEAPON UPGRADE");
            meleeWeaponUpgradeCount++;
        });
        forEachUnitOfPlayerWithAbility(p, ABILITIES.armorUpgrade, (u) => {
            // totalSupplyBuildings++;
            armorUpgradeCount++;
            print("FOUND UNIT WITH ARMOR UPGRADE")
        });
    });

    forEachAlliedPlayer(p => {
        p.setTechResearched(UpgradeCodes.armor, armorUpgradeCount);
        p.setTechResearched(UpgradeCodes.meleeWeapons, meleeWeaponUpgradeCount);
        p.setTechResearched(UpgradeCodes.supplyUpgrade, totalSupplyBuildings);
    });

    //Depending on the number of supply buildings, we will increase the amount of supplies horses can provide.
    print("Total income count: ", totalIncomeBuildings);
    print("Total supplies count: ", totalSupplyBuildings);

    const baseGold = 200;
    const baseWood = 200;
    const roundGold = 100*round;
    const roundWood = 50*round;
    const incomeBuildingGold = 50 * totalIncomeBuildings;
    const incomeBuildingWood = 25 * totalIncomeBuildings;

    print("===Income Report===");
    print(`${tColor("Base", "goldenrod")} - ${tColor("Gold", "yellow")}: ${baseGold}`);
    print(`${tColor("Completed Round", "goldenrod")} #${round} - ${tColor("Gold", "yellow")}: ${roundGold}`);
    print(`${tColor("Income Buildings", "goldenrod")} (${totalIncomeBuildings}) - ${tColor("Gold", "yellow")}: ${incomeBuildingGold}`);
    print("                                  ");
    print(`${tColor("Base", "goldenrod")} - ${tColor("Wood", "green")} - ${baseWood}`)
    print(`${tColor("Completed Round", "goldenrod")} #${round} - ${tColor("Wood", "green")}: ${roundWood}`)
    print(`${tColor("Income Buildings", "goldenrod")} (${totalIncomeBuildings}) - ${tColor("Wood", "green")}: ${incomeBuildingWood}`);

    //Gives gold and wood
    forEachAlliedPlayer((player) => {
        adjustPlayerState(player, PLAYER_STATE_RESOURCE_GOLD, baseGold + roundGold + incomeBuildingGold);
        adjustPlayerState(player, PLAYER_STATE_RESOURCE_LUMBER, baseWood + roundWood + incomeBuildingWood);
    });

}

export function adjustPlayerState(player: MapPlayer, whichState: playerstate, amount: number){
    player.setState(PLAYER_STATE_RESOURCE_GOLD, player.getState(whichState) + amount);
}
