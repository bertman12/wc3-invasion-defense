import { CUSTOM_UNITS, MinimapIconPath } from "src/shared/enums";
import { RoundManager } from "src/shared/round-manager";
import { primaryAttackTargets } from "src/towns";
import { forEachAlliedPlayer, forEachPlayer, forEachUnitOfPlayer, forEachUnitTypeOfPlayer } from "src/utils/players";
import { Effect, Point, Rectangle, Timer, Trigger, Unit } from "w3ts";
import { OrderId, Players } from "w3ts/globals";

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

//30 seconds being the hard spawn, 15 second intervals being the normal spawn difficulty; maybe fr
const waveIntervalOptions = [15, 30];

const MAX_ZOMBIE_COUNT = 600 as const;

let currentZombieCount = 0;
let currentSpawns: SpawnData[] = [];

/**
 * Runs after map starts
 */
export function setup_undeadSpawn() {
    RoundManager.onNightStart(undeadNightStart);
    RoundManager.onDayStart(undeadDayStart);
}

//This array is empty during runtime because the variables referenced here don't exist when the array is initialized. This is only an issue with generated constants.
// const validUndeadSpawns = [gg_rct_zombieSpawn2, gg_rct_zNorthSpawn1, gg_rct_ZombieSpawn1, gg_rct_zWestSpawn1, gg_rct_zEastCapitalSpawn];

/**
 * Handles zombie spawns each night
 */
function undeadNightStart() {
    const validUndeadSpawns = [gg_rct_zombieSpawn2, gg_rct_zNorthSpawn1, gg_rct_ZombieSpawn1, gg_rct_zWestSpawn1, gg_rct_zEastCapitalSpawn];

    currentZombieCount = 0;

    let spawns: rect[] = [];
    // [2,5] spawns will be chosen
    const spawnCount = 2 + Math.ceil(Math.random() * 3);
    const tempSet = new Set<rect>();

    //Kill any undead leftover from the previous night and daytime
    forEachPlayer((p) => {
        if (!p.isPlayerAlly(Players[0])) {
            forEachUnitOfPlayer(p, (u) => u.issueOrderAt(OrderId.Attack, 0, 0));
        }
    });

    while (tempSet.size !== spawnCount) {
        const randomIndex = Math.floor(Math.random() * validUndeadSpawns.length);
        const chosenSpawn = validUndeadSpawns[randomIndex];

        if (!tempSet.has(chosenSpawn)) {
            tempSet.add(chosenSpawn);
        }
    }

    spawns = [...tempSet];

    const spawnConfigs = spawns.map((zone) => {
        return new SpawnData(zone);
    });

    currentSpawns = spawnConfigs;

    spawnConfigs.forEach((config) => {
        config.startSpawning();
    });
}

function undeadDayStart() {
    currentSpawns.forEach((spawn) => spawn.cleanupSpawn());
    currentSpawns = [];
}

type UnitCategory = "infantry" | "missile" | "caster" | "siege" | "hero";

class SpawnData {
    public spawnRec: Rectangle | undefined;
    //This will determine the wave interval timer, which thus determines units spawned per wave
    private spawnDifficulty = 1;
    private totalSpawnCount = 0;
    //random number from the array;
    public waveIntervalTime = 15;
    private spawnAmountPerWave = 1;

    /**
     * @UndeadSpawnChances
     */
    private readonly TIER_2_MAX_CHANCE = 0.8;
    private readonly TIER_3_MAX_CHANCE = 0.6;
    //These should be the base values for the most spawned unit
    //55% base chance on final night to see Tier 2 units
    private baseTier2Chance = 0.15;
    //Determines how much to increase the tier 2 chance every time tier 2 is not selected
    private readonly tier2ChanceModifier = 0.02;
    private currentTier2Chance = 0.15;
    //25% base chance to see Tier 3 units on final night
    private baseTier3Chance = 0.05;
    //Determines how much to increase the tier 3 chance every time tier 3 is not selected
    private readonly tier3ChanceModifier = 0.01;
    private currentTier3Chance = 0;
    /**
     * @unit_comp_distribution
     * how many of each type of unit are we going to choose?
     */
    private unitCompData = new Map<UnitCategory, number>([
        ["infantry", 1],
        ["missile", 1],
        ["caster", 1],
        ["siege", 1],
        ["hero", 1],
    ]);
    private greatestUnitCountFromAllUnitCategories = 1;
    private units: Unit[] = [];
    public waveTimer: Timer | undefined;
    public currentAttackTarget: Unit | undefined;
    private trig_chooseNextTarget: Trigger | undefined;
    private lastCreatedWaveUnits: Unit[] = [];

