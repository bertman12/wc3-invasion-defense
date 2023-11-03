import { Group, Rectangle, Timer, Trigger, Unit } from "w3ts";
import { OrderId, Players } from "w3ts/globals";

export const zombieMapPlayer = Players[20];

/**
 * The number of spawning zombies and which kinds will be determined by the current round number,
 * the number of towns under zombie control and which towns are under their control.
 * 
 * We should also consider the number of players remaining? Or number of players when game started.
 */
export function spawnZombies(currentRound: number, onEnd?: (...args: any) => void) {

    const t = Timer.create();
    const ROUND_DURATION = 120;
    
    t.start(ROUND_DURATION, false, () => {
        const zRec = Rectangle.fromHandle(gg_rct_ZombieSpawn1);
        let attackGroup = Group.create();

        const xPos = zRec?.centerX ?? 0;
        const yPos = zRec?.centerY ?? 0;

        //Setup waves
        const waveTimer = Timer.create();

        waveTimer.start(15, true, () => {
            for (let i = 0; i < 1 + (currentRound - 1); i++) {
                const mw = Unit.create(zombieMapPlayer, FourCC("umtw"), xPos, yPos);
                if(mw) attackGroup?.addUnit(mw);
            }
        
            //For each farm under zombie control, it should add more units to the zombie spawn. 
        
            //Creating some archers for the spawn.
            for (let i = 0; i < 3 + currentRound; i++) {
                const zArch = Unit.create(zombieMapPlayer, FourCC("nskm"), xPos, yPos);    
                if(zArch) attackGroup?.addUnit(zArch);
            }
        
            for(let i = 0; i < 6 + 2 * currentRound; i++){
                let u = Unit.create(Players[20], FourCC("nzom"), xPos, yPos);
                if(u) attackGroup?.addUnit(u);
            }
            
            attackGroup?.orderCoords(OrderId.Attack, 0,0);

        })

    })


    //Handle round over
    const tEnd = Trigger.create();

    tEnd.registerTimerExpireEvent(t.handle);


    tEnd.addAction(() => {
        if(onEnd){
            onEnd();
        }

        tEnd.destroy();
    });
    
}
