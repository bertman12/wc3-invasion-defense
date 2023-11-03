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
            print(ABILITIES.charge);
            print(GetSpellAbilityId());
            print(GetSpellAbility());
            //How to convert an abilityID to ability number?
            // print(typeof GetSpellAbility());
            // print(u.);

            // print("__ability: ",u.getAbility(Ability_Id.charge)?.__ability);

            for(let x = 0; x < 12; x++){
                if(u.getAbilityByIndex(x) === u.getAbility(ABILITIES.charge)){
                    print("Found the mathcing ability at index : ", x);
                }
            }

            return true;
        }
        
        return false;
    })


    t.addAction(() => {
        const u = Unit.fromEvent();
        const spell = u?.getAbility(ABILITIES.charge);
        
        // if(spell) print({spell});
        
        print("Unit cast charge!");
        // if(u) u?. = 0;
    });


}