    //Special Effects and Icons
    private spawnIcon: minimapicon | undefined;
    private currentTargetSpecialEffect: Effect | undefined;
    private currentTargetMinimapIcon: minimapicon | undefined;

    constructor(spawn: rect) {
        this.spawnRec = Rectangle.fromHandle(spawn);
        this.totalSpawnCount = calcBaseAmountPerWave();

        const difficulty = Math.floor(Math.random() * waveIntervalOptions.length);
        this.spawnDifficulty = difficulty;
        this.waveIntervalTime = waveIntervalOptions[difficulty];
        this.spawnAmountPerWave = this.waveIntervalTime === 15 ? this.totalSpawnCount : this.totalSpawnCount * 1.75;

        this.baseTier2Chance = 0.08 + 0.04 * RoundManager.currentRound;
        this.currentTier2Chance = this.baseTier2Chance;
        this.baseTier3Chance = 0.05 + 0.02 * RoundManager.currentRound;
        this.currentTier3Chance = this.baseTier3Chance;

        this.unitCompData = new Map<UnitCategory, number>([
            ["infantry", Math.ceil(0.775 * this.spawnAmountPerWave)],
            ["missile", Math.ceil(0.1 * this.spawnAmountPerWave)],
            ["caster", Math.ceil(0.1 * this.spawnAmountPerWave)],
            ["siege", Math.ceil(0.025 * this.spawnAmountPerWave)],
            ["hero", Math.ceil(0.015 * this.spawnAmountPerWave)],
        ]);

        // this.unitCompData.forEach((value, key) => {
        //     print(`Category: ${key} - Amount: ${value}`);
        // });

        /**
         * @todo needs to be calculated in the future
         */
        this.greatestUnitCountFromAllUnitCategories = Math.ceil(0.3 * this.spawnAmountPerWave);

        this.spawnIcon = CreateMinimapIcon(this.spawnRec?.centerX ?? 0, this.spawnRec?.centerY ?? 0, 255, 255 - 150 * this.spawnDifficulty, 255 - 255 * this.spawnDifficulty, "UI\\Minimap\\MiniMap-Boss.mdl", FOG_OF_WAR_FOGGED);
    }

    public startSpawning() {
        this.createWaveUnits();
        this.orderNewAttack(this.units);

        const t = Trigger.create();
        this.trig_chooseNextTarget = t;

        t.registerAnyUnitEvent(EVENT_PLAYER_UNIT_DEATH);
        t.registerAnyUnitEvent(EVENT_PLAYER_UNIT_CHANGE_OWNER);

        t.addCondition(() => {
            const u = Unit.fromEvent();

            if (u && u === this.currentAttackTarget) {
                this.orderNewAttack(this.units);
            }

            return false;
        });

        this.waveTimer = Timer.create();
        this.waveTimer.start(this.waveIntervalTime, true, () => {
            this.createWaveUnits();
            this.orderNewAttack(this.lastCreatedWaveUnits);
        });
    }

    public cleanupSpawn() {
        this.units.forEach((u, index) => {
            if (u) {
                if (Math.random() * 100 >= 10) {
                    u.kill();
                }
            }
        });

        this.units.forEach((u) => u.issueOrderAt(OrderId.Attack, 0, 0));

        if (this.spawnIcon) {
            DestroyMinimapIcon(this.spawnIcon);
        }
        if (this.currentTargetMinimapIcon) {
            DestroyMinimapIcon(this.currentTargetMinimapIcon);
        }
        if (this.currentTargetSpecialEffect) {
            this.currentTargetSpecialEffect.destroy();
        }
        if (this.waveTimer) {
            this.waveTimer.destroy();
        }
        if (this.trig_chooseNextTarget) {
            this.trig_chooseNextTarget.destroy();
        }
    }

