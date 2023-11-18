import { Effect, Point, Rectangle, Timer, Unit } from "w3ts";
import { OrderId, Players } from "w3ts/globals";
import { TimerManager } from "../shared/Timers";
import { CUSTOM_UNITS, MinimapIconPath } from "../shared/enums";
import { RoundManager } from "../shared/round-manager";
import { primaryAttackTargets } from "../towns";
import { forEachUnitTypeOfPlayer } from "../utils/players";

/**
 * A smart undead spawning system will choose from a pool of available units
 * max is 1k units
 *
 * should choose from a pool of units
 * depending on the round number we may choose certain units
 * a simple alg would say create 5 units
 *
 * i could attribute points to unit types
 * i could also classify units into tiers and allocate points to be used for each tier
 * that would ensure certain unit compositions are always present
 *
 * how to choose how many points to give to the undead player?
 * would having to many points mean that now many low tier units would be used?
 *
 *
 * what unit categories will I have? caster, infantry, missile units, hero units, i guess it would be granted a random pool for each tier and category
 *
 *
 * Perhaps each spawn is allocated a number of units and depending on the number of players the number of units will change, and time between spawns will be directly proportional to the units that were spawned, so things aer still balanced. and of course clamp the unit spawn amount
 */

/**
 * we want the undead to scale with the number of players
 * The force strength per spawn point
 * also the night
 * should we just randomly choose units? and then define rules for how many units are chosen from which tiers based on the above factors
 *
 * I want there to be different archtypes for certain spawns, like demons only or skeletons only or something else.
 * I want to classify undead also. perhaps 3 difficulty tiers
 *
 * you could sample a random theta on a sin curve and if our random number
 * this group will be chosen if sin(theta) of our random theta is greater than or equal to this chance number
 */

const archTypes = {
    demon: { chance: 0, unitSet: [] },
};

const zombieMapPlayer = Players[20];

const zombieSpawnRectangles: rect[] = [gg_rct_ZombieSpawn1, gg_rct_zombieSpawn2];

const UNDEAD_MAX_UNIT_LIMIT = 1000;

const UNDEAD_PLAYERS = [Players[10], Players[12], Players[13], Players[14], Players[15], Players[16], Players[17], Players[20], Players[21], Players[22], Players[23]];

let currentUndeadPlayerIndex = 0;

/**
 * Cycles all players from the undead player array then restarts once it goes through all players
 */
function getNextUndeadPlayer() {
    let player = UNDEAD_PLAYERS[currentUndeadPlayerIndex];

    if (currentUndeadPlayerIndex >= UNDEAD_PLAYERS.length) {
        currentUndeadPlayerIndex = 0;
        player = UNDEAD_PLAYERS[currentUndeadPlayerIndex];
    } else {
        currentUndeadPlayerIndex++;
    }

    return player;
}

function playPitLordSound() {
    PlaySoundBJ(gg_snd_U08Archimonde19);
}

interface SpawnData {
    unitType: number;
    quantityPerWave: number;
    /**
     * For deciding when to spawn
     */
    spawnRequirement?: (waveCount: number, waveInterval: number, roundDuration: number) => boolean;
    onCreation?: (u: Unit) => void;
}

