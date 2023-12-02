import { Unit } from "w3ts";

export function createUnits(quantity: number, useFood: boolean, ...args: Parameters<typeof Unit.create>) {
    for (let x = 0; x < quantity; x++) {
        Unit.create(...args)?.setUseFood(useFood);
    }
}
