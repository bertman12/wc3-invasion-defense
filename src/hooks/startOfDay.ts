import { player_giveHumansStartOfDayResources, players_nightStart } from "src/players";
import { RoundManager } from "src/shared/round-manager";
import { convertHumanToUndeadStructures, convertUndeadToHumanStructures } from "src/undead/conversion";
import { undeadDayStart, undeadNightStart } from "src/undead/taxonomy";

/**
 * for the purpose of having one function where all start of day and start of night functions are to be called
 */
function hook_startOfDay() {
    RoundManager.onDayStart(() => {
        undeadDayStart();
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
    });
}

export function setupNightAndDayHooks() {
    hook_startOfDay();
    hook_startOfNight();
}
