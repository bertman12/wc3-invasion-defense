import { Force, Group, MapPlayer, Unit } from "w3ts";
import { Players } from "w3ts/globals";

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
    forEachPlayer(player => {
        playerStates.set(player.id, new PlayerState(player));

        //Lets players have advanced control over light blue.
        player.setAlliance(Players[9], ALLIANCE_SHARED_CONTROL, true);
        player.setAlliance(Players[9], ALLIANCE_SHARED_ADVANCED_CONTROL, true);
        player.setAlliance(Players[9], ALLIANCE_SHARED_SPELLS, true);
    } )
}

export function init_startingResources(){
    Players.forEach(player =>{
        player.setState(PLAYER_STATE_RESOURCE_GOLD, 500);
        player.setState(PLAYER_STATE_RESOURCE_FOOD_CAP, 20);
    });

    //Allow bounty from zombies.
    Players[20].setState(PLAYER_STATE_GIVES_BOUNTY, 1);
}

export function giveRoundEndResources(round: number){
    
    //Gives gold and wood
    forEachPlayer((player) => {
        adjustPlayerState(player, PLAYER_STATE_RESOURCE_GOLD, 200 + 100*round);
        adjustPlayerState(player, PLAYER_STATE_RESOURCE_LUMBER, 200 + 50*round);
    });

    //Creates supply horses for the player
    forEachPlayer((player) => {
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
export function forEachPlayer(cb: (player: MapPlayer) => void){
    Players.forEach(player => {
        if(player.slotState === PLAYER_SLOT_STATE_PLAYING && player.isPlayerAlly(Players[0]) && player != Players[25]){
            cb(player);
        }
    })
}

/**
 * @param unitType Unit Type Id or the Unit Type String "hcas", etc
 */
export function forEachUnitTypeOfPlayer(unitType: number | string, player: MapPlayer, cb:(unit: Unit) => void){
    
    if(typeof unitType === "string"){
        unitType = FourCC(unitType);
    }

    Group.create()?.enumUnitsOfPlayer(player, () => {
        const unit = Group.getFilterUnit();

        if(unit?.typeId === unitType){
            cb(unit);
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