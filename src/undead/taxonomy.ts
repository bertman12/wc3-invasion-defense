import { RoundManager } from "src/shared/round-manager";
import { primaryAttackTargets } from "src/towns";
import { forEachAlliedPlayer, forEachUnitTypeOfPlayer } from "src/utils/players";
import { Point, Rectangle, Timer, Trigger, Unit } from "w3ts";
import { OrderId, Players } from "w3ts/globals";

const UNDEAD_PLAYERS = [
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
    let player = UNDEAD_PLAYERS[currentUndeadPlayerIndex];
    
    if(currentUndeadPlayerIndex >= UNDEAD_PLAYERS.length){
        currentUndeadPlayerIndex = 0;
        player = UNDEAD_PLAYERS[currentUndeadPlayerIndex];
    }
    else{
        currentUndeadPlayerIndex++;
    }

    return player;
}

//30 seconds being the hard spawn, 15 second intervals being the normal spawn difficulty; maybe fr
const waveIntervalOptions = [15, 30];

let currentZombieCount = 0;

/**
 * Runs after map starts
 */
function setup_undeadSpawn(){
    RoundManager.onNightStart(undeadNightStart);
}

/**
 * Handles zombie spawns each night
 */
function undeadNightStart(){
    //create our spawn points
    //night timer has already started at this point

    //get our spawns
    const spawnConfigs = [gg_rct_ZombieSpawn1, gg_rct_zombieSpawn2, gg_rct_zNorthSpawn1].map(zone => {
        return new SpawnData(zone);
    });


    // spawnConfigs.forEach(config => {
    //     const waveTimer = Timer.create().start(config.waveIntervalTime, true, config.createWaveUnits);
        

    // });
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
    private readonly TIER_2_MAX_CHANCE = 0.80;
    private readonly TIER_3_MAX_CHANCE = 0.60;
    //These should be the base values for the most spawned unit
    //55% base chance on final night to see Tier 2 units
    private baseTier2Chance = 0.15
    //Determines how much to increase the tier 2 chance every time tier 2 is not selected
    private readonly tier2ChanceModifier = 0.10;
    private currentTier2Chance = 0.15;
    //25% base chance to see Tier 3 units on final night
    private baseTier3Chance = 0.05;
    //Determines how much to increase the tier 3 chance every time tier 3 is not selected
    private readonly tier3ChanceModifier = 0.05;
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
    private units:Unit[] = [];
    public waveTimer: Timer | undefined;
    public currentAttackTarget: Unit | undefined;
    private trig_chooseNextTarget: Trigger | undefined;

    constructor(spawn: rect){
        this.spawnRec = Rectangle.fromHandle(spawn);
        this.totalSpawnCount = calcBaseAmountPerWave();
        this.waveIntervalTime = Math.floor(Math.random()*waveIntervalOptions.length);
        this.spawnAmountPerWave = this.waveIntervalTime === 15 ? this.totalSpawnCount : this.totalSpawnCount * 1.75;
        this.baseTier2Chance = 0.15 + 0.04 * RoundManager.currentRound;
        this.currentTier2Chance = this.baseTier2Chance;
        this.baseTier3Chance = 0.05 + 0.02 * RoundManager.currentRound;
        this.currentTier3Chance = this.baseTier3Chance;
        this.unitCompData = new Map<UnitCategory, number>([
            ["infantry", Math.ceil(0.3*this.spawnAmountPerWave)],
            ["missile", Math.ceil(0.3*this.spawnAmountPerWave)],
            ["caster", Math.ceil(0.2*this.spawnAmountPerWave)],
            ["siege", Math.ceil(0.1*this.spawnAmountPerWave)],
            ["hero", Math.ceil(0.1*this.spawnAmountPerWave)],
        ]);
        this.greatestUnitCountFromAllUnitCategories = Math.ceil(0.3*this.spawnAmountPerWave);
    }

    public startSpawning(){
        this.createWaveUnits();
        this.orderAttack();
        const t = Trigger.create();

        //When we start spawning units, we want to choose our first attack target relative to our spawn point
        const currentAttackPoint = Point.create(this.spawnRec?.centerX ?? 0, this.spawnRec?.centerY ?? 0)
        this.currentAttackTarget = this.chooseForceAttackTarget(currentAttackPoint);

        t.registerAnyUnitEvent(EVENT_PLAYER_UNIT_DEATH);
        t.registerAnyUnitEvent(EVENT_PLAYER_UNIT_CHANGE_OWNER);

        t.addCondition(() => {
            const u = Unit.fromEvent();

            if(u && u === this.currentAttackTarget){
                const currentAttackPoint = Point.create(this.currentAttackTarget?.x ?? this.spawnRec?.centerX, this.currentAttackTarget?.y ?? this.spawnRec?.centerY)

                this.currentAttackTarget = this.chooseForceAttackTarget(currentAttackPoint);
            }

            return false;
        })

        this.waveTimer = Timer.create();
        this.waveTimer.start(this.waveIntervalTime, true, () => {
            this.createWaveUnits();
            this.orderAttack();
        });
    }

    public cleanup(){
        // this.units.forEach(u => {
        //     if(u) u.kill();
        // });
    }

    private orderAttack(){
        // if(this.currentAttackTarget?.isAlive() && ){

        // }
        
        const currentAttackPoint = Point.create(this.currentAttackTarget?.x ?? 0, this.currentAttackTarget?.y ?? 0)



        const newTarget = this.chooseForceAttackTarget(currentAttackPoint);

        this.units.forEach(u => {
            u.issueOrderAt(OrderId.Attack, newTarget?.x ?? 0, newTarget?.y ?? 0);
        })
    }

    public createWaveUnits(){
        //sample a random theta from 0 - PI/2
        //sin(theta) is uniformly distributed with a linear rate of change and valid for chance selection. each point on the curve is equally likely to be chosen as any other
        this.unitCompData.forEach((count, category) => {
            for(let x = 0; x < count; x++){
                //Range [0, PI/2)
                const randomTheta = Math.floor(Math.random()*Math.PI/2)
                //Range [0, 1)
                const sampledValue = Math.sin(randomTheta);
            
                //
                if(sampledValue - (1 - count/this.greatestUnitCountFromAllUnitCategories) <= this.currentTier3Chance){
                    //spawn tier 3 unit
                    this.spawnSingleUndeadUnit(category, 2);
                    //reset chance to base
                    this.currentTier3Chance = this.baseTier3Chance;
                }else if(sampledValue - (1 - count/this.greatestUnitCountFromAllUnitCategories) <= this.currentTier2Chance){
                    //Tier 3 was not selected, so we must increase the chance to be chosen
                    this.currentTier3Chance += this.tier3ChanceModifier;
                    //spawn tier 2 unit
                    this.spawnSingleUndeadUnit(category, 1);
                }
                else{
                    //Tier 2 was not selected, so we must increase the chance to be chosen
                    this.currentTier2Chance += this.tier2ChanceModifier;
                    
                    //spawn a tier 1 unit
                    this.spawnSingleUndeadUnit(category, 0);
                }
            }
        })
    }

    private spawnSingleUndeadUnit(category: UnitCategory, tier: number){
        let unitTypeId = 0;
        const categoryData = unitCategoryData.get(category);
        
        if(categoryData){
            const size = Object.values(categoryData)[tier].length;
            const randomIndex = Math.floor(Math.random()*size);
            unitTypeId = Object.values(categoryData)[tier][randomIndex];
        }
    
        if(!unitTypeId){
            return undefined;
        }
    
        const u = Unit.create(getNextUndeadPlayer(), unitTypeId, this.spawnRec?.centerX ?? 0, this.spawnRec?.centerY ?? 0);
        currentZombieCount++;

        this.units.push();
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
    private chooseForceAttackTarget(currentPoint :Point): Unit | undefined{
       //So we want to iterate our towns.
   
       let shortestDistance = 99999999;
   
       let closestCapturableStructure:Unit | undefined = undefined;
   
       const currLoc = Location(currentPoint.x, currentPoint.y);
   
       //If y is greater than r*sin(theta) or x is greater than r*cos(theta) then
       primaryAttackTargets.forEach(structureType => {
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
}

const unitCategoryData = new Map<UnitCategory, {[key: string]: number[]}>([
    ["infantry", 
        {
            tierI: [
                //zombies
                //skeleton warriors
            ],
            tierII: [
                //skeletal orc champion
            ],
            tierIII: [
                //abomination
            ],
        }
    ],
    ["missile", 
        {
            tierI: [
                //basic skeleton marksman?
            ],
            tierII: [
                //crypt fiends - maybe they can create eggs which hatch and spawn some spiderlings?
                //some unit that shoots poison
                //skeletal marksman
            ],
            tierIII: [
        
            ],
        }
    ],
    ["caster", 
        {
            tierI: [
                //skeletal frost mage
                //obsidian statue
            ],
            tierII: [
                //necromancer
                //lich
                //greater obsidian statue
            ],
            tierIII: [
                //
            ],
        }
    ],
    ["siege", 
        {
            tierI: [
                //meat wagon
            ],
            tierII: [],
            tierIII: [
                //demon fire artillery
            ],
        }
    ],
    ["hero", 
        {
            tierI: [
                // pitlord
            ],
            tierII: [],
            tierIII: [],
        }
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

    const enemiesPerWave = 25 + 3*numPlayers;

    return enemiesPerWave;
}

//Optional set for doing specific things when a specific unit type spawns; like if a special hero spawns you do something cool? or something 
const unitTypeSpawnFunctions = new Map<number, () => void>()

































































































// function spawnUndeadUnit(category: UnitCategory, tier: number){
//     let unitTypeId = 0;
//     const categoryData = unitCategoryData.get(category);
    
//     if(categoryData){
//         const size = Object.values(categoryData)[tier].length;
//         const randomIndex = Math.floor(Math.random()*size);
//         unitTypeId = Object.values(categoryData)[tier][randomIndex];
//     }

//     if(!unitTypeId){
//         return undefined;
//     }

//     const u = Unit.create(getNextUndeadPlayer(), unitTypeId, 0,0);

//     return u;
// }


// //Should be unique for each spawning point.
// function createSpawnConfig(){

//     //This will determine the wave interval timer, which thus determines units spawned per wave
//     const spawnDifficulty = 1;

//     const totalSpawnCount = calcBaseAmountPerWave();
//     //random number from the array;
//     const waveInterval = Math.floor(Math.random()*waveIntervalOptions.length);

//     //Of the units we are allocated, we must choose from our 
                                 
//     //the chance to spawn higher tier units increases as you create more units not of that tier, it then resets
//     ///also the maount it increases depends on the tier
//     //for example, spawn chance for tier 3 would be 10% and increases by 5% every unit spawned, the increased chance should be preserved across wave intervals
//     //i suppose its an arbitrary number
//     // as the nights go on, we can increase the %chance increase / unit and also increase the base chance as well.
//     //which unit category would you choose from? how many per category. you would need to distribute a percentage to each category for spawn choice

//     //also depending on the category chosen, perhaps they ought to get a bonus?
//     //the category creation is key for making viable unit compositions for undead.

//     //lets start with an even distribution

//     const spawnAmountPerWave = waveInterval === 15 ? totalSpawnCount : totalSpawnCount * 1.75;

//     /**
//      * @unit_comp_distribution
//      * how many of each type of unit are we going to choose?
//      */

//     const TIER_2_MAX_CHANCE = 0.80;
//     const TIER_3_MAX_CHANCE = 0.60;

//     //These should be the base values for the most spawned unit
//     //55% base chance on final night to see Tier 2 units
//     const baseTier2Chance = 0.15 + 0.04 * RoundManager.currentRound;
//     //Determines how much to increase the tier 2 chance every time tier 2 is not selected
//     const tier2ChanceModifier = 0.10;
//     let currentTier2Chance = baseTier2Chance;
//     //25% base chance to see Tier 3 units on final night
//     const baseTier3Chance = 0.05 + 0.02 * RoundManager.currentRound;
//     //Determines how much to increase the tier 3 chance every time tier 3 is not selected
//     const tier3ChanceModifier = 0.05;
//     let currentTier3Chance = baseTier3Chance;
    
//     const greatestUnitCountFromAllUnitCategories = Math.ceil(0.3*spawnAmountPerWave);
//     //loop for each one and add them to the unit group
//     const unitCompData = new Map<UnitCategory, number>([
//         ["infantry", Math.ceil(0.3*spawnAmountPerWave)],
//         ["missile", Math.ceil(0.3*spawnAmountPerWave)],
//         ["caster", Math.ceil(0.2*spawnAmountPerWave)],
//         ["siege", Math.ceil(0.1*spawnAmountPerWave)],
//         ["hero", Math.ceil(0.1*spawnAmountPerWave)],
//     ]);

//     //sample a random theta from 0 - PI/2
//     //sin(theta) is uniformly distributed with a linear rate of change and valid for chance selection. each point on the curve is equally likely to be chosen as any other
//     unitCompData.forEach((count, category) => {
//         for(let x = 0; x < count; x++){
//             //Range [0, PI/2)
//             const randomTheta = Math.floor(Math.random()*Math.PI/2)
//             //Range [0, 1)
//             const sampledValue = Math.sin(randomTheta);
        
//             //
//             if(sampledValue - (1 - count/greatestUnitCountFromAllUnitCategories) <= currentTier3Chance){
//                 //spawn tier 3 unit
//                 spawnUndeadUnit(category, 2);
//                 //reset chance to base
//                 currentTier3Chance = baseTier3Chance;
//             }else if(sampledValue - (1 - count/greatestUnitCountFromAllUnitCategories) <= currentTier2Chance){
//                 //Tier 3 was not selected, so we must increase the chance to be chosen
//                 currentTier3Chance += tier3ChanceModifier;
//                 //spawn tier 2 unit
//                 spawnUndeadUnit(category, 1);
//             }
//             else{
//                 //Tier 2 was not selected, so we must increase the chance to be chosen
//                 currentTier2Chance += tier2ChanceModifier;
                
//                 //spawn a tier 1 unit
//                 spawnUndeadUnit(category, 0);
//             }
//         }
//     })
// }