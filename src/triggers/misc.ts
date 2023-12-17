import { Group, Rectangle, Trigger } from "w3ts";

export function init_miscellaneousTriggers() {
    setupUnitPreviewArea();
    preventMassTeleportGrief();
}

function setupUnitPreviewArea() {
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

function preventMassTeleportGrief() {
    const t = Trigger.create();

    // const previewRegion = Region.create();
    // const previewRectangle = Rectangle.fromHandle(gg_rct_undead_unit_showcase);
    // if (!previewRectangle || !previewRegion) {
    //     return;
    // }
    // previewRegion.addRect(previewRectangle);

    // t.registerEnterRegion(previewRegion.handle, () => true);
    t.registerAnyUnitEvent(EVENT_PLAYER_UNIT_SPELL_CHANNEL);

    t.addAction(() => {
        //player casts teleport check if the unit they are teleporting to is in region
        // print("Unit entered preview area!");
        const spellNumberCast = GetSpellAbilityId();
        print("Spell cast: ", spellNumberCast);
        const illegalSpells = [FourCC("Almt"), FourCC("A01Y"), FourCC("A00H"), 1095331188];

        print("Illegal spell numbers: ", ...illegalSpells.map((x) => x.toString() + " "));
        if (illegalSpells.includes(spellNumberCast)) {
            print("Player cast illegal spell!");
        }
    });
}
