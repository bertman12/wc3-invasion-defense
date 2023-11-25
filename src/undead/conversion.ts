import { PlayerIndices, UNITS } from "src/shared/enums";
import { forEachUnitOfPlayer } from "src/utils/players";
import { Unit } from "w3ts";
import { Players } from "w3ts/globals";

const humanToUndead = new Map<number, number>([
    [UNITS.capital, UNITS.blackCitadel],
    [UNITS.castle, UNITS.blackCitadel],
    [UNITS.citadelOfTheNorthernKnights, UNITS.blackCitadelNorth],
    [UNITS.townHall, UNITS.blackCitadelTownHall],
    [UNITS.rampartCannonTower, UNITS.undeadSentinelCannon],
    [UNITS.rampartGuardTower, UNITS.undeadSentinelGuard],
    [UNITS.granary, UNITS.infectedGranary],
    [UNITS.farmTown, UNITS.spiritTower],
    [UNITS.arcaneSanctum, UNITS.templeOfTheDamned],
    [UNITS.lumberMill, UNITS.undeadLumberMill],
    [UNITS.blacksmith, UNITS.undeadBlacksmith],
    [UNITS.barracks, UNITS.undeadBarracks],
    // [CUSTOM_UNITS.guardTower, CUSTOM_UNITS.nerubianTower],
    // [CUSTOM_UNITS.cannonTower, CUSTOM_UNITS.nerubianTower],
]);

const undeadToHuman = new Map<number, number>([
    [UNITS.blackCitadel, UNITS.castle],
    [UNITS.blackCitadelNorth, UNITS.citadelOfTheNorthernKnights],
    [UNITS.blackCitadelTownHall, UNITS.townHall],
    [UNITS.undeadSentinelGuard, UNITS.rampartGuardTower],
    [UNITS.undeadSentinelCannon, UNITS.rampartCannonTower],
    [UNITS.infectedGranary, UNITS.granary],
    [UNITS.spiritTower, UNITS.farmTown],
    [UNITS.templeOfTheDamned, UNITS.arcaneSanctum],
    [UNITS.undeadLumberMill, UNITS.lumberMill],
    [UNITS.undeadBlacksmith, UNITS.blacksmith],
    [UNITS.undeadBarracks, UNITS.barracks],
    // [CUSTOM_UNITS.nerubianTower, CUSTOM_UNITS.guardTower],
]);

export function convertHumanToUndeadStructures() {
    forEachUnitOfPlayer(Players[PlayerIndices.NeutralPassive], (u) => {
        //Destroys and converts primary structures into undead ones.
        if (u.name.includes("Destroyed")) {
            if (humanToUndead.has(u.typeId)) {
                const unitType = humanToUndead.get(u.typeId);
                if (unitType) {
                    u.kill();
                    const createdUnit = Unit.create(Players[15], unitType, u.x, u.y);
                    createdUnit?.setField(UNIT_BF_IS_A_BUILDING, true);
                }
            }
        }
    });
}

export function convertUndeadToHumanStructures() {
    forEachUnitOfPlayer(Players[PlayerIndices.NeutralPassive], (u) => {
        //Destroys and converts primary structures into undead ones.
        if (u.name.includes("Destroyed")) {
            if (undeadToHuman.has(u.typeId)) {
                const unitType = undeadToHuman.get(u.typeId);

                if (unitType) {
                    u.kill();
                    Unit.create(Players[9], unitType, u.x, u.y);
                }
            }
        }
    });
}

//Perhaps we store in state the unit type this specific unit is replacing
