import { Effect, Group, Point, Rectangle, Timer, Trigger, Unit } from "w3ts";
import { OrderId, Players } from "w3ts/globals";
import { forEachUnitTypeOfPlayer } from "./utils/players";
import { allCapturableStructures, primaryCapturableStructures } from "./towns";
import { tColor } from "./utils/misc";

export const zombieMapPlayer = Players[20];

export const zombieSpawnRectangles: rect[] = [
    gg_rct_ZombieSpawn1,
    gg_rct_zombieSpawn2
]

/**
 * The number of spawning zombies and which kinds will be determined by the current round number,
 * the number of towns under zombie control and which towns are under their control.
 * 
 * We should also consider the number of players remaining? Or number of players when game started.
 *
 * We are going to want the undead to spawn from multiple locations , with varying size of force 
 *  
 * The next step is to choose the points of attacks for zombies.
 * 
 * 
 * @todo Spawn more zombies if they control towns.
 */
export function spawnZombies(currentRound: number, onEnd?: (...args: any) => void) {

    const ROUND_DURATION = 180;
    const WAVE_INTERVAL = 15;
    const roundEndTimer = Timer.create();
    // const zRec = Rectangle.fromHandle(gg_rct_ZombieSpawn1);
    
    const zombieAttackForces = 2;
    
    // const spawns = [Rectangle.fromHandle(gg_rct_ZombieSpawn1)];
    const spawns = chooseZombieSpawns(zombieAttackForces);
    const spawnUnitForces: Unit[][] = spawns.map(_ => []);
    const spawnForceCurrentTarget:Unit[] = [];
    const forceTargetEffects: Effect[] = [];
    // const spawnUnitForces: Unit[][] = Array(spawns.length).fill([]);
    
    const spawnIcons:minimapicon[] = [];

    spawns.forEach(spawn => {
        const icon = CreateMinimapIcon(spawn.centerX, spawn.centerY, 255, 255, 255, 'UI\\Minimap\\MiniMap-Boss.mdl', FOG_OF_WAR_FOGGED);
        if(icon){
            spawnIcons.push(icon);
        }
    });

    // DestroyMinimapIcon
    //Setup waves
    const waveTimer = Timer.create();
    let waveCount = 0;
    
    //End the spawning of zombies 1 wave interval before the round ends so zombies aren't spawning at the very end of the round.    
    roundEndTimer.start(ROUND_DURATION - WAVE_INTERVAL, false, () => {
        waveTimer.destroy();
    });

    waveTimer.start(WAVE_INTERVAL, true, () => {
        waveCount++;

        spawns.forEach((spawn, index) => {
            const randX = math.random(spawn?.minX, spawn?.maxX) ?? 0;
            const randY = math.random(spawn?.minY, spawn?.maxY) ?? 0;
            const newestSpawnedUnits:Unit[] = [];

            const xPos = randX;
            const yPos = randY;
    
            //Setup quantity of units to spawn per wave.
            const meatWagonCount = currentRound;
            const archerCount = 2 + currentRound;
            const zombieCount = 6 + 2 * currentRound;
    
            //At 75% of the wave time
            if(waveCount * WAVE_INTERVAL >= ROUND_DURATION*0.75){
                const u = Unit.create(zombieMapPlayer, FourCC("uabo"), xPos, yPos);
                if(u){
                    spawnUnitForces[index].push(u); 
                    newestSpawnedUnits.push(u);
                } 
            }
    
            //Creating meatWagons
            if(waveCount % 3 === 0){
                for (let i = 0; i < meatWagonCount; i++) {
                    const u = Unit.create(zombieMapPlayer, FourCC("umtw"), xPos, yPos);
                    if(u){
                        spawnUnitForces[index].push(u); 
                        newestSpawnedUnits.push(u);
                    } 
                }
            }
    
            //Spawn skeletal mages.
            const u = Unit.create(zombieMapPlayer, FourCC("u000"), xPos, yPos);
            if(u){
                    spawnUnitForces[index].push(u); 
                    newestSpawnedUnits.push(u);
                } 
    
            //Creating some archers for the spawn.
            for (let i = 0; i < archerCount; i++) {
                const u = Unit.create(zombieMapPlayer, FourCC("nskm"), xPos, yPos);    
                if(u){
                    spawnUnitForces[index].push(u); 
                    newestSpawnedUnits.push(u);
                } 
            }
        
            //Creating zombies
            for(let i = 0; i < zombieCount; i++){
                let u = Unit.create(Players[20], FourCC("nzom"), xPos, yPos);
                if(u){
                    spawnUnitForces[index].push(u); 
                    newestSpawnedUnits.push(u);
                } 
            }
            
            //Get attack target, should check if the previous target is dead, also we need to store this information in out spawn data
            //and actually this just chooses the next closest valid target from the original spawn point not from the previous , so that needs to be implemented.
            const nextTarget = chooseForceAttackTarget(Point.create(xPos, yPos));
            let isTargetNew = false;            
            //If there was no previous target then set the target for that spawn force OR if the old target is now invulnerable, we will make a new target and send the units to attack that region.
            if(nextTarget && (!spawnForceCurrentTarget[index] || spawnForceCurrentTarget[index].invulnerable === true)){
                isTargetNew = true;
                spawnForceCurrentTarget[index] = nextTarget;
                const currentTarget = spawnForceCurrentTarget[index];

                // const effect = AddSpecialEffect("Abilities\\Spells\\NightElf\\TrueshotAura\\TrueshotAura.mdl", currentTarget.x, currentTarget.y);
                // Effect.fromHandle(effect)
                const effect = Effect.create("Abilities\\Spells\\NightElf\\TrueshotAura\\TrueshotAura.mdl", currentTarget.x, currentTarget.y);
                if(effect){
                    if(forceTargetEffects[index]) forceTargetEffects[index].destroy();
                    forceTargetEffects[index] = effect;

                    // print("created effect");
                    effect.scale = 3;
                    effect.setColor(255, 255, 255);
                }
                
                //Only issue order if there was no previous target or the previous target is now invulnerable

                for(let x = 0; x < spawnUnitForces[index].length; x++){
                    const unit = spawnUnitForces[index][x];
                    // unit.issuePointOrder(OrderId.Attack, Point.create( 0, 0));
                    unit.issuePointOrder(OrderId.Attack, Point.create(currentTarget?.x ?? 0, currentTarget?.y ?? 0));
                }

            }

            //Always order the newest units created to go attack the current target
            //Needs to happen after the block that decides if a new target will be set
            //If the target is new, then the newest units have already been issued a move command
            if(!isTargetNew){
                newestSpawnedUnits.forEach(unit => {
                    const currentTarget = spawnForceCurrentTarget[index];
                    unit.issuePointOrder(OrderId.Attack, Point.create(currentTarget?.x ?? 0, currentTarget?.y ?? 0));
                });
            }

            print(`Spawn ${index} - Next attack coordinates: (${spawnForceCurrentTarget[index]?.x}, ${spawnForceCurrentTarget[index]?.y})`);
        });

    });

    //Handle round over
    const trig_end = Trigger.create();

    trig_end.registerTimerExpireEvent(roundEndTimer.handle);
    
    trig_end.addAction(() => {
        
        spawnIcons.forEach(icon => DestroyMinimapIcon(icon));

        spawnUnitForces.forEach(unitForce =>{
            unitForce.forEach((u, index) => {
                //Kill every 2nd and 3rd enemy, leaving behind only 1/3 of the enemies 
                if(index % 2 == 0 || index % 3 === 0 || index % 5 == 0){
                    u.kill()
                }
                else{
                    //Order the rest to attack the capital city
                    u.issueOrderAt(OrderId.Attack, 0,0);
                }
            } );
        });

        if(onEnd){
            onEnd();
        }

        roundEndTimer.destroy();
    });

}

