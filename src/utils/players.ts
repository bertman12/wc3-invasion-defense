import { forEachUnitOfPlayer } from "src/players";
import { Group, MapPlayer, Unit } from "w3ts";
import { AbilityProps } from "war3-objectdata-th/dist/cjs/generated/abilities";

export function forEachUnitOfPlayerWithAbility(player: MapPlayer, abilityId: string | number, cb: (unit: Unit) => void){
    print("The abilityID before: ", abilityId);
    
    if(typeof abilityId === "string"){
        print("The fourCC returned value : ", FourCC(abilityId) );
        // abilityId = FourCC(abilityId);
        abilityId = AbilityId(abilityId);
    }
    
    print("calling forEachUnitOfPlayerWithAbility");
    print("The AbilityId returned value: ", abilityId);
    
    // BlzGetAbilityId

    forEachUnitOfPlayer(player, (u) => {
        u.setAbilityLevel
        const val = u.getAbility(abilityId as number + 1);
        
        print("what the val is: ",val)
        print(u.getAbilityByIndex(0))
        
        if(val !== undefined){
            cb(u);
        }
    
    })
}