import { CUSTOM_UNITS, PlayerIndices } from "src/shared/enums";
import { RoundManager } from "src/shared/round-manager";
import { forEachUnitOfPlayer } from "src/utils/players";
import { Unit } from "w3ts";
import { Players } from "w3ts/globals";

const replacedUnits = new Map<number, Unit>();

export function convertHumanToUndeadStructures() {

    RoundManager.onNightStart(() => {
        forEachUnitOfPlayer(Players[PlayerIndices.NeutralPassive], (u) => {
            //Destroys and converts primary structures into undead ones.
            if (u.name.includes("Destroyed")) {
                u.kill();

                if ([CUSTOM_UNITS.capital, CUSTOM_UNITS.castle, CUSTOM_UNITS.townHall, CUSTOM_UNITS.citadelOfTheNorthernKnights].find((type) => u.typeId === type)) {
                    const undeadStructure = Unit.create(Players[15], FourCC("u006"), u.x, u.y);
                    
                    print("Created Necropolis");
                } else if ([CUSTOM_UNITS.rampartCannonTower, CUSTOM_UNITS.rampartGuardTower].find((type) => u.typeId === type)) {
                    const undeadSentinel = Unit.create(Players[15], FourCC("u007"), u.x, u.y);
                    print("Created Undead Sentinel");
                } else {
                    const undeadStructure = Unit.create(Players[15], FourCC("u005"), u.x, u.y);
                    print("Created Ziggurat");
                }
            }
        });
    });
}

export function convertUndeadToHumanStructures() {
    RoundManager.onDayStart(() => {
        forEachUnitOfPlayer(Players[PlayerIndices.NeutralPassive], (u) => {
            //Destroys and converts primary structures into undead ones.
            if (u.name.includes("Destroyed")) {
                u.kill();

                if ([CUSTOM_UNITS.capital, CUSTOM_UNITS.castle, CUSTOM_UNITS.townHall, CUSTOM_UNITS.citadelOfTheNorthernKnights].find((type) => u.typeId === type)) {
                    Unit.create(Players[9], CUSTOM_UNITS.castle, u.x, u.y);

                    print("Created Necropolis");
                } else if ([CUSTOM_UNITS.rampartCannonTower, CUSTOM_UNITS.rampartGuardTower].find((type) => u.typeId === type)) {
                    Unit.create(Players[15], FourCC("u007"), u.x, u.y);
                    print("Created Undead Sentinel");
                } else {
                    const undeadStructure = Unit.create(Players[15], FourCC("u005"), u.x, u.y);
                    print("Created Ziggurat");
                }
            }
        });
    });
}

//Perhaps we store in state the unit type this specific unit is replacing

//Then 