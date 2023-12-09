import { UNITS } from "src/shared/enums";
import { Timer, Trigger, Unit } from "w3ts";
import { Players } from "w3ts/globals";

interface EventData {
    unit: Unit;
}

type RegisterableEvents = (...args: any) => any;
type EventArgs<T extends RegisterableEvents> = Parameters<T>;

export function aSpellIsCast<T extends (...args: any) => any>(eventType: RegisterableEvents, eventArgs: Parameters<T>, cb: (args: EventData) => void) {
    //Get event data
    const t = Trigger.create();
    eventType(eventArgs);

    // t.registerPlayerUnitEvent();

    const u = Unit.create(Players[0], FourCC("hfoo"), 0, 0);

    if (!u) {
        return;
    }

    cb({ unit: u });
}

// function useIt() {
//     const fn = Trigger.create().registerAnyUnitEvent;

//     aSpellIsCast<typeof fn>(fn, [EVENT_PLAYER_UNIT_DEATH], ({ unit }) => {
//         print(unit.name);
//     });
// }

export function unitGetsNearThisUnit(unit: Unit, range: number, cb: (u: Unit) => void, config?: { uniqueUnitsOnly: boolean; filter?: boolexpr | (() => boolean); onDestroy?: (unitsEffected: Unit[]) => void }) {
    const t = Trigger.create();

    /**
     * A unique set of the units effected
     */
    const effectedUnitPool: Unit[] = [];

    t.registerUnitInRage(unit.handle, range, config?.filter ?? (() => true));
    t.addAction(() => {
        const u = Unit.fromEvent();

        if (!u) {
            return;
        }

        if (!effectedUnitPool.includes(u)) {
            effectedUnitPool.push(u);
        }

        if (config?.uniqueUnitsOnly && !effectedUnitPool.includes(u)) {
            cb(u);
        } else {
            cb(u);
        }
    });

    return {
        destroy: () => {
            if (config?.onDestroy) {
                config?.onDestroy(effectedUnitPool);
            }
            t.destroy();
        },
    };
}

/**
 *
 * @param cb
 * @param abilityId
 * @param dummyLifeTime Maybe be necessary to have a long lifetime so spells like chain lightning will have time to bounce to all targets
 * @param ownerUnit
 */
export function useTempDummyUnit(cb: (dummy: Unit) => void, abilityId: number, dummyLifeTime: number, ownerUnit: Unit) {
    // args.push(UNITS.dummyCaster);
    const dummy = Unit.create(ownerUnit.owner, UNITS.dummyCaster, ownerUnit.x, ownerUnit.y, ownerUnit.facing);
    const t = Timer.create();

    if (dummy) {
        dummy.addAbility(abilityId);

        cb(dummy);

        t.start(dummyLifeTime, false, () => {
            dummy.destroy();
            t.destroy();
        });
    }
}

/**
 * Creates a trigger to monitor when an attacker is
 *
 * We could also have all functions execute in this single trigger's context instead of creating new triggers each time the function is used.
 * @param cb
 * @param config
 */
export function onUnitAttacked(cb: (attacker: Unit, victim: Unit) => void, config: { attackerCooldown?: boolean; procChance?: number }) {
    const attackerTriggerCooldown = new Set<Unit>();
    const t = Trigger.create();

    t.registerAnyUnitEvent(EVENT_PLAYER_UNIT_ATTACKED);

    t.addAction(() => {
        const attacker = Unit.fromHandle(GetAttacker());
        const victim = Unit.fromHandle(GetAttackedUnitBJ());

        if (!attacker || !victim) {
            return;
        }

        //Attack was not below the proc chance, and thus we will not use the cb function
        if (config.procChance && Math.ceil(Math.random() * 100) >= config.procChance) {
            return;
        }

        //Attacker has already used the trigger
        if (config.attackerCooldown && attackerTriggerCooldown.has(attacker)) {
            return;
        }

        attackerTriggerCooldown.add(attacker);

        //Finally, after all conditions have been met, use the cb function
        cb(attacker, victim);

        const t = Timer.create();

        //removes the attacker from the cooldown group after 1/3 of that units attack cooldown has passed.
        t.start(attacker.getAttackCooldown(0) / 3, false, () => {
            attackerTriggerCooldown.delete(attacker);
            t.destroy();
        });
    });
}
