import { CUSTOM_UNITS, PlayerIndices } from "src/shared/enums";
import { RoundManager } from "src/shared/round-manager";
import { forEachUnitOfPlayer } from "src/utils/players";
import { Unit } from "w3ts";
import { Players } from "w3ts/globals";

const humanToUndead = new Map<number, number>([
    [CUSTOM_UNITS.capital, CUSTOM_UNITS.blackCitadel],
    [CUSTOM_UNITS.castle, CUSTOM_UNITS.blackCitadel],
    [CUSTOM_UNITS.citadelOfTheNorthernKnights, CUSTOM_UNITS.blackCitadel],
    [CUSTOM_UNITS.townHall, CUSTOM_UNITS.blackCitadel],
    [CUSTOM_UNITS.rampartCannonTower, CUSTOM_UNITS.undeadSentinel],
    [CUSTOM_UNITS.rampartGuardTower, CUSTOM_UNITS.undeadSentinel],
    [CUSTOM_UNITS.granary, CUSTOM_UNITS.infectedGranary],
    [CUSTOM_UNITS.farmTown, CUSTOM_UNITS.spiritTower],
    [CUSTOM_UNITS.arcaneSanctum, CUSTOM_UNITS.templeOfTheDamned],
    [CUSTOM_UNITS.lumberMill, CUSTOM_UNITS.undeadLumberMill],
    [CUSTOM_UNITS.blacksmith, CUSTOM_UNITS.undeadBlacksmith],
    [CUSTOM_UNITS.barracks, CUSTOM_UNITS.undeadBarracks],
    // [CUSTOM_UNITS.guardTower, CUSTOM_UNITS.nerubianTower],
    // [CUSTOM_UNITS.cannonTower, CUSTOM_UNITS.nerubianTower],
]);

const undeadToHuman = new Map<number, number>([
    [CUSTOM_UNITS.blackCitadel, CUSTOM_UNITS.castle],
    [CUSTOM_UNITS.undeadSentinel, CUSTOM_UNITS.rampartGuardTower],
    [CUSTOM_UNITS.infectedGranary, CUSTOM_UNITS.granary],
    [CUSTOM_UNITS.spiritTower, CUSTOM_UNITS.farmTown],
    [CUSTOM_UNITS.templeOfTheDamned, CUSTOM_UNITS.arcaneSanctum],
    [CUSTOM_UNITS.undeadLumberMill, CUSTOM_UNITS.lumberMill],
    [CUSTOM_UNITS.undeadBlacksmith, CUSTOM_UNITS.blacksmith],
    [CUSTOM_UNITS.undeadBarracks, CUSTOM_UNITS.barracks],
    // [CUSTOM_UNITS.nerubianTower, CUSTOM_UNITS.guardTower],
]);

export function setupBuildingConversions() {
    convertUndeadToHumanStructures();
    convertHumanToUndeadStructures();
}

function convertHumanToUndeadStructures() {
    RoundManager.onNightStart(() => {
        forEachUnitOfPlayer(Players[PlayerIndices.NeutralPassive], (u) => {
            //Destroys and converts primary structures into undead ones.
            if (u.name.includes("Destroyed")) {
                if (humanToUndead.has(u.typeId)) {
                    const unitType = humanToUndead.get(u.typeId);
                    if (unitType) {
                        u.kill();
                        // print("Killing undead - ", u.name);
                        Unit.create(Players[15], unitType, u.x, u.y);
                    }
                }
            }
        });
    });
}

function convertUndeadToHumanStructures() {
    RoundManager.onDayStart(() => {
        print("converting undead structures back into human ones");
        forEachUnitOfPlayer(Players[PlayerIndices.NeutralPassive], (u) => {
            //Destroys and converts primary structures into undead ones.
            if (u.name.includes("Destroyed")) {
                if (undeadToHuman.has(u.typeId)) {
                    const unitType = undeadToHuman.get(u.typeId);

                    if (unitType) {
                        // print("Killing human - ", u.name);

                        u.kill();
                        Unit.create(Players[9], unitType, u.x, u.y);
                    }
                }
            }
        });
    });
}

//Perhaps we store in state the unit type this specific unit is replacing

//Then
