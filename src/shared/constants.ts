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