    private orderNewAttack(attackingUnits: Unit[]) {
        const newTarget = this.chooseForceAttackTarget(Point.create(this.spawnRec?.centerX ?? 0, this.spawnRec?.centerY ?? 0));

        //Check for any idled units from this spawn and order them to attack the next target
        const idledUnits: Unit[] = [];
        if (this.units.length) {
            this.units.forEach((u) => {
                if (u.currentOrder === 0 || u.currentOrder === OrderId.Stop) {
                    idledUnits.push(u);
                }
            });
        }

        if (newTarget && newTarget !== this.currentAttackTarget) {
            //Creates an effect at the target attack point for player to see where the next attack location is
            const effect = Effect.create("Abilities\\Spells\\NightElf\\TrueshotAura\\TrueshotAura.mdl", newTarget.x, newTarget.y);

            if (effect) {
                effect.scale = 3;
                effect.setColor(255, 255, 255);
            }

            //destroy the old effect
            if (this.currentTargetSpecialEffect) {
                this.currentTargetSpecialEffect.destroy();
            }
            this.currentTargetSpecialEffect = effect;

            const icon = CreateMinimapIcon(newTarget.x, newTarget.y, 255, 100, 50, MinimapIconPath.ping, FOG_OF_WAR_FOGGED);
            if (this.currentTargetMinimapIcon) {
                DestroyMinimapIcon(this.currentTargetMinimapIcon);
            }
            this.currentTargetMinimapIcon = icon;
        }

        this.currentAttackTarget = newTarget;

        if (attackingUnits.length) {
            attackingUnits.forEach((u) => {
                u.issueOrderAt(OrderId.Attack, this.currentAttackTarget?.x ?? 0, this.currentAttackTarget?.y ?? 0);
            });
        }

        if (idledUnits.length) {
            idledUnits.forEach((u) => {
                u.issueOrderAt(OrderId.Attack, this.currentAttackTarget?.x ?? 0, this.currentAttackTarget?.y ?? 0);
            });
        }
    }

    public createWaveUnits() {
        const unitsCreatedThisWave: Unit[] = [];

        //sample a random theta from 0 - PI/2
        //sin(theta) is uniformly distributed with a linear rate of change and valid for chance selection. each point on the curve is equally likely to be chosen as any other
        this.unitCompData.forEach((count, category) => {
            for (let x = 0; x < count; x++) {
                //Range [0, PI/2)
                const randomTheta = (Math.random() * Math.PI) / 2;
                //Range [0, 1)
                const sampledValue = Math.sin(randomTheta);

                // print("sampledValue - (1 - count/this.greatestUnitCountFromAllUnitCategories) = ", sampledValue - (1 - count / this.greatestUnitCountFromAllUnitCategories));
                // print("samplevalue: ", sampledValue);
                // print(`(1 - ${count}/${this.greatestUnitCountFromAllUnitCategories}): `, 1 - count / this.greatestUnitCountFromAllUnitCategories);

                // if(sampledValue - (1 - count/this.greatestUnitCountFromAllUnitCategories) <= this.currentTier3Chance){
                if (sampledValue <= this.currentTier3Chance) {
                    //spawn tier 3 unit
                    const u = this.spawnSingleUndeadUnit(category, 2);
                    if (u) {
                        unitsCreatedThisWave.push(u);
                    }
                    // print("Tier 3 chosen with sample value: ", sampledValue);
                    //reset chance to base
                    this.currentTier3Chance = this.baseTier3Chance;
                } else if (sampledValue <= this.currentTier2Chance) {
                    //Tier 3 was not selected, so we must increase the chance to be chosen
                    this.currentTier3Chance += this.tier3ChanceModifier;
                    // print(`Current Tier3 Chance: ${this.currentTier3Chance}`);
                    // print("Tier 2 chosen with sample value: ", sampledValue);

                    //spawn tier 2 unit
                    const u = this.spawnSingleUndeadUnit(category, 1);

                    if (u) {
                        unitsCreatedThisWave.push(u);
                    }

                    this.currentTier2Chance = this.baseTier3Chance;
                } else {
                    //Tier 2 was not selected, so we must increase the chance to be chosen
                    this.currentTier2Chance += this.tier2ChanceModifier;
                    // print(`Current Tier2 Chance: ${this.currentTier2Chance}`);
                    // print("Tier 1 chosen with sample value: ", sampledValue);

                    //spawn a tier 1 unit
                    const u = this.spawnSingleUndeadUnit(category, 0);

                    if (u) {
                        unitsCreatedThisWave.push(u);
                    }
                }
            }

            this.lastCreatedWaveUnits = unitsCreatedThisWave;
        });
    }

