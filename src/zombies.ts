import { Group, Rectangle, Unit } from "w3ts";
import { OrderId, Players } from "w3ts/globals";
// import { Units } from "war3-objectdata-th";

export const zombieMapPlayer = Players[20];

/**
 * The number of spawning zombies and which kinds will be determined by the current round number,
 * the number of towns under zombie control and which towns are under their control.
 * 
 * We should also consider the number of players remaining? Or number of players when game started.
 */
export function spawnZombies(currentRound: number) {
    const zRec = Rectangle.fromHandle(gg_rct_ZombieSpawn1);
    let group = Group.create();
    
    const mw = Unit.create(zombieMapPlayer, FourCC("umtw"), zRec?.centerX ?? 0, zRec?.centerY ?? 0, 0);
    
    if(mw) group?.addUnit(mw);
    
    for(let x = 0; x < 6 + 2 * currentRound; x++){
        let u = Unit.create(Players[20], FourCC("nzom"), zRec?.centerX ?? 0, zRec?.centerY ?? 0, 0);
        if(u !== undefined) group?.addUnit(u);
        group?.orderCoords(OrderId.Attack, 0,0);
    }

}


