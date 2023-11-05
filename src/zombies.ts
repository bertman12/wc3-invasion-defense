import { Effect, Group, Point, Rectangle, Timer, Trigger, Unit } from "w3ts";
import { OrderId, Players } from "w3ts/globals";
import { forEachUnitTypeOfPlayer } from "./utils/players";
import { allCapturableStructures, primaryCapturableStructures } from "./towns";
import { tColor } from "./utils/misc";
import { MinimapIconPath } from "./shared/enums";
import { TimerManager } from "./shared/Timers";

export const zombieMapPlayer = Players[20];

export const zombieSpawnRectangles: rect[] = [
    gg_rct_ZombieSpawn1,
    gg_rct_zombieSpawn2
]

const undeadPlayers = [
    Players[10],
    Players[12],
    Players[13],
    Players[14],
    Players[15],
    Players[16],
    Players[17],
    Players[20],
    Players[21],
    Players[22],
    Players[23],
];

let currentUndeadPlayerIndex = 0;

/**
 * Cycles all players from the undead player array then restarts once it goes through all players 
 */
function getNextUndeadPlayer(){
    let player = undeadPlayers[currentUndeadPlayerIndex];
    
    if(currentUndeadPlayerIndex >= undeadPlayers.length){
        currentUndeadPlayerIndex = 0;
        player = undeadPlayers[currentUndeadPlayerIndex];
    }
    else{
        currentUndeadPlayerIndex++;
    }

    return player;
}

interface SpawnData {
    unitType: number;
    quantityPerWave: number;
    /**
     * For deciding when to spawn 
     */
    //Pretty sure there is a way to use typescript so each function can have their own unique arguemnts and when were handling this function later it will get autocomplete for those arguments unique to the spawn data object.
    spawnRequirement?: (waveCount: number, waveInterval: number, roundDuration: number) => boolean;
}

function createSpawnData(currentRound: number):SpawnData[]{
    const meatWagonCount = currentRound;
    const archerCount = 2 + 2*currentRound;
    const zombieCount = 10 + 4 * currentRound;

    const undeadSpawnData = [
        //Abomination
        {
            quantityPerWave: 1,
            unitType: FourCC("uabo"),
            spawnRequirement(waveCount: number, waveInterval: number, roundDuration: number) {
                return waveCount * waveInterval >= roundDuration*(0.35);                
            },
        },
        //Meat Wagon
        {
            quantityPerWave: meatWagonCount,
            unitType: FourCC("umtw"),
            spawnRequirement(waveCount: number, waveInterval: number, roundDuration: number) {
                return waveCount % 3 === 0;               
            },
        },
        //Skeletal Mages
        {
            quantityPerWave: 1,
            unitType: FourCC("u000"),
        },
        //Skeletal Archers
        {
            quantityPerWave: archerCount,
            unitType: FourCC("nskm"),
        },
        //Zombie
        {
            quantityPerWave: zombieCount,
            unitType: FourCC("nzom"),
        },
    ];

    return undeadSpawnData;
}

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
 * @todo Spawn more zombies if they control towns.
 */
