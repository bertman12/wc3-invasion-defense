import { forEachUnitOfPlayer } from "src/players";
import { Ability_Id } from "src/shared/enums";
import { unitTypeAbilities } from "src/shared/misc";
import { Group, MapPlayer, Unit } from "w3ts";

/**
 * WIP 
 */
export function forEachUnitOfPlayerWithAbility(player: MapPlayer, abilityId: string | number, cb: (unit: Unit) => void){
    if(typeof abilityId === "string"){
        abilityId = FourCC(abilityId);
    }

    forEachUnitOfPlayer(player, (u) => {
        storeUnitTypeAbilityNumbers(u);
        if(unitTypeAbilities.get(u.typeId)?.find(x => x as unknown as ability === u.getAbility(abilityId as number))){
            print("Found a unit that has the ability!");
            cb(u);
        }
    
    });
}

function storeUnitTypeAbilityNumbers(u: Unit){
    if(unitTypeAbilities.has(u.typeId)) return;

    //IF we currently haven't stored the unit type we do so now with an empty array
    if(!unitTypeAbilities.has(u.typeId)){
        unitTypeAbilities.set(u.typeId, []);
    }

    //Iterate all 12 ability slots a unit can have
    for(let x = 0; x < 12; x++){
        const currentAbility = u.getAbilityByIndex(x);
        print(`Current ability at index ${x} => `, currentAbility);

        if(currentAbility){
            const updated =  unitTypeAbilities.get(u.typeId) as ability[];
            updated.push(currentAbility);
            
            print("Adding current ability for ", u.name);

            unitTypeAbilities.set(u.typeId, updated);
        }


    }
}