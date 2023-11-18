import { Trigger, Unit } from "w3ts";
import { Players } from "w3ts/globals";
import { CUSTOM_UNITS } from "./shared/enums";
import { tColor } from "./utils/misc";

export const primaryAttackTargets = new Set([
    CUSTOM_UNITS.farmTown,
    CUSTOM_UNITS.barracks,
    CUSTOM_UNITS.blacksmith,
    CUSTOM_UNITS.castle,
    CUSTOM_UNITS.townHall,
    CUSTOM_UNITS.capital,
    CUSTOM_UNITS.arcaneSanctum,
    CUSTOM_UNITS.granary,
    CUSTOM_UNITS.lumberMill,
    CUSTOM_UNITS.citadelOfTheNorthernKnights,
]);

export const otherStructures = new Set([CUSTOM_UNITS.cannonTower, CUSTOM_UNITS.guardTower, CUSTOM_UNITS.rampartCannonTower, CUSTOM_UNITS.rampartGuardTower]);

export const allDestroyableStructures = new Set([...primaryAttackTargets, ...otherStructures]);

//When a gets down to 20% health, transfer control to undead or humans
export function trig_destroyHumanBuilding() {
    const t = Trigger.create();

    t.registerAnyUnitEvent(EVENT_PLAYER_UNIT_ATTACKED);

    t.addCondition(() => {
        const u = Unit.fromEvent();
        const attacker = Unit.fromHandle(GetAttacker());

        if (u && attacker && allDestroyableStructures.has(u.typeId) && u.life < u.maxLife * 0.25) {
            u.owner = Players[25]; //Neutral
            u.name = `[${tColor("Destroyed", "red")}] - ` + u.name;
            u.invulnerable = true;
        }

        return true;
    });
}
