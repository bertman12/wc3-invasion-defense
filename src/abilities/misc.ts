import { Group, Rectangle } from "w3ts";

export function setupUndeadUnitPreview() {
    const g = Group.create();
    const r = Rectangle.fromHandle(gg_rct_undead_unit_showcase);

    if(r){
        g?.enumUnitsInRect(r, () => {
            const u = Group.getFilterUnit();

            if(u){
                // print("seting up undead unit preview!");
                u.addAbility(FourCC("Aall"));
                u.setField(UNIT_RF_HIT_POINTS_REGENERATION_RATE, 10);
            }

            return true;
        })

    }
    
}