import { Group, Rectangle, Unit } from "w3ts";
import { OrderId, Players } from "w3ts/globals";

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
    const x = zRec?.centerX ?? 0
    const y = zRec?.centerY ?? 0

    for (let x = 0; x < 1 + (currentRound - 1); x++) {
        const mw = Unit.create(zombieMapPlayer, FourCC("umtw"), x, y);
        if(mw) group?.addUnit(mw);
        // mw?.getField("")
        
    }

    //For each farm under zombie control, it should add more units to the zombie spawn. 

    //Creating some archers for the spawn.
    for (let x = 0; x < 3 + currentRound; x++) {
        const zArch = Unit.create(zombieMapPlayer, FourCC("nskm"), x, y);    
        if(zArch) group?.addUnit(zArch);
    }

    for(let x = 0; x < 6 + 2 * currentRound; x++){
        let u = Unit.create(Players[20], FourCC("nzom"), x, y);
        if(u !== undefined) group?.addUnit(u);
        group?.orderCoords(OrderId.Attack, 0,0);
    }
}


