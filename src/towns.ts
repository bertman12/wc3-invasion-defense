import { Trigger, Unit } from "w3ts";
import { Players } from "w3ts/globals";
import { tColor } from "./utils/misc";

export class TownManager {

}

const capturableTowns = new Set([
    FourCC("h002")
]);

//When a gets down to 10% health, transfer control to undead or humans
export function setup_transferTownControl(){
    const t = Trigger.create();

    t.registerAnyUnitEvent(EVENT_PLAYER_UNIT_ATTACKED);

    t.addCondition(() => {
        const u = Unit.fromEvent();
        const attacker = Unit.fromHandle(GetAttacker());

        if(u && attacker && capturableTowns.has(u.typeId) && u.life < u.maxLife*0.15){
            u.owner = Players[25];
            u.name = `[${tColor("Destroyed", "red")}] - ` + u.name;
            u.invulnerable = true;
        }

        return true;
    });
}