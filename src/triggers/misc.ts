import { Group, Rectangle } from "w3ts";

export function setupUnitPreviewArea() {
    const g = Group.create();
    const r = Rectangle.fromHandle(gg_rct_undead_unit_showcase);

    if (r) {
        g?.enumUnitsInRect(r, () => {
            const u = Group.getFilterUnit();

            if (u && u.typeId !== FourCC("ntav")) {
                u.addAbility(FourCC("Aall"));
                u.setField(UNIT_RF_HIT_POINTS_REGENERATION_RATE, 10);
                u.setField(UNIT_RF_MANA_REGENERATION, -100);
                u.nameProper = "Click me to see spells.";
                u.setField(UNIT_IF_MOVE_TYPE, 2);
                //@ts-ignore
                // ConvertMoveType();
            }

            return true;
        });
    }
}
