import { player_giveHumansStartOfDayResources, players_nightStart } from "src/players";
import { RoundManager } from "src/shared/round-manager";

/**
 * for the purpose of having one function where all start of day and start of night functions are to be called
 */
function hook_startOfDay() {
    RoundManager.onDayStart(() => {
        //Convert destroyed undead units into human units

        //Then do income calculation so players benefit from the converted undead on the same day they are converted
        player_giveHumansStartOfDayResources(RoundManager.currentRound);
    });
}

function hook_startOfNight() {
    RoundManager.onNightStart(() => {
        players_nightStart();
    });
}

export function setupNightDayHooks() {
    hook_startOfDay();
    hook_startOfNight();
}
