/**
 * We will classify types
 * 
 * Infantry
 * Missile Units
 * Cavalry
 * Caster
 * Siege
 * Hero
 * 
 * I guess a support unit may be in any of these categories
 * 
 * 3 Difficulty Tiers
 * 
 * My goal would be to have unique units for each tier of each category that a player may consider strategies against.
 * Which would mean players are invested into getting certain units. or upgrades?
 * I do like the stock system, it makes units even more valuable since there is a limited amount with a slow replenish time
 * 
 * 
 * doing this means we should make the target choice function occur every 15 seconds, regardless of spawn interval, that way they are not sitting at a dead target for a long time.
 * choose a random spawn interval between 15 , 30, 45, 60 seconds
 * Allocate a specific amount of units for the spawn
 * then distribute the units based on the interval chosen. ex we have 1000 units for a single spawn and 3 intervals, then we must spawn 333 units each spawn interval
 * 
 * the first night will have an undead unit cap set to 300
 * ====
 * 
 * based on the number of players we will determine the number of enemies to spawn
 * so base amount should be 240 and add 30 per player
 *  
 * okay so which units do you add more of?
 * 
 * perhaps the night should determine the amount from which tier should be used.
 * 
 * then the distribution of how many of each category should be used should be static for the whole night. so if we have 10 infantry, 2 missile 1 caster, then it does that all night.
 * 
 * 
 * i would also like to choose an archtype
 * choose this archetype for infantry units of this tier -> skeleton warrior, etc
 * perhaps skeletons have resurrection? 
 *  
*/

import { TimerManager } from "src/shared/Timers";
import { RoundManager } from "src/shared/round-manager";
import { forEachAlliedPlayer } from "src/utils/players";
import { Rectangle, Unit } from "w3ts";
import { Players } from "w3ts/globals";

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

//a spawn should know its max spawn amount and also should know what wave its on and have its config as well.

// spawns should pump out all of their allocated amounts

type UnitCategory = "infantry" | "missile" | "caster" | "siege" | "hero"

class SpawnData {
    public spawnRec: Rectangle | undefined;
    //This will determine the wave interval timer, which thus determines units spawned per wave
    private spawnDifficulty = 1;
    private totalSpawnCount = 0;
    //random number from the array;
    private waveInterval = 15;
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
    
    constructor(spawn: rect){
        this.spawnRec = Rectangle.fromHandle(spawn);
        this.totalSpawnCount = calcBaseAmountPerWave();
        this.waveInterval = Math.floor(Math.random()*waveIntervalOptions.length);
        this.spawnAmountPerWave = this.waveInterval === 15 ? this.totalSpawnCount : this.totalSpawnCount * 1.75;
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

    private spawnUnits(){
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
                    this.spawnUndeadUnit(category, 2);
                    //reset chance to base
                    this.currentTier3Chance = this.baseTier3Chance;
                }else if(sampledValue - (1 - count/this.greatestUnitCountFromAllUnitCategories) <= this.currentTier2Chance){
                    //Tier 3 was not selected, so we must increase the chance to be chosen
                    this.currentTier3Chance += this.tier3ChanceModifier;
                    //spawn tier 2 unit
                    this.spawnUndeadUnit(category, 1);
                }
                else{
                    //Tier 2 was not selected, so we must increase the chance to be chosen
                    this.currentTier2Chance += this.tier2ChanceModifier;
                    
                    //spawn a tier 1 unit
                    this.spawnUndeadUnit(category, 0);
                }
            }
        })
    }

    private spawnUndeadUnit(category: UnitCategory, tier: number){
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
    
        this.units.push();
    }
}

