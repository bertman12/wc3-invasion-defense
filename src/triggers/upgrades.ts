import { UNITS, UpgradeCodes } from "src/shared/enums";
import { useTempEffect } from "src/utils/misc";
import { adjustFoodUsed } from "src/utils/players";
import { Effect, MapPlayer, Trigger, Unit } from "w3ts";

export function init_upgradeBasedTriggers() {
    refundFoodFromSlaveLaborer();
}

function refundFoodFromSlaveLaborer() {
    const t = Trigger.create();

    t.registerAnyUnitEvent(EVENT_PLAYER_UNIT_CONSTRUCT_FINISH);

    t.addAction(() => {
        const p = MapPlayer.fromEvent();
        const u = Unit.fromEvent();
        if (!p || !u) {
            return;
        }

        // print("player has slave rations? ", GetPlayerTechCount(p?.handle, UpgradeCodes.slaveRations, true));
        if (u?.typeId === UNITS.acolyteSlaveLaborer && p?.getTechResearched(UpgradeCodes.slaveRations, true)) {
            adjustFoodUsed(p, -1);
            useTempEffect(Effect.create("Abilities\\Spells\\Items\\TomeOfRetraining\\TomeOfRetrainingCaster.mdl", u.x, u.y));
        }
    });
}
