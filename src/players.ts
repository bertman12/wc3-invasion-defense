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
            Unit.create(this.player, FourCC("h001"), 0 + this.player.id * 100 , 0);
            print("player id: ",this.player.id);
        }
    }
}

/**
 * Should be first trigger to run
 */
export function initializePlayerStateInstances(){
    forEachAlliedPlayer(player => {
        playerStates.set(player.id, new PlayerState(player));
    });
}

export function init_startingResources(){
    Players.forEach(player =>{
        player.setState(PLAYER_STATE_RESOURCE_GOLD, 1000);
        player.setState(PLAYER_STATE_RESOURCE_LUMBER, 1000);
        player.setState(PLAYER_STATE_RESOURCE_FOOD_CAP, 20);
    });

    //Allow bounty from zombies.
    Players[20].setState(PLAYER_STATE_GIVES_BOUNTY, 1);
}

export function player_giveRoundEndResources(round: number){

    // //Creates supply horses for the player
    forEachAlliedPlayer((player) => {
        playerStates.get(player.id)?.createSupplyHorse();
    });

    //Restock supplies for supply bearing units.
    forEachPlayer(p => {
        forEachUnitOfPlayerWithAbility(p, ABILITIES.replenishLifeAndMana, u => {
            u.mana = u.maxMana;
        })
    })

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
            meleeWeaponUpgradeCount++;
        });
        forEachUnitOfPlayerWithAbility(p, ABILITIES.armorUpgrade, (u) => {
            armorUpgradeCount++;
        });
    });

    forEachAlliedPlayer(p => {
        p.setTechResearched(UpgradeCodes.armor, armorUpgradeCount);
        p.setTechResearched(UpgradeCodes.meleeWeapons, meleeWeaponUpgradeCount);
        p.setTechResearched(UpgradeCodes.supplyUpgrade, totalSupplyBuildings);
    });

    const baseGold = 200;
    const baseWood = 200;
    const roundGold = 100*round;
    const roundWood = 50*round;
    const incomeBuildingGold = 50 * totalIncomeBuildings;
    const incomeBuildingWood = 25 * totalIncomeBuildings;

    print("===Income Report===");
    print(`${tColor("Base Amount", "goldenrod")} - ${tColor("Gold", "yellow")}: ${baseGold}`);
    print(`${tColor("Completed Round", "goldenrod")} #${round} - ${tColor("Gold", "yellow")}: ${roundGold}`);
    print(`${tColor("Income Buildings", "goldenrod")} (${totalIncomeBuildings}) - ${tColor("Gold", "yellow")}: ${incomeBuildingGold}`);
    print(`${tColor("Total", "goldenrod")}: ${tColor("Gold", "yellow")}: ${baseGold + roundGold + incomeBuildingGold}`);
    print("                                  ");
    print(`${tColor("Base Amount", "goldenrod")} - ${tColor("Wood", "green")} - ${baseWood}`);
    print(`${tColor("Completed Round", "goldenrod")} #${round} - ${tColor("Wood", "green")}: ${roundWood}`);
    print(`${tColor("Income Buildings", "goldenrod")} (${totalIncomeBuildings}) - ${tColor("Wood", "green")}: ${incomeBuildingWood}`);
    print(`${tColor("Total", "goldenrod")}: ${tColor("Wood", "green")}: ${baseWood + roundWood + incomeBuildingWood}`);
    print("==================");

    //Gives gold and wood
    forEachAlliedPlayer((player) => {
        adjustPlayerState(player, PLAYER_STATE_RESOURCE_GOLD, baseGold + roundGold + incomeBuildingGold);
        adjustPlayerState(player, PLAYER_STATE_RESOURCE_LUMBER, baseWood + roundWood + incomeBuildingWood);
    });
}

export function adjustPlayerState(player: MapPlayer, whichState: playerstate, amount: number){
    player.setState(whichState, player.getState(whichState) + amount);
}
