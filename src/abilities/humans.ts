import { ABILITIES } from "src/shared/enums";
import { Trigger, Unit } from "w3ts";

export function init_humanSpells(){
    knightCharge();
}

function knightCharge(){
    const t = Trigger.create();
    t.registerAnyUnitEvent(EVENT_PLAYER_UNIT_SPELL_CAST);

    t.addCondition(() => {
        const u  = Unit.fromEvent();
        if(!u) return false;


        if(u.getAbility(ABILITIES.charge) === GetSpellAbility()){
            // print(ABILITIES.charge);
            // print(GetSpellAbilityId());
            // print(GetSpellAbility());
           

            return true;
        }
        
        return false;
    })


    t.addAction(() => {
        const u = Unit.fromEvent();
        const spell = u?.getAbility(ABILITIES.charge);
    });


}