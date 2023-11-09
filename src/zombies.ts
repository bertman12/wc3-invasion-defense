import { Effect, Group, Point, Rectangle, Sound, Timer, Trigger, Unit } from "w3ts";
import { OrderId, Players } from "w3ts/globals";
import { forEachUnitTypeOfPlayer } from "./utils/players";
import { allCapturableStructures, primaryCapturableStructures } from "./towns";
import { tColor } from "./utils/misc";
import { CUSTOM_UNITS, MinimapIconPath } from "./shared/enums";
import { TimerManager } from "./shared/Timers";
import { RoundManager } from "./shared/round-manager";

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

function playPitLordSound(){
    PlaySoundBJ(gg_snd_U08Archimonde19);
}

interface SpawnData {
    unitType: number;
    quantityPerWave: number;
    /**
     * For deciding when to spawn 
     */
    //Pretty sure there is a way to use typescript so each function can have their own unique arguemnts and when were handling this function later it will get autocomplete for those arguments unique to the spawn data object.
    spawnRequirement?: (waveCount: number, waveInterval: number, roundDuration: number) => boolean;
    onCreation?: (u: Unit) => void;
}

function createSpawnData(currentRound: number, spawnCount: number):SpawnData[]{
    //could make spawn quantity cyclic with trig functions
    
    const spawnModifier = 4/spawnCount - 1;

    const undeadSpawnData:SpawnData[] = [
        //Abomination
        {
            quantityPerWave: 1 + Math.floor(spawnModifier),
            unitType: FourCC("uabo"),
            spawnRequirement(waveCount: number, waveInterval: number, roundDuration: number) {
                return waveCount * waveInterval >= roundDuration*(0.35);                
            },

            //unitModification: (u: Unit) => void -- use this function to adjust the unit stats in some way, probably based on round or buildings captured etc.
        },
        //Meat Wagon
        {
            quantityPerWave: currentRound,
            unitType: FourCC("umtw"),
            spawnRequirement(waveCount: number, waveInterval: number, roundDuration: number) {
                return waveCount % 3 === 0;               
            },
        },
        //Skeletal Mages
        {
            quantityPerWave: 1 + Math.floor(spawnModifier/2),
            unitType: FourCC("u000"),
            
        },
        //Necromancers -special
        {
            quantityPerWave: 2,
            spawnRequirement(waveCount, waveInterval, roundDuration) {
                return currentRound >=2;
            },
            unitType: FourCC("u001"),
        },
        //Skeletal Archers
        {
            quantityPerWave: 2 + currentRound,
            unitType: FourCC("nskm"),
        },
        //Zombie
        {
            quantityPerWave: 4 + Math.floor(spawnModifier) + 4*currentRound,
            unitType: FourCC("nzom"),
        },
        //Obsidian Statues
        {
            quantityPerWave: 1,
            spawnRequirement(waveCount, waveInterval, roundDuration) {
                return waveCount % 2 === 0;
            },
            unitType: FourCC("uobs"),
        },
        //Gargoyles... lol
        {
            quantityPerWave: 1,
            spawnRequirement(waveCount, waveInterval, roundDuration) {
                return currentRound >= 3;
            },
            unitType: FourCC("ugar"),
        },
        //Flesh beetle
        {
            quantityPerWave: 1,
            spawnRequirement(waveCount, waveInterval, roundDuration) {
                return currentRound >=4 && waveCount % 2 === 0;
            },
            unitType: CUSTOM_UNITS.fleshBeetle
        },
        //demonFireArtillery
        {
            quantityPerWave: 1,
            spawnRequirement(waveCount, waveInterval, roundDuration) {
                return currentRound >= 7
            },
            unitType: CUSTOM_UNITS.demonFireArtillery
        },
        //Skeletal Orc Champion
        {
            quantityPerWave: 1 + currentRound,
            spawnRequirement(waveCount, waveInterval, roundDuration) {
                return  currentRound >= 5;
            },
            unitType: FourCC("nsoc"),
        },
        //Pit Lord
        {
            quantityPerWave: currentRound,
            unitType: CUSTOM_UNITS.boss_pitLord,
            spawnRequirement(waveCount, waveInterval, roundDuration) {
                return waveCount === 5 && currentRound > 1; //spawns the wave after 1 minute passes 
            },
            onCreation: (u: Unit | undefined) => {
                if(!u) print("missing unit data in oncreation function");
                if(u && u.isHero()){
                    u.setHeroLevel(currentRound * 2, false);
                    playPitLordSound();
                    // PlaySoundBJ(gg_snd_U08Archimonde19);
                }
                
            }
        },
    ];

    return undeadSpawnData;
}