export function spawnZombies(currentRound: number, onEnd?: (...args: any) => void) {

    const WAVE_INTERVAL = 15;
    const finalWaveTimer = Timer.create();
    const zombieAttackForces = 2;
    const spawns = chooseZombieSpawns(zombieAttackForces);
    const spawnUnitForces: Unit[][] = spawns.map(_ => []);
    const spawnForceCurrentTarget:Unit[] = [];
    const forceTargetEffects: Effect[] = [];
    const spawnLocationIcons:minimapicon[] = [];
    const spawnAttackTargetIcon: minimapicon[] = [];
    const spawnData :SpawnData[] = createSpawnData(currentRound);

    TimerManager.startNightTimer(() => {
        spawnLocationIcons.forEach(icon => DestroyMinimapIcon(icon));
        forceTargetEffects.forEach(eff => eff.destroy());
        spawnAttackTargetIcon.forEach(icon => DestroyMinimapIcon(icon));

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

        finalWaveTimer.destroy();
    });

    //Creating minimap icons for spawn locations
    spawns.forEach(spawn => {
        const icon = CreateMinimapIcon(spawn.centerX, spawn.centerY, 255, 255, 255, 'UI\\Minimap\\MiniMap-Boss.mdl', FOG_OF_WAR_FOGGED);
        if(icon){
            spawnLocationIcons.push(icon);
        }
    });

    //Setup waves
    const waveTimer = Timer.create();
    let waveCount = 0;

    //End the spawning of zombies 1 wave interval before the round ends so zombies aren't spawning at the very end of the round.    
    finalWaveTimer.start(TimerManager.nightTimeDuration - WAVE_INTERVAL, false, () => {
        waveTimer.destroy();
    });

    /**
     * Handles spawning waves of enemies
     */
    waveTimer.start(WAVE_INTERVAL, true, () => {
        waveCount++;

        spawns.forEach((spawn, index) => {
            const newestSpawnedUnits:Unit[] = [];

            const xPos = spawn.centerX;
            const yPos = spawn.centerY;

            spawnData.forEach(data => {
                if(data.spawnRequirement && data.spawnRequirement(waveCount, WAVE_INTERVAL, TimerManager.nightTimeDuration)){
                    const units = spawnUndeadUnitType(data.unitType, data.quantityPerWave, xPos, yPos);
                    spawnUnitForces[index].push(...units); 
                    newestSpawnedUnits.push(...units);
                }
                else if(!data.spawnRequirement){
                    const units = spawnUndeadUnitType(data.unitType, data.quantityPerWave, xPos, yPos);
                    spawnUnitForces[index].push(...units); 
                    newestSpawnedUnits.push(...units);
                }
            });
    
            //Get attack target, should check if the previous target is dead, also we need to store this information in out spawn data
            //and actually this just chooses the next closest valid target from the original spawn point not from the previous , so that needs to be implemented.
            const nextTarget = chooseForceAttackTarget(Point.create(xPos, yPos));
            let isTargetNew = false;            
            //If there was no previous target then set the target for that spawn force OR if the old target is now invulnerable, we will make a new target and send the units to attack that region.
            if(nextTarget && (!spawnForceCurrentTarget[index] || spawnForceCurrentTarget[index].invulnerable === true)){
                isTargetNew = true;
                spawnForceCurrentTarget[index] = nextTarget;
                const currentTarget = spawnForceCurrentTarget[index];

                const effect = Effect.create("Abilities\\Spells\\NightElf\\TrueshotAura\\TrueshotAura.mdl", currentTarget.x, currentTarget.y);
                if(effect){
                    if(forceTargetEffects[index]) forceTargetEffects[index].destroy();
                    forceTargetEffects[index] = effect;

                    effect.scale = 3;
                    effect.setColor(255, 255, 255);
                }
                
                const icon = CreateMinimapIcon(nextTarget.x, nextTarget.y, 255, 100, 50, MinimapIconPath.ping, FOG_OF_WAR_FOGGED);
                
                if(icon) {
                    DestroyMinimapIcon(spawnAttackTargetIcon[index]);
                    spawnAttackTargetIcon[index] = icon;
                }
                
                //Only issue order if there was no previous target or the previous target is now invulnerable
                for(let x = 0; x < spawnUnitForces[index].length; x++){
                    const unit = spawnUnitForces[index][x];
                    unit.issuePointOrder(OrderId.Attack, Point.create(currentTarget?.x ?? 0, currentTarget?.y ?? 0));
                }

            }

            //Always order the newest units created to go attack the current target
            //Needs to happen after the block that decides if a new target will be set
            //If the target is new, then the newest units have already been issued a move command
            if(!isTargetNew){
                newestSpawnedUnits.forEach(unit => {
                    unit.issuePointOrder(OrderId.Attack, Point.create(spawnForceCurrentTarget[index]?.x ?? 0, spawnForceCurrentTarget[index]?.y ?? 0));
                });
            }

            print(`Spawn ${index} - Next attack coordinates: (${spawnForceCurrentTarget[index]?.x}, ${spawnForceCurrentTarget[index]?.y})`);
        });

    });
}

function spawnUndeadUnitType(unitType: number, quantity: number, xPos: number, yPos: number): Unit[]{
    const units = [];

    for(let i = 0; i < quantity; i++){
        const u = Unit.create(getNextUndeadPlayer(), unitType, xPos, yPos)
        if(u){
            units.push(u);
        }
        else{
            print("Unable to create unit")
        }
    }

    return units;
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
