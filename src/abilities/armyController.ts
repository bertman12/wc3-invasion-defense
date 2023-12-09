import { ABILITIES, UNITS } from "src/shared/enums";
import { forEachUnitOfPlayer } from "src/utils/players";
import { MapPlayer, Trigger } from "w3ts";
import { OrderId } from "w3ts/globals";

export function init_armyControllerTrigs() {
    militaryCommands();
    // trackPlayerKeyDown();
    // trackPlayerKeyRelease();
}

const abilityOrderMap = new Map<number, number>([
    [ABILITIES.command_moveAllMilitary, OrderId.Move],
    [ABILITIES.command_attackMoveAllMilitary, OrderId.Attack],
    [ABILITIES.command_meleeMoveAllMilitary, OrderId.Move],
    [ABILITIES.command_meleeAttackMoveAllMilitary, OrderId.Attack],
    [ABILITIES.command_rangedMoveAllMilitary, OrderId.Move],
    [ABILITIES.command_rangedAttackMoveAllMilitary, OrderId.Attack],
]);

function militaryCommands() {
    const t = Trigger.create();

    t.registerAnyUnitEvent(EVENT_PLAYER_UNIT_SPELL_EFFECT);

    t.addAction(() => {
        const spellId = GetSpellAbilityId();
        const p = MapPlayer.fromEvent();

        if (abilityOrderMap.has(spellId) && p) {
            const workerUnits = [UNITS.engineer, UNITS.farmHand, UNITS.supplyHorse];
            const x = GetSpellTargetX();
            const y = GetSpellTargetY();
            const meleeOnly = [ABILITIES.command_meleeMoveAllMilitary, ABILITIES.command_meleeAttackMoveAllMilitary].includes(spellId);
            const rangedOnly = [ABILITIES.command_rangedMoveAllMilitary, ABILITIES.command_rangedAttackMoveAllMilitary].includes(spellId);
            forEachUnitOfPlayer(p, (u) => {
                const attackRange = BlzGetUnitWeaponRealField(u.handle, UNIT_WEAPON_RF_ATTACK_RANGE, 0);

                if (u.isAlive() && !workerUnits.includes(u.typeId)) {
                    if (rangedOnly && attackRange >= 220) {
                        u.issueOrderAt(abilityOrderMap.get(spellId) as number, x, y);
                        return;
                    } else if (meleeOnly && attackRange < 220) {
                        u.issueOrderAt(abilityOrderMap.get(spellId) as number, x, y);
                    } else if (!meleeOnly && !rangedOnly) {
                        u.issueOrderAt(abilityOrderMap.get(spellId) as number, x, y);
                    }
                }
            });
        }
    });
}

// function trackPlayerKeyDown() {
//     const t = Trigger.create();
//     t.registerPlayerKeyEvent(Players[0], OSKEY_LSHIFT, 1, true);
//     t.addAction(() => {
//         print("shift is pressed.");
//     });
// }
// function trackPlayerKeyRelease() {
//     const t = Trigger.create();
//     t.registerPlayerKeyEvent(Players[0], OSKEY_LSHIFT, 1, false);

//     t.addAction(() => {
//         print(BlzGetTriggerPlayerIsKeyDown());
//         print("shift is released.");
//     });
// }
