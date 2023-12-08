import { UNITS } from "./enums";

export const economicConstants = {
    startingGold: 2000,
    startingLumber: 950,
    baseGoldPerRound: 100,
    baseLumberPerRound: 100,
    goldRoundMultiplier: 50,
    lumberRoundMultiplier: 25,
    lumberProducingAbility: 30,
    goldProducingAbility: 40,
    // suppliesIncomeAbility: 50,
    capitalDailyFoodCapValue: 3,
    granaryFoodCapIncrease: 2,
    grainSiloFoodBonus: 5,
} as const;

export const buildingOwnerIncomeBonusMap = new Map<number, number>([
    [UNITS.farmTown, 1],
    [UNITS.lumberMill, 1],
    [UNITS.townHall, 2],
    [UNITS.castle, 3],
]);

export const buildingOwnerDailyUnitBonusMap = new Map<number, { unitType: number; quantity: number }>([
    [UNITS.farmTown, { unitType: UNITS.militia, quantity: 3 }],
    [UNITS.townHall, { unitType: UNITS.footman, quantity: 6 }],
    [UNITS.castle, { unitType: UNITS.knight, quantity: 6 }],
    [UNITS.citadelOfTheNorthernKnights, { unitType: UNITS.heavyCavalry, quantity: 5 }],
]);

/**
 * map unit sold to the unit the will transfer ownership
 *
 * then we only need one function to handle this behavior as long as it do so according to the map
 */
export const ownershipGrantingUnits = new Map<number, number>([
    [UNITS.farmTown, UNITS.farmGrant],
    [UNITS.townHall, UNITS.townGrant],
    [UNITS.castle, UNITS.castleGrant],
    [UNITS.lumberMill, UNITS.lumberMillGrant],
    [UNITS.citadelOfTheNorthernKnights, UNITS.title_duchyOfTheNorthernKnights],
]);

/**
 * Structures whose effects are granted for a specific duration of days
 *
 * Some will grant gold until they have fully progressed, while other will provide food until they have fully progressed
 */
export const dailyProgressStructures: DailyProgressUnitConfig[] = [
    {
        unitTypeCode: UNITS.peonLaborer,
        goldCostMultiplierAward: 1.3,
        maxDuration: 2,
    },
    {
        unitTypeCode: UNITS.humanLaborer,
        goldCostMultiplierAward: 1.7,
        maxDuration: 4,
    },
    {
        unitTypeCode: UNITS.druidLaborer,
        goldCostMultiplierAward: 2.2,
        maxDuration: 5,
    },
    {
        unitTypeCode: UNITS.acolyteSlaveLaborer,
        goldCostMultiplierAward: 1.1,
        maxDuration: 1,
    },
    {
        unitTypeCode: UNITS.grainSilo,
        goldCostMultiplierAward: 0,
        maxDuration: 5,
        //onCompletion ... do something maybe different for different structures
    },
];

interface DailyProgressUnitConfig {
    unitTypeCode: number;
    goldCostMultiplierAward: number;
    maxDuration: number;
}
