import { Unit } from "w3ts";

/**
 * Checks if the unit has an item in their item slots 
 * @param u 
 * @param itemTypeId 
 * @returns 
 */
export function unitHasItem(u: Unit, itemTypeId: number): boolean {
    let hasItem = false;
    
    for (let x = 0; x < 6; x++) {
        if (u.getItemInSlot(x)?.typeId === itemTypeId) {
            hasItem = true;
            break;
        }
    }

    return hasItem;
}
