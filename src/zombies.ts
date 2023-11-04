import { Group, Point, Rectangle, Timer, Trigger, Unit } from "w3ts";
import { OrderId, Players } from "w3ts/globals";

export const zombieMapPlayer = Players[20];

/**
 * The number of spawning zombies and which kinds will be determined by the current round number,
 * the number of towns under zombie control and which towns are under their control.
 * 
 * We should also consider the number of players remaining? Or number of players when game started.
 * 
 * @todo Spawn more zombies if they control towns.
 */
export function spawnZombies(currentRound: number, onEnd?: (...args: any) => void) {

    const ROUND_DURATION = 180;
    const WAVE_INTERVAL = 15;
    const roundEndTimer = Timer.create();
    const zRec = Rectangle.fromHandle(gg_rct_ZombieSpawn1);
    const waveUnits: Unit[] = [];
    // const xPos = zRec?.centerX ?? 0;
    // const yPos = zRec?.centerY ?? 0;
    
    //Setup waves
    const waveTimer = Timer.create();
    let waveCount = 0;
    
    //End the spawning of zombies 1 wave interval before the round ends so zombies aren't spawning at the very end of the round.    
    roundEndTimer.start(ROUND_DURATION - WAVE_INTERVAL, false, () => {
        waveTimer.destroy();
    });

    waveTimer.start(WAVE_INTERVAL, true, () => {
        waveCount++;

        const randX = math.random(zRec?.minX, zRec?.maxX) ?? 0;
        const randY = math.random(zRec?.minY, zRec?.maxY) ?? 0;
    
        const xPos = randX;
        const yPos = randY;

        //Setup quantity of units to spawn per wave.
        const meatWagonCount = currentRound;
        const archerCount = 2 + currentRound;
        const zombieCount = 6 + 2 * currentRound;

        //At 75% of the wave time
        if(waveCount * WAVE_INTERVAL >= ROUND_DURATION*0.75){
            const u = Unit.create(zombieMapPlayer, FourCC("uabo"), xPos, yPos);
            if(u) waveUnits.push(u);
        }

        //Creating meatWagons
        if(waveCount % 3 === 0){
            for (let i = 0; i < meatWagonCount; i++) {
                const u = Unit.create(zombieMapPlayer, FourCC("umtw"), xPos, yPos);
                if(u) waveUnits.push(u);
            }
        }

        //Spawn skeletal mages.
        const u = Unit.create(zombieMapPlayer, FourCC("u000"), xPos, yPos);
        if(u) waveUnits.push(u);

        //Creating some archers for the spawn.
        for (let i = 0; i < archerCount; i++) {
            const u = Unit.create(zombieMapPlayer, FourCC("nskm"), xPos, yPos);    
            if(u) waveUnits.push(u);
        }
    
        //Creating zombies
        for(let i = 0; i < zombieCount; i++){
            let u = Unit.create(Players[20], FourCC("nzom"), xPos, yPos);
            if(u) waveUnits.push(u);
        }


        for(let x = 0; x < waveUnits.length; x++){
            const unit = waveUnits[x];
            unit.issuePointOrder(OrderId.Attack, Point.create(0,0));
        }

    });

    //Handle round over
    const trig_end = Trigger.create();

    trig_end.registerTimerExpireEvent(roundEndTimer.handle);

    trig_end.addAction(() => {
        if(onEnd){
            onEnd();
        }

        roundEndTimer.destroy();
    });

}
