import { player_giveHumansStartOfDayResources, players_nightStart } from "src/players";
import { RoundManager } from "src/shared/round-manager";
import { convertHumanToUndeadStructures, convertUndeadToHumanStructures } from "src/undead/conversion";
import { undeadDayStart, undeadNightStart } from "src/undead/taxonomy";
import { tColor } from "src/utils/misc";
import { Timer, Trigger, Unit } from "w3ts";
import { Players } from "w3ts/globals";

/**
 * Tracks number of undead killed each night.
 */
let undeadDeathCount = 0;
let undeadCountBeforeTriggerKill = 0;
let humanDeathCount = 0;

/**
 * for the purpose of having one function where all start of day and start of night functions are to be called
 */
function hook_startOfDay() {
    RoundManager.onDayStart(() => {
        //Print casualties before undead are killed
        print(`${tColor("Total Human Casualties", "goldenrod")}: ${humanDeathCount}`);
        print(`${tColor("Total Undead Casualties", "goldenrod")}: ${undeadDeathCount}`);
        undeadCountBeforeTriggerKill = undeadDeathCount;

        //Displays where undead will spawn next
        const t = Timer.create();
        t.start(5, false, () => {
            undeadDayStart();
            t.destroy();
        });

        //Convert destroyed undead units into human units
        convertUndeadToHumanStructures();

        //Then do income calculation so players benefit from the converted undead on the same day they are converted
        player_giveHumansStartOfDayResources(RoundManager.currentRound);
    });
}

function hook_startOfNight() {
    RoundManager.onNightStart(() => {
        undeadNightStart();
        convertHumanToUndeadStructures();
        players_nightStart();

        undeadDeathCount = undeadCountBeforeTriggerKill;
    });
}

export function setupNightAndDayHooks() {
    trig_countUndeadCasualties();

    hook_startOfDay();
    hook_startOfNight();
}

//unit number matches an array of ability number the units uses
function trig_countUndeadCasualties() {
    const t = Trigger.create();

    t.registerAnyUnitEvent(EVENT_PLAYER_UNIT_DEATH);

    t.addAction(() => {
        const k = Unit.fromHandle(GetKillingUnit());

        if (k?.owner.isPlayerAlly(Players[0])) {
            undeadDeathCount++;
        } else {
            humanDeathCount++;
        }
    });
}
