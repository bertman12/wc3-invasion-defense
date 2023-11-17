import { Trigger, Unit } from "w3ts";
import { Players } from "w3ts/globals";

interface EventData {
    unit: Unit;
}

type RegisterableEvents = (...args: any) => any;
type EventArgs<T extends RegisterableEvents> = Parameters<T>;

export function aSpellIsCast<T extends (...args: any) => any>(eventType: RegisterableEvents, eventArgs: Parameters<T>, cb: (args: EventData) => void) {
    //Get event data
    const t = Trigger.create();
    eventType(eventArgs);

    // t.registerPlayerUnitEvent();

    const u = Unit.create(Players[0], FourCC("hfoo"), 0, 0);

    if (!u) {
        return;
    }

    cb({ unit: u });
}

function useIt() {
    const fn = Trigger.create().registerAnyUnitEvent;

    aSpellIsCast<typeof fn>(fn, [EVENT_PLAYER_UNIT_DEATH], ({ unit }) => {
        print(unit.name);
    });
}
