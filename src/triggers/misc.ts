import { Group, Rectangle, Region, Trigger, Unit } from "w3ts";
import { OrderId } from "w3ts/globals";

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

    const previewRegion = Region.create();
    const previewRectangle = Rectangle.fromHandle(gg_rct_undead_unit_showcase);
    if (!previewRectangle || !previewRegion) {
        return;
    }
    previewRegion.addRect(previewRectangle);

    t.registerAnyUnitEvent(EVENT_PLAYER_UNIT_SPELL_CHANNEL);

    t.addAction(() => {
        //player casts teleport check if the unit they are teleporting to is in region
        const spellNumberCast = GetSpellAbilityId();
        const illegalSpells = [FourCC("Almt"), FourCC("A01Y"), FourCC("A00H"), 1095331188];

        if (illegalSpells.includes(spellNumberCast)) {
            const caster = Unit.fromEvent();

            if (caster && IsPointInRegion(previewRegion.handle, GetSpellTargetX(), GetSpellTargetY())) {
                caster.issueImmediateOrder(OrderId.Stop);
                print("|cffff0000Illegal Teleport!|r");
            }
        }
    });
}