function createSpawnData(currentRound: number, spawnCount: number): SpawnData[] {
    //could make spawn quantity cyclic with trig functions

    /**
     * 20z a wave
     * 4 waves/min
     * 12 waves total
     * 240 zombies /spawn
     */
    const spawnModifier = 4 / spawnCount - 1;

    const undeadSpawnData: SpawnData[] = [
        //Abomination
        {
            quantityPerWave: 1,
            unitType: FourCC("uabo"),
            spawnRequirement(waveCount: number, waveInterval: number, roundDuration: number) {
                return waveCount * waveInterval >= roundDuration * 0.35;
            },

            //unitModification: (u: Unit) => void -- use this function to adjust the unit stats in some way, probably based on round or buildings captured etc.
        },
        //Meat Wagon
        {
            quantityPerWave: 1,
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
        //Necromancers -special
        {
            quantityPerWave: 1,
            spawnRequirement(waveCount, waveInterval, roundDuration) {
                return currentRound >= 2;
            },
            unitType: FourCC("u001"),
        },
        //Skeletal Archers
        {
            quantityPerWave: 2,
            unitType: FourCC("nskm"),
        },
        //Zombie
        {
            quantityPerWave: 1,
            unitType: FourCC("nzom"),
        },
        //Lich Unit
        {
            quantityPerWave: 1,
            unitType: FourCC("u004"),
            spawnRequirement(waveCount, waveInterval, roundDuration) {
                return currentRound >= 6;
            },
        },
        //Obsidian Statues
        {
            quantityPerWave: 1,
            spawnRequirement(waveCount, waveInterval, roundDuration) {
                return waveCount % 2 === 0;
            },
            unitType: FourCC("uobs"),
        },
        //Greater Obsidian Statues
        {
            quantityPerWave: 1,
            spawnRequirement(waveCount, waveInterval, roundDuration) {
                return waveCount % 4 === 0 && currentRound >= 4;
            },
            unitType: FourCC("u003"),
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
                return currentRound >= 4 && waveCount % 2 === 0;
            },
            unitType: CUSTOM_UNITS.fleshBeetle,
        },
        //demonFireArtillery
        {
            quantityPerWave: 1,
            spawnRequirement(waveCount, waveInterval, roundDuration) {
                return currentRound >= 9 && waveCount === 1;
            },
            unitType: CUSTOM_UNITS.demonFireArtillery,
        },
        //Skeletal Orc Champion
        {
            quantityPerWave: 1,
            spawnRequirement(waveCount, waveInterval, roundDuration) {
                return currentRound >= 5;
            },
            unitType: FourCC("nsoc"),
        },
        //Pit Lord
        {
            quantityPerWave: 1,
            unitType: CUSTOM_UNITS.boss_pitLord,
            spawnRequirement(waveCount, waveInterval, roundDuration) {
                return waveCount === 5 && currentRound > 1; //spawns the wave after 1 minute passes
            },
            onCreation: (u: Unit | undefined) => {
                if (!u) {
                    print("missing unit data in oncreation function");
                }
                if (u && u.isHero()) {
                    u.setHeroLevel(currentRound * 2, false);
                    playPitLordSound();
                }
            },
        },
    ];

    return undeadSpawnData;
}

interface zombieArgs {
    finalWaveTimer: Timer;
    spawnUnitForces: Unit[][];
    forceTargetEffects: Effect[];
    spawnLocationIcons: minimapicon[];
    spawnAttackTargetIcon: minimapicon[];
}

export function setup_zombies() {
    const passByRefArg: zombieArgs = {
        finalWaveTimer: Timer.create(),
        spawnUnitForces: [],
        forceTargetEffects: [],
        spawnLocationIcons: [],
        spawnAttackTargetIcon: [],
    };

    RoundManager.onNightStart((round) => spawnZombies(round, passByRefArg));

    RoundManager.onDayStart(() => {
        cleanupZombies(passByRefArg);
    });
}

/**
 * what happened is we extracted the state from our spawn function to moved it up a level to be accessible outside teh function which means we can now use this state to make a separate cleanup function
 */
function cleanupZombies(passByRefArg: zombieArgs) {
    passByRefArg.spawnLocationIcons.forEach((icon) => DestroyMinimapIcon(icon));
    passByRefArg.forceTargetEffects.forEach((eff) => eff.destroy());
    passByRefArg.spawnAttackTargetIcon.forEach((icon) => DestroyMinimapIcon(icon));

    passByRefArg.spawnUnitForces.forEach((unitForce) => {
        unitForce.forEach((u, index) => {
            u.kill();

            // //Kill 95% remaining undead units
            // if(index/unitForce.length < 0.95){
            //     u.kill()
            // }
            // else{
            //     //Order the rest to attack the capital city
            //     u.issueOrderAt(OrderId.Attack, 0,0);
            // }
        });
    });

    //Resetting to initial values
    passByRefArg.forceTargetEffects = [];
    passByRefArg.spawnUnitForces = [];
    passByRefArg.spawnLocationIcons = [];
    passByRefArg.spawnAttackTargetIcon = [];
}