/**
 * Zombies at different spawn points will have different areas they to attack. 
 * Should select points of interest that are closest to their spawn.
 * Perhaps some nights they will attack the outskirts
 * Other nights they will attack towards the capital city 
 * and on dangerous nights they will attempt to bee line it to the capital city. (?lol probably not fun for the player)
 * 
 * We choose the next point of attack relative to the current point
 */
function chooseForceAttackTarget(currentPoint :Point): Unit | null{
    //So we want to iterate our towns.

    let shortestDistance = 99999999;

    let closestCapturableStructure:Unit | null = null;

    const currLoc = Location(currentPoint.x, currentPoint.y);

    //If y is greater than r*sin(theta) or x is greater than r*cos(theta) then
    primaryCapturableStructures.forEach(structureType => {
        //Checking attack points owned by Allied Human Forces
        forEachUnitTypeOfPlayer(structureType, Players[9], u => {
            //Dont check neutral units
            const locU = Location(u.x, u.y);
            const dist = DistanceBetweenPoints(currLoc, locU);

            //Choose the point closest to the current attack point
            if(dist < shortestDistance){
                shortestDistance = dist;
                closestCapturableStructure = u;
            }
        });
    })

    return closestCapturableStructure;

    //If there exists valid attack points in the scanned region, of the valid points, select the closest. Then proceed
}

function chooseZombieSpawns(amount: number): Rectangle[]{
    const zombieRects = [gg_rct_ZombieSpawn1,
        gg_rct_zombieSpawn2]
    // const tempSet = new Set<rect>(zombieSpawnRectangles);
    const tempSet = new Set<rect>(zombieRects);

    // print("zombieSpawnRectangles size", zombieSpawnRectangles.length);
    //Search from our zombie spawns regions and select an amount
    for(let x = 0; x < amount; x++) {
        // const choice = zombieRects[math.random(0,zombieRects.length)];
        tempSet.add(zombieRects[x]);
        // if(!tempSet.has(choice)){
        //     tempSet.add(zombieRects[math.random(0,zombieRects.length)]);
        // }
    }

    const outgoingSet = new Set<Rectangle>();

    tempSet.forEach(r => {
        const converted = Rectangle.fromHandle(r);
        if(converted) outgoingSet.add(converted);
    })

    return [...outgoingSet];
}