interface zombieArgs {
    finalWaveTimer: Timer;
    spawnUnitForces: Unit[][];
    forceTargetEffects: Effect[];
    spawnLocationIcons:minimapicon[];
    spawnAttackTargetIcon: minimapicon[];
}

export function setup_zombies(){

    const passByRefArg:zombieArgs ={
        finalWaveTimer: Timer.create(),
        spawnUnitForces: [],
        forceTargetEffects: [],
        spawnLocationIcons: [],
        spawnAttackTargetIcon: [],
    }

    RoundManager.onNightStart((round) => spawnZombies(round, passByRefArg));

    RoundManager.onDayStart(() => {
        cleanupZombies(passByRefArg);
    });
}

/**
 * what happened is we extracted the state from our spawn function to moved it up a level to be accessible outside teh function which means we can now use this state to make a separate cleanup function 
 */
function cleanupZombies(passByRefArg: zombieArgs){
    passByRefArg.spawnLocationIcons.forEach(icon => DestroyMinimapIcon(icon));
    passByRefArg.forceTargetEffects.forEach(eff => eff.destroy());
    passByRefArg.spawnAttackTargetIcon.forEach(icon => DestroyMinimapIcon(icon));

    passByRefArg.spawnUnitForces.forEach(unitForce =>{
        unitForce.forEach((u, index) => {
            //Kill 95% remaining undead units
            if(index/unitForce.length < 0.95){
                u.kill()
            }
            else{
                //Order the rest to attack the capital city
                u.issueOrderAt(OrderId.Attack, 0,0);
            }
        } );
    });

    //Resetting to initial values
    passByRefArg.forceTargetEffects = [];
    passByRefArg.spawnUnitForces = [];
    passByRefArg.spawnLocationIcons = [];
    passByRefArg.spawnAttackTargetIcon = [];
}

/**
 * The number of spawning zombies and which kinds will be determined by the current round number,
 * the number of towns under zombie control and which towns are under their control.
 * 
 * We should also consider the number of players remaining? Or number of players when game started.
 * We are going to want the undead to spawn from multiple locations , with varying size of force 
 * The next step is to choose the points of attacks for zombies.
 * @todo Spawn more zombies if they control towns.
 */
