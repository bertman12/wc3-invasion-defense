import { Frame, Item, MapPlayer, Trigger } from "w3ts";
import { playerStates } from "./players";
/**
 * Nothing may exist outside the 4:3 aspect ration of your resolution
 */
export function initFrames() {
    playerUnitRallyCheckbox();
    showCurrentNight();
}

function playerUnitRallyCheckbox() {
    const originFrame = BlzGetOriginFrame(ORIGIN_FRAME_GAME_UI, 0);

    if (originFrame) {
        const frame = BlzCreateFrame("QuestCheckBox2", originFrame, 0, 0);
        const trigger = CreateTrigger();

        if (frame) {
            BlzFrameSetAbsPoint(frame, FRAMEPOINT_CENTER, 0.4, 0.16);
            BlzFrameSetSize(frame, 0.025, 0.025);
            BlzTriggerRegisterFrameEvent(trigger, frame, FRAMEEVENT_CHECKBOX_CHECKED);
            BlzTriggerRegisterFrameEvent(trigger, frame, FRAMEEVENT_CHECKBOX_UNCHECKED);

            TriggerAddAction(trigger, () => {
                if (BlzGetTriggerFrameEvent() == FRAMEEVENT_CHECKBOX_CHECKED || BlzGetTriggerFrameEvent() == FRAMEEVENT_CHECKBOX_UNCHECKED) {
                    const p = MapPlayer.fromEvent();

                    if (p) {
                        const playerState = playerStates.get(p.id);

                        if (playerState) {
                            playerState.rallyToHero = !playerState.rallyToHero;

                            playerStates.set(p.id, playerState);
                        }
                    }
                }
            });

            const gameui = Frame.fromOrigin(ORIGIN_FRAME_GAME_UI, 0);

            if (gameui) {
                // Create a "GLUEBUTTON" named "Facebutton", the clickable Button, for game UI
                const buttonFrame = Frame.createType("FaceButton", gameui, 0, "GLUEBUTTON", "");

                if (buttonFrame) {
                    // Create a BACKDROP named "FaceButtonIcon", the visible image, for buttonFrame.
                    const buttonIconFrame = Frame.createType("FaceButton", gameui, 0, "BACKDROP", "");
                    // buttonIconFrame will mimic buttonFrame in size and position
                    // buttonIconFrame?.setAllPoints(buttonFrame);
                    // Set a Texture
                    buttonIconFrame?.setTexture("ReplaceableTextures\\CommandButtons\\BTNRallyPoint.blp", 0, false);
                    // buttonIconFrame?.setTexture("ReplaceableTextures\\CommandButtons\\BTNSelectHeroOn", 0, false);
                    // Place the buttonFrame to the center of the screen
                    const f = Frame.fromHandle(frame);

                    if (f) {
                        buttonIconFrame?.setPoint(FRAMEPOINT_RIGHT, f, FRAMEPOINT_LEFT, 0, 0);
                    }
                    // Give that buttonFrame a size
                    buttonIconFrame?.setSize(0.025, 0.025);

                    // -- Create the Background a Backdrop
                    const tooltipFrameBackGround = BlzCreateFrame("QuestButtonBaseTemplate", gameui.handle, 0, 0);

                    if (tooltipFrameBackGround) {
                        // -- create a new Button which inherits from "ScriptDialogButton"
                        // const button = BlzCreateFrameByType("GLUETEXTBUTTON", "MyScriptDialogButton", gameui.handle, "ScriptDialogButton", 0)

                        // if(button){
                        //   // -- place the Button to the center of the Screen
                        //   BlzFrameSetAbsPoint(button, FRAMEPOINT_CENTER, 0.4, 0.3)
                        //   // -- set the Button's text
                        //   BlzFrameSetText(button, "My Button Text")

                        // }

                        BlzFrameSetSize(tooltipFrameBackGround, 0.2, 0.025);
                        // -- Create the Text as child of the Background
                        const tooltipFrameText = BlzCreateFrameByType("TEXT", "MyScriptDialogButtonTooltip", tooltipFrameBackGround, "", 0);

                        if (tooltipFrameText && frame) {
                            // -- Copy Size and Position with a small offset.
                            BlzFrameSetPoint(tooltipFrameText, FRAMEPOINT_BOTTOMLEFT, tooltipFrameBackGround, FRAMEPOINT_BOTTOMLEFT, 0.01, 0.01);
                            BlzFrameSetPoint(tooltipFrameText, FRAMEPOINT_TOPRIGHT, tooltipFrameBackGround, FRAMEPOINT_TOPRIGHT, -0.01, -0.01);
                            // -- The background becomes the button's tooltip, the Text as child of the background will share the visibility
                            BlzFrameSetTooltip(frame, tooltipFrameBackGround);
                            // -- Place the Tooltip above the Button
                            BlzFrameSetPoint(tooltipFrameBackGround, FRAMEPOINT_BOTTOM, frame, FRAMEPOINT_TOP, 0, 0.01);
                            // -- Prevent the TEXT from taking mouse control
                            BlzFrameSetEnable(tooltipFrameText, true);
                            BlzFrameSetText(tooltipFrameText, "Trained units will rally to your hero.");
                        }
                    }

                    // const t = Trigger.create();

                    // t.triggerRegisterFrameEvent(buttonFrame, FRAMEEVENT_CONTROL_CLICK);

                    // t.addAction(() => {print("My button was clicked!")});
                }
            }
        }
    }
}

