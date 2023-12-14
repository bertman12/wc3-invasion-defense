import { Effect, Timer, Unit } from "w3ts";

type ProperColors = "goldenrod" | "gold" | "green" | "yellow" | "red";

export function tColor(text: string | number, color?: ProperColors, hex?: string, alpha?: string) {
    if (color) {
        return `|cff${properColorHexes.get(color) || "FFFFFF"}${alpha || ""}${text}|r`;
    } else if (hex) {
        return `|cff${hex}${alpha || ""}${text}|r`;
    }

    return String(text);
}

const properColorHexes = new Map<ProperColors, string>([
    ["goldenrod", "E0A526"],
    ["green", "00FF00"],
    ["yellow", "FFFF00"],
    ["red", "FF0000"],
]);

export function notifyPlayer(msg: string) {
    print(`${tColor("!", "goldenrod")} - ${msg}`);
}

/**
 * Returns degrees or radians?
 */
export function getRelativeAngleToUnit(unit: Unit, relativeUnit: Unit) {
    const locA = GetUnitLoc(unit.handle);
    const locB = GetUnitLoc(relativeUnit.handle);

    return AngleBetweenPoints(locA, locB);
}

/**
 * Manages state of effects in this context so you don't have to!
 */
export function useEffects() {
    const effects: Effect[] = [];

    return {
        addEffect: (effect: Effect | undefined) => {
            if (effect) {
                effects.push(effect);
            }
        },
        /**
         * @returns reference to effects array
         */
        getEffects: () => {
            return effects;
        },
        destroyAllEffects: () => {
            effects.forEach((e) => {
                e.destroy();
            });
        },
    };
}

export function useTempEffect(effect: Effect | undefined, duration: number = 1.5) {
    if (effect) {
        const timer = Timer.create();

        timer.start(duration, false, () => {
            effect.destroy();
            timer.destroy();
        });
    }
}
