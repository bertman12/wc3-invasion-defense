import { Camera, Force, Group, MapPlayer, Timer, Trigger, Unit, color } from "w3ts";
import { Players } from "w3ts/globals";
import { forEachAlliedPlayer, forEachPlayer, forEachUnitOfPlayerWithAbility, forEachUnitTypeOfPlayer } from "./utils/players";
import { ABILITIES, UpgradeCodes } from "./shared/enums";
import { tColor } from "./utils/misc";
import { RoundManager } from "./shared/round-manager";

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
            Unit.create(this.player, FourCC("h001"), -300 + this.player.id * 50 , 300);
        }
    }
}

function trig_heroDies(){
    const t = Trigger.create();
    t.registerAnyUnitEvent(EVENT_PLAYER_UNIT_DEATH);

    t.addCondition(() => {
        const u = Unit.fromHandle(GetDyingUnit());

        if(u && u.isHero() && u.owner.race !== RACE_UNDEAD){
            print("Your hero will revive in 15 seconds.");
            const timer = Timer.create();

            timer.start(15, false, () => {
                    u.revive(0,0, true);
            });

            return true;
        }

        return false;
    })
}

function trig_killSheep(){
    const t = Trigger.create();

    t.registerAnyUnitEvent( EVENT_PLAYER_UNIT_SELL)
    t.addCondition(() => {
        let u = Unit.fromHandle(GetBuyingUnit());
        if(u && u.typeId === FourCC("nshe")){
            return true;
        }

        return false;
    });

    t.addAction(() => {
        let buyingUnit = Unit.fromHandle(GetBuyingUnit()) as Unit;
        buyingUnit.kill();
    
        let createdUnit = Unit.fromHandle(GetSoldUnit()) as Unit;
        createdUnit.x = -300;
        createdUnit.y = -300;
        createdUnit?.addItemById(FourCC("cnob"));

        SetCameraPositionForPlayer(buyingUnit.owner.handle, createdUnit.x, createdUnit.y);
    });
}

export function initializePlayers(){
    trig_killSheep();
    trig_heroDies();
    forEachAlliedPlayer((p, index) => {
        //Create Sheep
        const u = Unit.create(p, FourCC("nshe"), 18600 + (25 * index), -28965);
        if(u) SetCameraPositionForPlayer(p.handle, u.x, u.y);
  
        SetPlayerAllianceBJ(p.handle, ALLIANCE_PASSIVE, true, Players[18].handle);
        SetPlayerAllianceBJ(p.handle, ALLIANCE_SHARED_VISION_FORCED, true, Players[18].handle);
        SetPlayerAllianceBJ(p.handle, ALLIANCE_PASSIVE, true, Players[19].handle);
        SetPlayerAllianceBJ(p.handle, ALLIANCE_SHARED_VISION_FORCED, true, Players[19].handle);
        MeleeStartingHeroLimit();

      });

      //Setup round end functions
      RoundManager.onRoundEnd((round) => {
        print("my on round end callback fn was used");
        player_giveStartOfDayResources(round);
      });
}

/**
 * Should be first trigger to run
 */
export function initializePlayerStateInstances(){
    forEachAlliedPlayer(player => {
        playerStates.set(player.id, new PlayerState(player));
    });

    //Creates supply horses for the player
    forEachAlliedPlayer((player) => {
        playerStates.get(player.id)?.createSupplyHorse();
    });

    grantStartOfDayBonuses();
}

export function init_startingResources(){
    Players.forEach(player =>{
        player.setState(PLAYER_STATE_RESOURCE_GOLD, 350);
        player.setState(PLAYER_STATE_RESOURCE_LUMBER, 300);
    });
    
    //Allow bounty from zombies.
    Players.forEach(p => {
        if(p.race === RACE_UNDEAD){
            p.setState(PLAYER_STATE_GIVES_BOUNTY, 1);
        }
    });

}

function grantStartOfDayBonuses(){
    let totalSupplyBuildings = 0;
    let meleeWeaponUpgradeCount = 0;
    let armorUpgradeCount = 0;
    let foodReserveStructures = 0;
    const basePlayerFoodCap = 20;
    const foodRoundBonus = 5 ;

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

    const calculatedFoodCap = basePlayerFoodCap + foodRoundBonus + 2*foodReserveStructures;
    
    print("Calculated food cap:", calculatedFoodCap);
    print("foodReserveStructures: ", foodReserveStructures);

    forEachAlliedPlayer(p => {
        p.setTechResearched(UpgradeCodes.armor, 0);
        p.setTechResearched(UpgradeCodes.meleeWeapons, 0);
        p.setTechResearched(UpgradeCodes.supplyUpgrade, 0);
        p.setTechResearched(UpgradeCodes.armor, armorUpgradeCount);
        p.setTechResearched(UpgradeCodes.meleeWeapons, meleeWeaponUpgradeCount);
        p.setTechResearched(UpgradeCodes.supplyUpgrade, totalSupplyBuildings);

        //Set player food cap
        adjustFoodCap(p, calculatedFoodCap)
    });
}

export function player_giveStartOfDayResources(round: number){

    //Creates supply horses for the player
    forEachAlliedPlayer((player) => {
        playerStates.get(player.id)?.createSupplyHorse();
    });

    //Restock supplies for supply bearing units.
    forEachPlayer(p => {
        forEachUnitOfPlayerWithAbility(p, ABILITIES.replenishLifeAndMana, u => {
            u.mana = u.maxMana;
        });
    })

    let totalIncomeBuildings = 0;
    let totalSupplyBuildings = 0;

    forEachAlliedPlayer((p) => {
        forEachUnitOfPlayerWithAbility(p, ABILITIES.income, (u) => {
            totalIncomeBuildings++;
        });
        forEachUnitOfPlayerWithAbility(p, ABILITIES.supplies, (u) => {
            totalSupplyBuildings++;
        });

    });

    grantStartOfDayBonuses();

    const baseGold = 250;
    const baseWood = 150;
    const roundGold = 100 * round;
    const roundWood = 50 * round;
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

export function adjustGold(player: MapPlayer, amount: number){
    player.setState(PLAYER_STATE_RESOURCE_GOLD, player.getState(PLAYER_STATE_RESOURCE_GOLD) + amount);
}

export function adjustWood(player: MapPlayer, amount: number){
    player.setState(PLAYER_STATE_RESOURCE_LUMBER, player.getState(PLAYER_STATE_RESOURCE_LUMBER) + amount);
}

export function adjustFoodCap(player: MapPlayer, amount: number){
    print("Adjusting food cap:", amount);

    player.setState(PLAYER_STATE_RESOURCE_FOOD_CAP, player.getState(PLAYER_STATE_RESOURCE_FOOD_CAP) + amount);
}