let totalZombieCount = 0;

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
    totalZombieCount = 0;

    const spawns = chooseZombieSpawns();
    const spawnForceCurrentTarget: Unit[] = [];
    const spawnData: SpawnData[] = createSpawnData(currentRound, spawns.length);
    passByRefArg.spawnUnitForces = spawns.map((_) => []);

    //We want to get the zombies that are stuck in spawn from the previous night and send them with the first wave of the current night

    //Creating minimap icons for spawn locations
    spawns.forEach((spawn) => {
        const icon = CreateMinimapIcon(spawn.centerX, spawn.centerY, 255, 0, 0, "UI\\Minimap\\MiniMap-Boss.mdl", FOG_OF_WAR_FOGGED);

        if (icon) {
            passByRefArg.spawnLocationIcons.push(icon);
        }
    });

    //Setup waves
    const waveTimer = Timer.create();
    let waveCount = 0;

    //End the spawning of zombies 1 wave interval before the round ends so zombies aren't spawning at the very end of the round.
    passByRefArg.finalWaveTimer.start(TimerManager.nightTimeDuration - WAVE_INTERVAL, false, () => {
        waveTimer.destroy();
    });

    /**
     * Handles spawning waves of enemies
     */
    waveTimer.start(WAVE_INTERVAL, true, () => {
        waveCount++;
        spawns.forEach((spawn, index) => {
            const newestSpawnedUnits: Unit[] = [];

            const xPos = spawn.centerX;
            const yPos = spawn.centerY;

            //Creating the undead units
            spawnData.forEach((data) => {
                if (data.spawnRequirement && data.spawnRequirement(waveCount, WAVE_INTERVAL, TimerManager.nightTimeDuration)) {
                    const units = spawnUndeadUnitType(data.unitType, data.quantityPerWave, xPos, yPos, data);
                    passByRefArg.spawnUnitForces[index].push(...units);
                    newestSpawnedUnits.push(...units);
                } else if (!data.spawnRequirement) {
                    const units = spawnUndeadUnitType(data.unitType, data.quantityPerWave, xPos, yPos, data);
                    passByRefArg.spawnUnitForces[index].push(...units);
                    newestSpawnedUnits.push(...units);
                }
            });

            //We use the previous target position to find the next closest target, otherwise if none existed before, we use the spawn location to find the next closest attack point.
            const previousTargetPoint = spawnForceCurrentTarget[index] ? Point.create(spawnForceCurrentTarget[index].x, spawnForceCurrentTarget[index].y) : Point.create(xPos, yPos);
            const nextTarget = chooseForceAttackTarget(previousTargetPoint);

            let isTargetNew = false;
            //If there was no previous target then set the target for that spawn force OR if the old target is now invulnerable, we will make a new target and send the units to attack that region.
            if (nextTarget && (!spawnForceCurrentTarget[index] || spawnForceCurrentTarget[index].invulnerable === true || !spawnForceCurrentTarget[index].isAlive())) {
                isTargetNew = true;
                spawnForceCurrentTarget[index] = nextTarget;
                const currentTarget = spawnForceCurrentTarget[index];

                //Creates an effect at the target attack point for player to see where the next attack location is
                const effect = Effect.create("Abilities\\Spells\\NightElf\\TrueshotAura\\TrueshotAura.mdl", currentTarget.x, currentTarget.y);
                if (effect) {
                    if (passByRefArg.forceTargetEffects[index]) {
                        passByRefArg.forceTargetEffects[index].destroy();
                    }
                    passByRefArg.forceTargetEffects[index] = effect;

                    effect.scale = 3;
                    effect.setColor(255, 255, 255);
                }

                const icon = CreateMinimapIcon(nextTarget.x, nextTarget.y, 255, 100, 50, MinimapIconPath.ping, FOG_OF_WAR_FOGGED);

                if (icon) {
                    DestroyMinimapIcon(passByRefArg.spawnAttackTargetIcon[index]);
                    passByRefArg.spawnAttackTargetIcon[index] = icon;
                }

                //Since a new target was chosen all attackers from the previous wave will be ordered to attack the new point.
                for (let x = 0; x < passByRefArg.spawnUnitForces[index].length; x++) {
                    const unit = passByRefArg.spawnUnitForces[index][x];
                    unit.issuePointOrder(OrderId.Attack, Point.create(currentTarget?.x ?? 0, currentTarget?.y ?? 0));
                }
            }

            //Always order the newest units created to go attack the current target
            if (!isTargetNew) {
                newestSpawnedUnits.forEach((unit) => {
                    unit.issuePointOrder(OrderId.Attack, Point.create(spawnForceCurrentTarget[index]?.x ?? 0, spawnForceCurrentTarget[index]?.y ?? 0));
                });
            }
        });
    });
}

