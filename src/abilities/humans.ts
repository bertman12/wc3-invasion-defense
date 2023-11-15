import { ABILITIES, CUSTOM_UNITS } from "src/shared/enums";
import { tColor } from "src/utils/misc";
import { forEachPlayer } from "src/utils/players";
import { Force, MapPlayer, Timer, Trigger, Unit } from "w3ts";
import { OrderId, Players } from "w3ts/globals";

export function init_humanSpells(){
    // knightCharge();
    makeAlliance();
    trig_hireFlyingMachine();
    trig_heroicLeap();
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
                    // print(u.name);
                }
            }
        }

        return false;
    });
}

function trig_heroicLeap(){
    const t = Trigger.create();

    t.registerAnyUnitEvent(EVENT_PLAYER_UNIT_SPELL_CAST);
    t.addCondition(() => {
        const castedSpellId = GetSpellAbilityId();
        const caster = Unit.fromEvent();
        
        if(castedSpellId === ABILITIES.heroicLeap && caster){
            print("Player cast heroic leap!!!!");
            let timeElapsed = 0;
            const originalAngle = caster?.facing;
           
            const t = Timer.create();
            const distanceToTravel = 600; //100 units per tick?
            const refreshInterval = 0.01;
            const totalDuration = 2;

            caster.disableAbility

            t.start(refreshInterval, true, ()=>{
                timeElapsed += refreshInterval;
                const speed = distanceToTravel*refreshInterval;
                
                //speed of decay approaches our the max speed , thus slowly stopping us as more time elapses, just like friction 
                caster.x += (speed) * Math.cos(Deg2Rad(originalAngle)) - (timeElapsed/totalDuration)*speed*Math.cos(Deg2Rad(originalAngle));
                caster.y += (speed) * Math.sin(Deg2Rad(originalAngle)) - (timeElapsed/totalDuration)*speed*Math.sin(Deg2Rad(originalAngle));

                if(timeElapsed >= totalDuration){
                    print("timer duration expired!");
                    t.destroy();
                }
            })
        }

        return false;
    });
}