import { ABILITIES } from "src/shared/enums";
import { forEachPlayer } from "src/utils/players";
import { Force, Trigger, Unit } from "w3ts";
import { Players } from "w3ts/globals";

export function init_humanSpells(){
    knightCharge();
    makeAlliance();
}

function knightCharge(){
    const t = Trigger.create();
    t.registerAnyUnitEvent(EVENT_PLAYER_UNIT_SPELL_CAST);

    t.addCondition(() => {
        const u  = Unit.fromEvent();
        if(!u) return false;

        if(u.getAbility(ABILITIES.charge) === GetSpellAbility()){

            return true;
        }
        
        return false;
    })


    t.addAction(() => {
        const u = Unit.fromEvent();
        const spell = u?.getAbility(ABILITIES.charge);
    });


}


function makeAlliance(){
    const t = Trigger.create();
    
    t.registerAnyUnitEvent(EVENT_PLAYER_UNIT_SPELL_CAST);

    t.addCondition(() => {
        const castedSpellId = GetSpellAbilityId();
        print(castedSpellId, ABILITIES.makeAlliance);
        const caster = Unit.fromEvent();
        const target = Unit.fromHandle(GetSpellTargetUnit())

        if(castedSpellId === ABILITIES.makeAlliance && caster && target){
            print("Unit has made alliance!");
            const casterPlayer = caster.owner.handle;
            const targetPlayer = target.owner.handle;

            // //Player -> Target
            // SetPlayerAllianceStateAllyBJ(casterPlayer, targetPlayer, true);
            // SetPlayerAllianceBJ(casterPlayer, ALLIANCE_SHARED_VISION_FORCED, true, targetPlayer);
            // SetPlayerAllianceBJ(casterPlayer, ALLIANCE_PASSIVE, true, targetPlayer);

            // //Target -> Player
            // SetPlayerAllianceStateAllyBJ(targetPlayer, casterPlayer, true);
            // SetPlayerAllianceBJ(targetPlayer, ALLIANCE_SHARED_VISION_FORCED, true, casterPlayer);
            // SetPlayerAllianceBJ(targetPlayer, ALLIANCE_PASSIVE, true, casterPlayer);
            
            const redPlayerForce = GetForceOfPlayer(Players[0].handle);

            if(redPlayerForce) ForForce(redPlayerForce, () => {
                const player = GetEnumPlayer();

                if(player){
                    //Player -> Target
                    SetPlayerAllianceBJ(player, ALLIANCE_SHARED_VISION_FORCED, true, targetPlayer);
                    SetPlayerAllianceBJ(player, ALLIANCE_PASSIVE, true, targetPlayer);
                    SetPlayerAllianceStateAllyBJ(player, targetPlayer, true);

                    //Target -> Player
                    SetPlayerAllianceBJ(targetPlayer, ALLIANCE_SHARED_VISION_FORCED, true, player);
                    SetPlayerAllianceBJ(targetPlayer, ALLIANCE_PASSIVE, true, player);
                    SetPlayerAllianceStateAllyBJ(targetPlayer, player, true);
                }
            })

            caster.kill();
            return true;
        }

        return false;
    })
}