function spawnUndeadUnitType(unitType: number, quantity: number, xPos: number, yPos: number, data: SpawnData): Unit[] {
    const units = [];

    // if(totalZombieCount >= UNDEAD_MAX_UNIT_LIMIT) print("Reached max zombie limit!");

    for (let i = 0; i < quantity && totalZombieCount <= UNDEAD_MAX_UNIT_LIMIT; i++) {
        const u = Unit.create(getNextUndeadPlayer(), unitType, xPos, yPos);

        if (data.onCreation && u) {
            data.onCreation(u);
        }

        if (u) {
            totalZombieCount++;
            units.push(u);
        }
        // else{
        //     print("Unable to create unit")
        // }
    }

    // print("totalZombieCount: ", totalZombieCount)
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
function chooseForceAttackTarget(currentPoint: Point): Unit | null {
    //So we want to iterate our towns.

    let shortestDistance = 99999999;

    let closestCapturableStructure: Unit | null = null;

    const currLoc = Location(currentPoint.x, currentPoint.y);

    //If y is greater than r*sin(theta) or x is greater than r*cos(theta) then
    primaryAttackTargets.forEach((structureType) => {
        //Checking attack points owned by Allied Human Forces
        forEachUnitTypeOfPlayer(structureType, Players[9], (u) => {
            //Dont check neutral units
            const locU = Location(u.x, u.y);
            const dist = DistanceBetweenPoints(currLoc, locU);

            //Choose the point closest to the current attack point
            if (dist < shortestDistance) {
                shortestDistance = dist;
                closestCapturableStructure = u;
            }
        });
    });

    return closestCapturableStructure;

    //If there exists valid attack points in the scanned region, of the valid points, select the closest. Then proceed
}

/**
 * was designed to randomly choose zombie spawns
 * @param amount
 * @returns
 */
function chooseZombieSpawns(): Rectangle[] {
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
    if (zRec) {
        spawns.push(zRec);
    }

    if (RoundManager.currentRound >= 2) {
        const zRec = Rectangle.fromHandle(gg_rct_zNorthSpawn1);
        if (zRec) {
            spawns.push(zRec);
        }
    }

    if (RoundManager.currentRound >= 3) {
        const zRec = Rectangle.fromHandle(gg_rct_ZombieSpawn1);
        if (zRec) {
            spawns.push(zRec);
        }
    }

    // if(RoundManager.currentRound >=3){
    //     const zRec = Rectangle.fromHandle(gg_rct_ZombieSpawn1);
    //     if(zRec) spawns.push(zRec);
    // }

    if (RoundManager.currentRound >= 5) {
        const zRec = Rectangle.fromHandle(gg_rct_zWestSpawn1);
        if (zRec) {
            spawns.push(zRec);
        }
    }

    if (RoundManager.currentRound >= 7) {
        const zRec = Rectangle.fromHandle(gg_rct_zEastCapitalSpawn);
        if (zRec) {
            spawns.push(zRec);
        }
    }

    return spawns;

    // return [...outgoingSet];
}
