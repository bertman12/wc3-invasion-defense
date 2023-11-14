import { Trigger, Unit } from "w3ts";
import { Players } from "w3ts/globals";
import { RoundManager } from "./round-manager";
import { tColor } from "src/utils/misc";

export const unitTypeAbilities = new Map<number, ability[]>();
/**
 * Tracks number of undead killed each night.
 */
let undeadDeathCount = 0;
let humanDeathCount = 0;

//unit number matches an array of ability number the units uses
function trig_countUndeadCasualties(){
    const t = Trigger.create();

    t.registerAnyUnitEvent(EVENT_PLAYER_UNIT_DEATH);

    t.addAction(() => {
        const k = Unit.fromHandle(GetKillingUnit());

        if(k?.owner.isPlayerAlly(Players[0])){
            undeadDeathCount++;
        }
        else{
            humanDeathCount++;
        }
    });

}

export function setup_reportCasualtyCounts(){
    trig_countUndeadCasualties();
    RoundManager.onDayStart(() => {
        print(`${tColor('Human Casualties', "goldenrod")}: ${humanDeathCount}`);
        print(`${tColor('Undead Casualties', "goldenrod")}: ${undeadDeathCount}`);
    })

    RoundManager.onNightStart(() => {
        humanDeathCount = 0;
        undeadDeathCount = 0;
    })
}