import { Trigger, Unit } from "w3ts";

export class TownManager {

}

const capturableTowns = new Set([
    FourCC("h002")
]);

//When a gets down to 10% health, transfer control to undead or humans
export function transferControl(){
    const t = Trigger.create();

    t.registerAnyUnitEvent(EVENT_PLAYER_UNIT_ATTACKED)
    t.addCondition(() => {
        const u = Unit.fromEvent();
        const attacker = Unit.fromHandle(GetAttacker());
        
        if(u && attacker && capturableTowns.has(u.typeId) && u.life <= u.maxLife*0.1){
            print("Transfering control of town.")
            u.owner = attacker.owner;
        }

        return true;
    })

}