import { ABILITIES } from "src/shared/enums";
import { applyForce } from "src/shared/physics";
import { Trigger, Unit } from "w3ts";

export function init_itemAbilities() {
    trig_forceBoots();
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
            // sustainedForceDuration: 0,
            onEnd(currentSpeed, timeElapsed) {
                caster.setTimeScale(1);
                SetUnitAnimationByIndex(caster.handle, 0);
            },
        });
    });
}
