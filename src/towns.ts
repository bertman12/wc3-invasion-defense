import { UNITS } from "./shared/enums";

export const primaryCapturableHumanTargets = new Set([
    // UNITS.farmTown,
    // UNITS.barracks,
    // UNITS.blacksmith,
    // UNITS.castle,
    UNITS.townHall,
    // UNITS.capital,
    // UNITS.arcaneSanctum,
    // UNITS.granary,
    // UNITS.lumberMill,
    // UNITS.citadelOfTheNorthernKnights,
    // UNITS.factory,
]);

export const otherHumanCapturableStructures = new Set([UNITS.rampartCannonTower, UNITS.rampartGuardTower]);

export const primaryCapturableUndeadTargets = new Set([UNITS.blackCitadel, UNITS.infectedGranary, UNITS.templeOfTheDamned, UNITS.blackCitadelNorth, UNITS.blackCitadelTownHall, UNITS.undeadFactory]);

export const otherCapturableUndeadStructures = new Set([UNITS.spiritTower, UNITS.undeadSentinelGuard, UNITS.undeadSentinelCannon, UNITS.nerubianTower, UNITS.undeadBarracks, UNITS.undeadBlacksmith, UNITS.undeadLumberMill]);

export const allCapturableStructures = new Set([...primaryCapturableHumanTargets, ...otherHumanCapturableStructures, ...primaryCapturableUndeadTargets, ...otherCapturableUndeadStructures]);

//When a gets down to 20% health, transfer control to undead or humans
export function setup_destroyStructure() {
    /**
     * @SIMPLIFIED
     */
    // const t = Trigger.create();
    // t.registerAnyUnitEvent(EVENT_PLAYER_UNIT_ATTACKED);
    // t.addCondition(() => {
    //     const u = Unit.fromEvent();
    //     const attacker = Unit.fromHandle(GetAttacker());
    //     if (u && attacker && allCapturableStructures.has(u.typeId) && u.life < u.maxLife * 0.25) {
    //         u.owner = Players[25]; //Neutral
    //         u.name = `[${tColor("Destroyed", "red")}] - ` + u.name;
    //         u.invulnerable = true;
    //     }
    //     return true;
    // });
}
