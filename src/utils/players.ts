import { forEachUnitOfPlayer } from "src/players";
import { Ability_Id } from "src/shared/enums";
import { unitTypeAbilities } from "src/shared/misc";
import { Group, MapPlayer, Unit } from "w3ts";

/**
 * WIP 
 */
export function forEachUnitOfPlayerWithAbility(player: MapPlayer, abilityId:  number, cb: (unit: Unit) => void){
    // if(typeof abilityId === "string"){
    //     abilityId = FourCC(abilityId);
    // }

    forEachUnitOfPlayer(player, (u) => {
        storeUnitTypeAbilities(u);
        const currAbilityArr = unitTypeAbilities.get(u.typeId);
        const findResult = currAbilityArr?.find(x => `${x}` === `${u.getAbility(abilityId as number)}`);

        if(findResult){
            cb(u);
        }
    });
}

/**
 * Used later on to check if a unit has a specific ability
 * Function will save abilities from index [0,11] 
 */
function storeUnitTypeAbilities(u: Unit){
    if(unitTypeAbilities.has(u.typeId)) return;

    //IF we currently haven't stored the unit type we do so now with an empty array
    if(!unitTypeAbilities.has(u.typeId)){
        unitTypeAbilities.set(u.typeId, []);
    }

    //Iterate all 12 ability slots a unit can have
    for(let x = 0; x < 12; x++){
        let currentAbility = u.getAbilityByIndex(x);
        // print("The ___ability : ", currentAbility?.__ability);

        // print("***HERE***");
        // print(`${currentAbility}`);
    

        //@ts-ignore
        // print(currentAbility.ability);
        //broke


        // print(`Current ability at index ${x} => `, currentAbility);
        if(currentAbility){
            const updated =  unitTypeAbilities.get(u.typeId) as ability[];
            updated.push(currentAbility);
            
            // print("Adding current ability for ", u.name);

            unitTypeAbilities.set(u.typeId, updated);
        }


    }
}