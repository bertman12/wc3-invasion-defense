import { UNITS } from "src/shared/enums";
import { useTempEffect } from "src/utils/misc";
import { adjustGold } from "src/utils/players";
import { Effect, MapPlayer, Trigger, Unit } from "w3ts";

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
    unit.mana = 0;
};

// export function updateDayProgressForDependents() {
//     forEachAlliedPlayer((p) => {
//         dailyProgressStructures.forEach((config) => {
//             forEachUnitTypeOfPlayer(config.unitTypeCode, p, (u) => {
//                 u.mana++;

//                 if (u.mana >= config.maxDuration) {
//                     if (config.onCompletion) {
//                         config.onCompletion(u.owner, u, config);
//                     }
//                 }
//             });
//         });
//     });
// }

/**
 * Structures whose effects are granted for a specific duration of days
 *
 * Some will grant gold until they have fully progressed, while other will provide food until they have fully progressed
 */
const dailyProgressStructures: DailyProgressUnitConfig[] = [
    // {
    //     unitTypeCode: UNITS.grainSilo,
    //     goldCostMultiplierAward: 0,
    //     maxDuration: 3,
    //     onCompletion: (player, unit, config) => {
    //         const foodPreservation = GetPlayerTechCount(player?.handle, UpgradeCodes.foodPreservation, true);
    //         if (foodPreservation == 1) {
    //             const playerState = playerStates.get(player.id);
    //             if (playerState) {
    //                 playerState.permanentFoodCapIncrease++;
    //                 useTempEffect(Effect.create("Objects\\Spawnmodels\\NightElf\\EntBirthTarget\\EntBirthTarget.mdl", unit.x, unit.y));
    //             }
    //             //Resets mana so
    //             unit.mana = 0;
    //         }
    //     },
    // },
];

export function laborerBuilt() {
    const t = Trigger.create();
    t.registerAnyUnitEvent(EVENT_PLAYER_UNIT_CONSTRUCT_FINISH);
    t.addAction(() => {
        const u = Unit.fromEvent();

        if (u && u.typeId === UNITS.druidLaborer) {
            const trig = Trigger.create();
            // u.setAnimation("channel");
            u.addAnimationProps("channel", true);

            trig.registerUnitStateEvent(u, UNIT_STATE_MANA, GREATER_THAN_OR_EQUAL, u.maxMana);

            trig.addAction(() => {
                useTempEffect(Effect.createAttachment("Abilities\\Spells\\Other\\Transmute\\PileofGold.mdl", u, "origin"), 3);

                const goldAwarded = 45;

                adjustGold(u.owner, goldAwarded);
                u.mana = 0;
            });
        }
    });
}