// BlzFrameSetAbsPoint takes one point of a Frame unbound that point and places it to a specific coordinates on the screen.
function moveFrame() {}
// BlzFrameSetPoint places a point of FrameA relative to a point of FrameB. When FrameB moves FrameA's point will keep this rule and moves with it.
function assignFrameChild() {}
// BlzFrameClearAllPoints removes all curent bound points of that frame.
function releaseFrameChildren() {}
// BlzFrameSetAllPoints FrameA will copy FrameB in size and position. FrameA will update when FrameB is changed later
function imitateFrame() {}

function showCurrentNight() {
    const gameui = Frame.fromOrigin(ORIGIN_FRAME_GAME_UI, 0);

    if (!gameui) {
        return;
    }

    // const tooltipFrameBackGround = BlzCreateFrame("OptionsPanel", gameui.handle, 0, 0);
    // const tooltipFrameBackGround = BlzCreateFrame("LumberBackdrop", gameui.handle, 0, 3);
    // const tooltipFrameBackGround = BlzCreateFrame("EscMenuBackdrop", gameui.handle, 0, 0);
    const tooltipFrameBackGround = BlzCreateFrame("QuestButtonBaseTemplate", gameui.handle, 0, 0);

    // const tooltipFrameBackGround = BlzGetFrameByName("LogArea", 0);

    if (!tooltipFrameBackGround) {
        return;
    }

    BlzFrameSetAbsPoint(tooltipFrameBackGround, FRAMEPOINT_TOP, 0.5, 0.575);
    BlzFrameSetSize(tooltipFrameBackGround, 0.12, 0.025);

    // BlzFrameSetSize(tooltipFrameBackGround, 0.2, 0.025);
    // -- Create the Text as child of the Background
    const tooltipFrameText = BlzCreateFrameByType("TEXT", "nightTextDisplay", tooltipFrameBackGround, "", 0);

    if (!tooltipFrameText) {
        return;
    }

    // -- Copy Size and Position with a small offset.
    BlzFrameSetPoint(tooltipFrameText, FRAMEPOINT_BOTTOMLEFT, tooltipFrameBackGround, FRAMEPOINT_BOTTOMLEFT, 0.01, 0.01);
    BlzFrameSetPoint(tooltipFrameText, FRAMEPOINT_TOPRIGHT, tooltipFrameBackGround, FRAMEPOINT_TOPRIGHT, -0.01, -0.01);
    // -- The background becomes the button's tooltip, the Text as child of the background will share the visibility
    // BlzFrameSetTooltip(frame, tooltipFrameBackGround);
    // -- Place the Tooltip above the Button
    // BlzFrameSetPoint(tooltipFrameBackGround, FRAMEPOINT_BOTTOM, frame, FRAMEPOINT_TOP, 0, 0.01);
    // -- Prevent the TEXT from taking mouse control
    BlzFrameSetEnable(tooltipFrameText, true);
    BlzFrameSetText(tooltipFrameText, "Nights Passed: 0");
}

// FRAMEPOINT_TOPLEFT
// FRAMEPOINT_TOP
// FRAMEPOINT_TOPRIGHT
// FRAMEPOINT_LEFT
// FRAMEPOINT_CENTER
// FRAMEPOINT_RIGHT
// FRAMEPOINT_BOTTOMLEFT
// FRAMEPOINT_BOTTOM
// FRAMEPOINT_BOTTOMRIGHT