//Should be unique for each spawning point.
function createSpawnConfig(){

    //This will determine the wave interval timer, which thus determines units spawned per wave
    const spawnDifficulty = 1;

    const totalSpawnCount = calcBaseAmountPerWave();
    //random number from the array;
    const waveInterval = Math.floor(Math.random()*waveIntervalOptions.length);

    //Of the units we are allocated, we must choose from our 
                                 
    //the chance to spawn higher tier units increases as you create more units not of that tier, it then resets
    ///also the maount it increases depends on the tier
    //for example, spawn chance for tier 3 would be 10% and increases by 5% every unit spawned, the increased chance should be preserved across wave intervals
    //i suppose its an arbitrary number
    // as the nights go on, we can increase the %chance increase / unit and also increase the base chance as well.
    //which unit category would you choose from? how many per category. you would need to distribute a percentage to each category for spawn choice

    //also depending on the category chosen, perhaps they ought to get a bonus?
    //the category creation is key for making viable unit compositions for undead.

    //lets start with an even distribution

    const spawnAmountPerWave = waveInterval === 15 ? totalSpawnCount : totalSpawnCount * 1.75;

    /**
     * @unit_comp_distribution
     * how many of each type of unit are we going to choose?
     */

    const TIER_2_MAX_CHANCE = 0.80;
    const TIER_3_MAX_CHANCE = 0.60;

    //These should be the base values for the most spawned unit
    //55% base chance on final night to see Tier 2 units
    const baseTier2Chance = 0.15 + 0.04 * RoundManager.currentRound;
    //Determines how much to increase the tier 2 chance every time tier 2 is not selected
    const tier2ChanceModifier = 0.10;
    let currentTier2Chance = baseTier2Chance;
    //25% base chance to see Tier 3 units on final night
    const baseTier3Chance = 0.05 + 0.02 * RoundManager.currentRound;
    //Determines how much to increase the tier 3 chance every time tier 3 is not selected
    const tier3ChanceModifier = 0.05;
    let currentTier3Chance = baseTier3Chance;
    
    const greatestUnitCountFromAllUnitCategories = Math.ceil(0.3*spawnAmountPerWave);
    //loop for each one and add them to the unit group
    const unitCompData = new Map<UnitCategory, number>([
        ["infantry", Math.ceil(0.3*spawnAmountPerWave)],
        ["missile", Math.ceil(0.3*spawnAmountPerWave)],
        ["caster", Math.ceil(0.2*spawnAmountPerWave)],
        ["siege", Math.ceil(0.1*spawnAmountPerWave)],
        ["hero", Math.ceil(0.1*spawnAmountPerWave)],
    ]);

    //sample a random theta from 0 - PI/2
    //sin(theta) is uniformly distributed with a linear rate of change and valid for chance selection. each point on the curve is equally likely to be chosen as any other
    unitCompData.forEach((count, category) => {
        for(let x = 0; x < count; x++){
            //Range [0, PI/2)
            const randomTheta = Math.floor(Math.random()*Math.PI/2)
            //Range [0, 1)
            const sampledValue = Math.sin(randomTheta);
        
            //
            if(sampledValue - (1 - count/greatestUnitCountFromAllUnitCategories) <= currentTier3Chance){
                //spawn tier 3 unit
                spawnUndeadUnit(category, 2);
                //reset chance to base
                currentTier3Chance = baseTier3Chance;
            }else if(sampledValue - (1 - count/greatestUnitCountFromAllUnitCategories) <= currentTier2Chance){
                //Tier 3 was not selected, so we must increase the chance to be chosen
                currentTier3Chance += tier3ChanceModifier;
                //spawn tier 2 unit
                spawnUndeadUnit(category, 1);
            }
            else{
                //Tier 2 was not selected, so we must increase the chance to be chosen
                currentTier2Chance += tier2ChanceModifier;
                
                //spawn a tier 1 unit
                spawnUndeadUnit(category, 0);
            }
        }
    })
}

function spawnUndeadUnit(category: UnitCategory, tier: number){
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

    const u = Unit.create(getNextUndeadPlayer(), unitTypeId, 0,0);

    return u;
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

    //we only care about the current zombie count, not the max zombie count
    //then we still need a way to determine how many zombies to try to spawn from a single spawn point
    const MIN_SPAWN_AMOUNT = 200;

    //the total number to spawn in a given night increases based on the number of zombies
    const totalZombiesToSpawn = (MIN_SPAWN_AMOUNT + 20 * numPlayers );

    //perhaps the difficulty increase of the night should not affect the number of spawn but it should affect the tier of unit chosen for that spawn
    //at any given moment the most units spawning in a single wave interval would be 166 on the first round if 10 players are present. this would spawn from one spawn point.
    // how many intervals would it take to reach the cap? 

    //i dont care about the expected amount of units to come from a spawn, as long as while were creating units for the spawn, we stop once we have reached our undead unit limit, and continue if undead die and free up space
    //so really we want to calculate the number of units spawned every interval
    //the number of units spawned per interval is a product of the number of waves possible in a night , which is based on the spawn interval

    //lets make a formula, that calculates the number of units spawned at the fastest interval, then scale that up for the other greater intervals
    //15sec spawn
    //25 units + 5 * numPlayers
    //25 should be the minimum and then

    //variable wave timers for different spawns gives the impression some areas are more difficult to deal with. which is true. if you are immediately outnumbered your units will take damage faster than if you had fought the large force split up
    const enemiesPerWave = 25 + 3*numPlayers;
    //25 units or 3 * number players
    
    //25 * 4
    return enemiesPerWave;
}

//Optional set for doing specific things when a specific unit type spawns; like if a special hero spawns you do something cool? or something 
const unitTypeSpawnFunctions = new Map<number, () => void>()