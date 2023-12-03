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

export const unitTypeOwnerBonusMap = new Map<number, number>([
    [UNITS.farmTown, 1],
    [UNITS.lumberMill, 1],
    [UNITS.townHall, 2],
    [UNITS.castle, 3],
]);

export const ownedBuildingUnitBonusMap = new Map<number, { unitType: number; quantity: number }>([
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