    private spawnSingleUndeadUnit(category: UnitCategory, tier: number) {
        if (currentZombieCount >= MAX_ZOMBIE_COUNT) {
            // notifyPlayer("Reached max zombie count!");
            return undefined;
        }

        let unitTypeId = 0;
        const categoryData = unitCategoryData.get(category);

        if (categoryData) {
            const size = Object.values(categoryData)[tier].length;
            const randomIndex = Math.floor(Math.random() * size);
            unitTypeId = Object.values(categoryData)[tier][randomIndex];
        }

        if (!unitTypeId) {
            return undefined;
        }

        const u = Unit.create(getNextUndeadPlayer(), unitTypeId, this.spawnRec?.centerX ?? 0, this.spawnRec?.centerY ?? 0);

        if (u) {
            currentZombieCount++;
            this.units.push(u);
            return u;
        }
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
    private chooseForceAttackTarget(currentPoint: Point): Unit | undefined {
        //So we want to iterate our towns.
        /**
         * @WARNING
         * @REFACTOR
         * this should be choosing a new target from the last target not the spawning point
         */
        let shortestDistance = 99999999;

        let closestCapturableStructure: Unit | undefined = undefined;

        const currLoc = Location(currentPoint.x, currentPoint.y);

        //If y is greater than r*sin(theta) or x is greater than r*cos(theta) then
        primaryAttackTargets.forEach((structureType) => {
            //Checking attack points owned by Allied Human Forces
            forEachAlliedPlayer((p) => {
                forEachUnitTypeOfPlayer(structureType, p, (u) => {
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
        });

        return closestCapturableStructure;

        //If there exists valid attack points in the scanned region, of the valid points, select the closest. Then proceed
    }
}

const unitCategoryData = new Map<UnitCategory, { [key: string]: number[] }>([
    [
        "infantry",
        {
            tierI: [
                CUSTOM_UNITS.zombie,
                //skeletal orc
                FourCC("nsko"),
                //zombies
                //skeleton warriors
            ],
            tierII: [
                CUSTOM_UNITS.skeletalOrcChampion,
                //skeletal orc champion
            ],
            tierIII: [
                CUSTOM_UNITS.abomination,
                //abomination
            ],
        },
    ],
    [
        "missile",
        {
            tierI: [
                CUSTOM_UNITS.skeletalArcher,
                //basic skeleton marksman?
            ],
            tierII: [
                //crypt fiends - maybe they can create eggs which hatch and spawn some spiderlings?
                FourCC("ucry"),
                //some unit that shoots poison
                //skeletal marksman
            ],
            //gargoyle
            tierIII: [FourCC("ugar")],
        },
    ],
    [
        "caster",
        {
            tierI: [
                CUSTOM_UNITS.skeletalFrostMage,
                CUSTOM_UNITS.obsidianStatue,
                //skeletal frost mage
                //obsidian statue
            ],
            tierII: [
                CUSTOM_UNITS.lich,
                CUSTOM_UNITS.necromancer,
                CUSTOM_UNITS.greaterObsidianStatue,
                //necromancer
                //lich
                //greater obsidian statue
            ],
            tierIII: [
                FourCC("uban"),
                //
            ],
        },
    ],
    [
        "siege",
        {
            tierI: [
                CUSTOM_UNITS.meatWagon,
                //meat wagon
            ],
            tierII: [FourCC("ocat")],
            tierIII: [
                FourCC("ninm"),
                //demon fire artillery
            ],
        },
    ],
    [
        "hero",
        {
            tierI: [FourCC("Udre")],
            tierII: [FourCC("Ucrl")],
            tierIII: [CUSTOM_UNITS.boss_pitLord],
        },
    ],
]);

/**
 * Based on the current night, the total number of spawns there will be that night and our max limit on undead units at any given time, and also the number of players playing, we will determine the quantity to spawn.
 * @param totalSpawns
 * @returns
 */
function calcBaseAmountPerWave() {
    let numPlayers = 0;

    forEachAlliedPlayer(() => {
        numPlayers++;
    });
    // print("Number of players: ", numPlayers);

    const enemiesPerWave = 25 + 3 * numPlayers;
    return enemiesPerWave;
}

//Optional set for doing specific things when a specific unit type spawns; like if a special hero spawns you do something cool? or something
const unitTypeSpawnFunctions = new Map<number, () => void>([
    [
        CUSTOM_UNITS.abomination,
        () => {
            print("Special abom function!");
        },
    ],
]);

//eslint fix my code automatically
