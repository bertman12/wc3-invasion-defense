import { forEachUnitOfPlayer } from "src/players";
import { Group, MapPlayer, Unit } from "w3ts";

/**
 * WIP 
 */
export function forEachUnitOfPlayerWithAbility(player: MapPlayer, abilityId: string | number, cb: (unit: Unit) => void){
    print("The abilityID before: ", abilityId);
    
    if(typeof abilityId === "string"){
        print("The fourCC returned value : ", FourCC(abilityId) );
        abilityId = FourCC(abilityId);
        // abilityId = AbilityId(abilityId);
    }
    print("GetObjectName: ",GetObjectName(abilityId));
    
    const a2s = AbilityId2String(abilityId);
    print("FourCC => AbilityId2String : ", a2s);
    
    if(a2s){
        const s2num = AbilityId(a2s);
        print("FourCC => AbilityId2String => AbilityId : ", s2num);

    } 
    
    // print("calling forEachUnitOfPlayerWithAbility");
    // print("The AbilityId returned value: ", abilityId);
    
    // BlzGetAbilityId

    forEachUnitOfPlayer(player, (u) => {
        u.setAbilityLevel
        const val = u.getAbility(abilityId as number + 1);
        GetSpellAbility();
        
        // print("what the val is: ",val)
        // print("=================");
        // print(u.getAbilityByIndex(0))
        // print(u.getAbilityByIndex(1))
        // print(u.getAbilityByIndex(2))
        // print(u.getAbilityByIndex(3))
        // print(u.getAbilityByIndex(4))
        // print(u.getAbilityByIndex(5))
        // print(u.getAbilityByIndex(6))
        // print(u.getAbilityByIndex(7))
        // print(u.getAbilityByIndex(8))
        // print(u.getAbilityByIndex(9))
        // print("=================");
        const ab = BlzGetUnitAbility(u.handle, abilityId as number);

        print("BlzGetUnitAbility: ", ab);

        if(ab !== undefined){
            cb(u);
        }
    
    })
}