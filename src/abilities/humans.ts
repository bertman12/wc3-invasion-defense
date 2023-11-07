import { ABILITIES, CUSTOM_UNITS } from "src/shared/enums";
import { tColor } from "src/utils/misc";
import { forEachPlayer } from "src/utils/players";
import { Force, MapPlayer, Trigger, Unit } from "w3ts";
import { OrderId, Players } from "w3ts/globals";

export function init_humanSpells(){
    // knightCharge();
    makeAlliance();
    trig_hireFlyingMachine();
}

function makeAlliance(){
    const t = Trigger.create();
    
    t.registerAnyUnitEvent(EVENT_PLAYER_UNIT_SPELL_CAST);

    t.addCondition(() => {
        const castedSpellId = GetSpellAbilityId();
        const caster = Unit.fromEvent();
        const target = Unit.fromHandle(GetSpellTargetUnit())

        if(castedSpellId === ABILITIES.makeAlliance && caster && target){
            print(`[${tColor("Alliance", "goldenrod")}] - An alliance has been made with ${target.owner.name}`);
            const targetPlayer = target.owner.handle;
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
            });

            SetPlayerName(target.owner.handle, target.owner.name.replace("Neutral", "Ally"));

            caster.kill();
            
            return true;
        }

        return false;
    })
}

function trig_hireFlyingMachine(){
    const t = Trigger.create();

    t.registerAnyUnitEvent(EVENT_PLAYER_UNIT_SPELL_CAST);
    t.addCondition(() => {
        const castedSpellId = GetSpellAbilityId();
        const caster = Unit.fromEvent();
        const triggeringPlayer = MapPlayer.fromHandle(GetTriggerPlayer());

        const units: Unit[] = [];
        
        if(castedSpellId === ABILITIES.hireFlyingMachinePatrol && caster && triggeringPlayer){
            while(units.length < 6){
                const u = Unit.create(triggeringPlayer, CUSTOM_UNITS.flyingMachine, caster.x, caster.y);
                if(u){
                    units.push(u);
                }
            }
        }

        return false;
    });
}