import { UNITS } from "./enums";

export const economicConstants = {
    startingFood: 18,
    startingGold: 2550,
    startingLumber: 1650,
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
    [UNITS.farmTown, { unitType: UNITS.militia, quantity: 0 }],
    [UNITS.townHall, { unitType: UNITS.footman, quantity: 0 }],
    [UNITS.castle, { unitType: UNITS.knight, quantity: 6 }],
    [UNITS.citadelOfTheNorthernKnights, { unitType: UNITS.heavyCavalry, quantity: 5 }],
]);

export const improvedLeviesUnitBonus = new Map<number, number>([
    [UNITS.militia, 2],
    [UNITS.footman, 6],
    [UNITS.knight, 2],
    [UNITS.heavyCavalry, 2],
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

