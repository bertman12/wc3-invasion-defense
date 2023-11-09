import { Trigger, Unit } from "w3ts";
import { Players } from "w3ts/globals";
import { tColor } from "./utils/misc";
import { CUSTOM_UNITS } from "./shared/enums";

export class TownManager {

}

export const primaryCapturableStructures = new Set([
    CUSTOM_UNITS.farmTown,
    CUSTOM_UNITS.barracks,
    CUSTOM_UNITS.blacksmith,
    CUSTOM_UNITS.castle,
    CUSTOM_UNITS.townHall,
    CUSTOM_UNITS.capital,
    CUSTOM_UNITS.arcaneSanctum,
    CUSTOM_UNITS.granary,
    CUSTOM_UNITS.lumberMill,
]);

export const secondaryCapturableStructures = new Set([
    CUSTOM_UNITS.cannonTower,
    CUSTOM_UNITS.guardTower,
    CUSTOM_UNITS.rampartCannonTower,
    CUSTOM_UNITS.rampartGuardTower,
]);

export const allCapturableStructures = new Set([
    ...primaryCapturableStructures,
    ...secondaryCapturableStructures
]);

//When a gets down to 10% health, transfer control to undead or humans
export function setup_transferTownControl(){
    const t = Trigger.create();

    t.registerAnyUnitEvent(EVENT_PLAYER_UNIT_ATTACKED);

    t.addCondition(() => {
        const u = Unit.fromEvent();
        const attacker = Unit.fromHandle(GetAttacker());

        if(u && attacker && allCapturableStructures.has(u.typeId) && u.life < u.maxLife*0.20){
            // u.owner = Players[20]; //Undead
            u.owner = Players[25]; //Neutral
            u.name = `[${tColor("Destroyed", "red")}] - ` + u.name;
            u.invulnerable = true;
        }

        return true;
    });
}