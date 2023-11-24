import { Group, Rectangle } from "w3ts";

export function setupUndeadUnitPreview() {
    const g = Group.create();
    const r = Rectangle.fromHandle(gg_rct_undead_unit_showcase);

    if (r) {
        g?.enumUnitsInRect(r, () => {
            const u = Group.getFilterUnit();

            if (u && u.typeId !== FourCC("ntav")) {
                u.addAbility(FourCC("Aall"));
                u.setField(UNIT_RF_HIT_POINTS_REGENERATION_RATE, 10);
                u.setField(UNIT_RF_MANA_REGENERATION, -100);
                //@ts-ignore
                // u.setField(UNIT_IF_MOVE_TYPE, 3);
                // ConvertMoveType();
            }

            return true;
        });
    }
}
