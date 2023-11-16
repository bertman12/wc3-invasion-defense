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

            if(redPlayerForce) {ForForce(redPlayerForce, () => {
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
            });}

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
    const trig = Trigger.create();

    trig.registerAnyUnitEvent(EVENT_PLAYER_UNIT_SPELL_CAST);
    trig.addCondition(() => {
        const castedSpellId = GetSpellAbilityId();
        const caster = Unit.fromEvent();
        
        if(castedSpellId === ABILITIES.heroicLeap && caster){
            applyForce(caster.facing, caster, 1200);
        }

        return false;
    });
}

/**
 * @param angle degrees 
 * @param unit 
 * @param initialSpeed meters per second
 * @param affectHeight determines whether or not to change unit height whilst force is applied
 */
function applyForce(angle: number, unit: Unit, initialSpeed: number, affectHeight?: boolean){
    const timer = Timer.create();
    const refreshInterval = 0.01;
    const updatesPerSecond = 1/refreshInterval;
    const frictionConstant = 600; //meters per second friction decay
    let currentSpeed = initialSpeed;

    
    //to make it so that the unit move speed is not calculated into the movement, subtract unit move x,y vector based on their CURRENT (in case their slowed) movement speed and angle. Slow wont affect our applied force only default unit move vector
    //Subtract move vector from applied force vector if it > 0.
    //Hopefully this prevents adding the units move speed to the vector

    timer.start(refreshInterval, true, ()=>{
        const xVelocity = (currentSpeed/updatesPerSecond) * Math.cos(Deg2Rad(angle));
        const yVelocity = (currentSpeed/updatesPerSecond) * Math.sin(Deg2Rad(angle));
        
        if(currentSpeed <= 0){
            print("applied force has decayed!");
            timer.destroy();
            return;
        }

        unit.x += xVelocity;
        unit.y += yVelocity;
        currentSpeed -= (frictionConstant/updatesPerSecond);
    })
}