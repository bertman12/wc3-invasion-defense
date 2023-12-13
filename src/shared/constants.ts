import { useTempEffect } from "src/utils/misc";
import { adjustGold } from "src/utils/players";
import { Effect, MapPlayer, Unit } from "w3ts";
import { UNITS, UpgradeCodes } from "./enums";
import { playerStates } from "./playerState";

export const economicConstants = {
    playerBaseFoodCap: 25,
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
    [UNITS.farmTown, { unitType: UNITS.militia, quantity: 2 }],
    [UNITS.townHall, { unitType: UNITS.footman, quantity: 6 }],
    [UNITS.castle, { unitType: UNITS.knight, quantity: 6 }],
    [UNITS.citadelOfTheNorthernKnights, { unitType: UNITS.heavyCavalry, quantity: 5 }],
]);

export const improvedLeviesUnitBonus = new Map<number, number>([
    [UNITS.militia, 2],
    [UNITS.footman, 2],
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

interface DailyProgressUnitConfig {
    unitTypeCode: number;
    goldCostMultiplierAward: number;
    maxDuration: number;
    onCompletion?: DailyProgressCompletionFn;
}

type DailyProgressCompletionFn = (player: MapPlayer, unit: Unit, config: DailyProgressUnitConfig) => void;

const laborerCompletionFn = (player: MapPlayer, unit: Unit, config: DailyProgressUnitConfig) => {
    useTempEffect(Effect.createAttachment("Abilities\\Spells\\Other\\Transmute\\PileofGold.mdl", unit, "origin"), 3);

    const unitGoldCost = GetUnitGoldCost(config.unitTypeCode);
    const goldAwarded = unitGoldCost * config.goldCostMultiplierAward;

    adjustGold(unit.owner, goldAwarded);
};

/**
 * Structures whose effects are granted for a specific duration of days
 *
 * Some will grant gold until they have fully progressed, while other will provide food until they have fully progressed
 */
export const dailyProgressStructures: DailyProgressUnitConfig[] = [
    //Doesnt work for some fucking reason
    // {
    //     unitTypeCode: UNITS.peonLaborer,
    //     goldCostMultiplierAward: 1.3,
    //     maxDuration: 2,
    //     onCompletion: laborerCompletionFn,
    // },
    {
        unitTypeCode: UNITS.humanLaborer,
        goldCostMultiplierAward: 1.7,
        maxDuration: 4,
        onCompletion: laborerCompletionFn,
    },
    {
        unitTypeCode: UNITS.druidLaborer,
        goldCostMultiplierAward: 2.2,
        maxDuration: 5,
        onCompletion: laborerCompletionFn,
    },
    {
        unitTypeCode: UNITS.acolyteSlaveLaborer,
        goldCostMultiplierAward: 1.1,
        maxDuration: 1,
        onCompletion: laborerCompletionFn,
    },
    {
        unitTypeCode: UNITS.grainSilo,
        goldCostMultiplierAward: 0,
        maxDuration: 3,
        onCompletion: (player, unit, config) => {
            const foodPreservation = GetPlayerTechCount(player?.handle, UpgradeCodes.foodPreservation, true);

            if (foodPreservation == 1) {
                const playerState = playerStates.get(player.id);

                if (playerState) {
                    playerState.permanentFoodCapIncrease++;
                    useTempEffect(Effect.create("Objects\\Spawnmodels\\NightElf\\EntBirthTarget\\EntBirthTarget.mdl", unit.x, unit.y));
                }
            }
        },
    },
];
