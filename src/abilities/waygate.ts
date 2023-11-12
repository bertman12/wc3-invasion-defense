import { tColor } from "src/utils/misc";
import { forEachUnitOfPlayer } from "src/utils/players";
import { Sound, Trigger, Unit } from "w3ts";
import { Players } from "w3ts/globals";

export function trig_wayGate(){
    const t = Trigger.create();

    t.registerAnyUnitEvent(EVENT_PLAYER_UNIT_DEATH);

    t.addCondition(() => {
        const u = Unit.fromHandle(GetDyingUnit());

        if(u && u.typeId === FourCC("nwgt")){
            return true;
        }

        return false;

    })

    t.addAction(() => {
        // const u = Unit.fromHandle(GetDyingUnit());

        forEachUnitOfPlayer(Players[9], (u) => {
            if(u.typeId === FourCC("nwgt")) u.kill();
        });

        print(`${tColor("!", "goldenrod")} - The portal to the north has been destroyed.`);
        Sound.fromHandle(gg_snd_QuestFailed)?.start()
    });

}