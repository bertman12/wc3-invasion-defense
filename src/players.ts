import { Force, Group, MapPlayer, Unit } from "w3ts";
import { Players } from "w3ts/globals";
import { forEachUnitOfPlayerWithAbility } from "./utils/players";

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

export function giveRoundEndResources(round: number){
    
    //Gives gold and wood
    forEachAlliedPlayer((player) => {
        adjustPlayerState(player, PLAYER_STATE_RESOURCE_GOLD, 200 + 100*round);
        adjustPlayerState(player, PLAYER_STATE_RESOURCE_LUMBER, 200 + 50*round);
    });
    


    //Creates supply horses for the player
    forEachAlliedPlayer((player) => {
        playerStates.get(player.id)?.createSupplyHorse();

        forEachUnitTypeOfPlayer(FourCC("h001"), player, (u) => {
            u.mana = u.maxMana;
        });
    });
}

export function adjustPlayerState(player: MapPlayer, whichState: playerstate, amount: number){
    player.setState(PLAYER_STATE_RESOURCE_GOLD, player.getState(whichState) + amount);
}

/**
 * Calls a function for each player playing and is an ally of red. 
 */
export function forEachAlliedPlayer(cb: (player: MapPlayer) => void){
    Players.forEach((player) => {
        //For testing purposes, include player[9] (the human ally) so their units can also be included when iterating the units OR i should make a separate function for all units. 
        if((player.slotState === PLAYER_SLOT_STATE_PLAYING || player == Players[9]) && player.isPlayerAlly(Players[0]) && player != Players[25]){
            cb(player);
            // print("player name playing", player.name, " --index: ", index );
        }
    })
}

/**
 * Uses the call back for each player while obeying the predicate, if one exists. 
 */
export function forEachPlayer(cb:  (player: MapPlayer) => void, predicate?: (player: MapPlayer) => boolean){
    Players.forEach(p => {
        if(predicate && predicate(p)){
            cb(p);
        }
        else if(!predicate){
            cb(p);
        }

    })
}

/**
 * @param unitType Unit Type Id or the Unit Type String "hcas", etc
 */
export function forEachUnitTypeOfPlayer(unitType: number | string, player: MapPlayer, cb:(unit: Unit) => void, predicate?: (unit: Unit) => boolean){
    
    if(typeof unitType === "string"){
        unitType = FourCC(unitType);
    }

    Group.create()?.enumUnitsOfPlayer(player, () => {
        const unit = Group.getFilterUnit();

        if(unit?.typeId === unitType){
            if(predicate && predicate(unit)){
                cb(unit);
            }
            else if(!predicate){
                cb(unit);
            }
        }

        return true;
    })
}

/**
 * @param unitType Unit Type Id or the Unit Type String "hcas", etc
 */
export function forEachUnitOfPlayer(player: MapPlayer, cb:(unit: Unit) => void){

    Group.create()?.enumUnitsOfPlayer(player, () => {
        const unit = Group.getFilterUnit();

        if(!unit) print("Enumerating over a unit that doesn't exist!");
        if(unit) cb(unit);

        return true;
    })
}