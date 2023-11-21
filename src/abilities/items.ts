import { ABILITIES } from "src/shared/enums";
import { applyForce } from "src/shared/physics";
import { adjustGold } from "src/utils/players";
import { Effect, Timer, Trigger, Unit } from "w3ts";

export function init_itemAbilities() {
    trig_forceBoots();
    handOfMidas();
}

function trig_forceBoots() {
    const trig = Trigger.create();

    trig.registerAnyUnitEvent(EVENT_PLAYER_UNIT_SPELL_CAST);

    trig.addCondition(() => {
        const castedSpellId = GetSpellAbilityId();

        if (castedSpellId === ABILITIES.forceBoots) {
            return true;
        }

        return false;
    });

    trig.addAction(() => {
        const caster = Unit.fromEvent();

        if (!caster) {
            return;
        }

        caster.setTimeScale(2);
        SetUnitAnimationByIndex(caster.handle, 3);

        applyForce(caster.facing, caster, 1800, {
            onEnd() {
                caster.setTimeScale(1);
                SetUnitAnimationByIndex(caster.handle, 0);
            },
        });
    });
}

function handOfMidas() {
    const t = Trigger.create();

    t.registerAnyUnitEvent(EVENT_PLAYER_UNIT_DAMAGED);

    t.addCondition(() => {
        const attacker = Unit.fromHandle(GetAttacker());
        const victim = Unit.fromHandle(GetAttackedUnitBJ());
        const u = Unit.fromEvent();
        const damageSource = Unit.fromHandle(GetEventDamageSource());
        // print("unit damaged");
        // print("attacker", attacker?.name);
        // print("victim", victim?.name);
        // print("u", u?.name);
        // print("damageSource", damageSource?.name);

        if (damageSource && victim && !damageSource.owner.isPlayerAlly(victim?.owner)) {
            const i = GetItemOfTypeFromUnitBJ(damageSource.handle, FourCC("I007"));
            const itemProcChance = 14;

            if (i && math.random(0, 100) <= itemProcChance) {
                return true;
            }
        }

        return false;
    });

    t.addAction(() => {
        const u = Unit.fromHandle(GetAttackedUnitBJ());
        const attacker = Unit.fromHandle(GetAttacker());

        if (u && attacker) {
            const e = Effect.createAttachment("Abilities\\Spells\\Other\\Transmute\\PileofGold.mdl", u, "origin");
            const t = Timer.create();

            adjustGold(attacker.owner, 20);

            t.start(1.5, false, () => {
                e?.destroy();
                t.destroy();
            });
        }
    });
}
