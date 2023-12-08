import { ABILITIES, UNITS } from "src/shared/enums";
import { forEachUnitOfPlayer } from "src/utils/players";
import { MapPlayer, Trigger } from "w3ts";
import { OrderId } from "w3ts/globals";

export function init_armyControllerTrigs() {
    militaryCommands();
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
        print("Spell was cast: ", spellId);

        const p = MapPlayer.fromEvent();

        if (abilityOrderMap.has(spellId) && p) {
            const workerUnits = [UNITS.engineer, UNITS.farmHand, UNITS.supplyHorse];
            const x = GetSpellTargetX();
            const y = GetSpellTargetY();
            const meleeOnly = [ABILITIES.command_meleeMoveAllMilitary, ABILITIES.command_meleeAttackMoveAllMilitary].includes(spellId);
            const rangedOnly = [ABILITIES.command_rangedMoveAllMilitary, ABILITIES.command_rangedAttackMoveAllMilitary].includes(spellId);

            print("melee only? ", meleeOnly);
            print("ranged only? ", rangedOnly);

            forEachUnitOfPlayer(p, (u) => {
                const attackRange = BlzGetUnitWeaponRealField(u.handle, UNIT_WEAPON_RF_ATTACK_RANGE, 0);
                print("attack range: ", attackRange, " for unit ", u.name);

                if (u.isAlive() && !workerUnits.includes(u.typeId)) {
                    if (rangedOnly && attackRange >= 220) {
                        u.issueOrderAt(abilityOrderMap.get(spellId) as number, x, y);
                    } else if (meleeOnly && attackRange < 220) {
                        u.issueOrderAt(abilityOrderMap.get(spellId) as number, x, y);
                    } else {
                        u.issueOrderAt(abilityOrderMap.get(spellId) as number, x, y);
                    }
                }
            });
        }
    });
}