export function spawnZombies(currentRound: number, passByRefArg: zombieArgs) {
    const WAVE_INTERVAL = 15;
    const zombieAttackForces = 2;

    const spawns = chooseZombieSpawns();
    const spawnForceCurrentTarget:Unit[] = [];
    const spawnData :SpawnData[] = createSpawnData(currentRound, spawns.length);
    passByRefArg.spawnUnitForces = spawns.map(_ => []);

    //We want to get the zombies that are stuck in spawn from the previous night and send them with the first wave of the current night

    //Creating minimap icons for spawn locations
    spawns.forEach(spawn => {
        const icon = CreateMinimapIcon(spawn.centerX, spawn.centerY, 255, 255, 255, 'UI\\Minimap\\MiniMap-Boss.mdl', FOG_OF_WAR_FOGGED);
        if(icon){
            passByRefArg.spawnLocationIcons.push(icon);
        }
    });

    //Setup waves
    const waveTimer = Timer.create();
    let waveCount = 0;

    //End the spawning of zombies 1 wave interval before the round ends so zombies aren't spawning at the very end of the round.    
    passByRefArg.finalWaveTimer.start(TimerManager.nightTimeDuration - WAVE_INTERVAL, false, () => {
        // print("destroying wave timer");
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
                    // const units = spawnUndeadUnitType.call(data, data.unitType, data.quantityPerWave, xPos, yPos, data);
                    const units = spawnUndeadUnitType(data.unitType, data.quantityPerWave, xPos, yPos, data);
                    passByRefArg.spawnUnitForces[index].push(...units); 
                    newestSpawnedUnits.push(...units);
                }
                else if(!data.spawnRequirement){
                    const units = spawnUndeadUnitType(data.unitType, data.quantityPerWave, xPos, yPos, data);
                    passByRefArg.spawnUnitForces[index].push(...units); 
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
                    if(passByRefArg.forceTargetEffects[index]) passByRefArg.forceTargetEffects[index].destroy();
                    passByRefArg.forceTargetEffects[index] = effect;

                    effect.scale = 3;
                    effect.setColor(255, 255, 255);
                }
                
                const icon = CreateMinimapIcon(nextTarget.x, nextTarget.y, 255, 100, 50, MinimapIconPath.ping, FOG_OF_WAR_FOGGED);
                
                if(icon) {
                    DestroyMinimapIcon(passByRefArg.spawnAttackTargetIcon[index]);
                    passByRefArg.spawnAttackTargetIcon[index] = icon;
                }
                
                //Only issue order if there was no previous target or the previous target is now invulnerable
                for(let x = 0; x < passByRefArg.spawnUnitForces[index].length; x++){
                    const unit = passByRefArg.spawnUnitForces[index][x];
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

            // print(`Spawn ${index} - Next attack coordinates: (${spawnForceCurrentTarget[index]?.x}, ${spawnForceCurrentTarget[index]?.y})`);
        });

    });
}

function spawnUndeadUnitType(unitType: number, quantity: number, xPos: number, yPos: number, data: SpawnData): Unit[]{
// function spawnUndeadUnitType(unitType: number, quantity: number, xPos: number, yPos: number, onCreation?: (u:Unit) => void): Unit[]{
    const units = [];

    for(let i = 0; i < quantity; i++){
        const u = Unit.create(getNextUndeadPlayer(), unitType, xPos, yPos);

        if(data.onCreation && u){
            data.onCreation(u);
        }

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


/**
 * was designed to randomly choose zombie spawns
 * @param amount 
 * @returns 
 */
function chooseZombieSpawns(): Rectangle[]{
    // const zombieRects = [
    //     // gg_rct_ZombieSpawn1,
    //     gg_rct_zombieSpawn2,
    //     gg_rct_zNorthSpawn1
    // ]

    // // const tempSet = new Set<rect>(zombieSpawnRectangles);
    // const tempSet = new Set<rect>(zombieRects);

    // // print("zombieSpawnRectangles size", zombieSpawnRectangles.length);
    // //Search from our zombie spawns regions and select an amount
    // for(let x = 0; x < amount; x++) {
    //     // const choice = zombieRects[math.random(0,zombieRects.length)];
    //     tempSet.add(zombieRects[x]);
    //     // if(!tempSet.has(choice)){
    //     //     tempSet.add(zombieRects[math.random(0,zombieRects.length)]);
    //     // }
    // }

    // const outgoingSet = new Set<Rectangle>();

    // tempSet.forEach(r => {
    //     const converted = Rectangle.fromHandle(r);
    //     if(converted) outgoingSet.add(converted);
    // })
    const spawns = [];

    //initial spawn
    const zRec = Rectangle.fromHandle(gg_rct_zombieSpawn2);
    if(zRec) spawns.push(zRec);

    if(RoundManager.currentRound >=2){
        const zRec = Rectangle.fromHandle(gg_rct_zNorthSpawn1);
        if(zRec) spawns.push(zRec);
    }

    if(RoundManager.currentRound >=3){
        const zRec = Rectangle.fromHandle(gg_rct_ZombieSpawn1);
        if(zRec) spawns.push(zRec);
    }

    // if(RoundManager.currentRound >=3){
    //     const zRec = Rectangle.fromHandle(gg_rct_ZombieSpawn1);
    //     if(zRec) spawns.push(zRec);
    // }

    if(RoundManager.currentRound >=5){
        const zRec = Rectangle.fromHandle(gg_rct_zWestSpawn1);
        if(zRec) spawns.push(zRec);
    }

    return spawns;

    // return [...outgoingSet];
}
