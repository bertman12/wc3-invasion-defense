import { Frame, MapPlayer, Trigger } from "w3ts";
import { playerStates } from "./players";
/**
 * Nothing may exist outside the 4:3 aspect ration of your resolution
 */
export function initFrames() {
  playerUnitRallyCheckbox();
}

function playerUnitRallyCheckbox() {
  const originFrame = BlzGetOriginFrame(ORIGIN_FRAME_GAME_UI, 0);
  
  if(originFrame){
    const frame = BlzCreateFrame("QuestCheckBox2",  originFrame, 0, 0)
    const trigger = CreateTrigger();

    if(frame) {
      
      BlzFrameSetAbsPoint(frame, FRAMEPOINT_CENTER, 0.4, 0.16)
      BlzFrameSetSize(frame, 0.025, 0.025);
      BlzTriggerRegisterFrameEvent(trigger, frame, FRAMEEVENT_CHECKBOX_CHECKED)
      BlzTriggerRegisterFrameEvent(trigger, frame, FRAMEEVENT_CHECKBOX_UNCHECKED)

      TriggerAddAction(trigger, () => {
  
        if (BlzGetTriggerFrameEvent() == FRAMEEVENT_CHECKBOX_CHECKED || BlzGetTriggerFrameEvent() == FRAMEEVENT_CHECKBOX_UNCHECKED){

          const p = MapPlayer.fromEvent();
          
          if(p){
            const playerState = playerStates.get(p.id);

            if(playerState) {
              playerState.rallyToHero = !playerState.rallyToHero;
              if(playerState.rallyToHero) BlzDisplayChatMessage(p.handle,p.id,  "Purchased units will now move to your hero automatically.")
              if(!playerState.rallyToHero) BlzDisplayChatMessage(p.handle,p.id,  "Purchased units will no longer move to your hero automatically. ")
              playerStates.set(p.id, playerState);
            };
          }
        }
        
      })
      
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

          if(f) buttonIconFrame?.setPoint(FRAMEPOINT_RIGHT, f, FRAMEPOINT_LEFT, 0,0);
          // Give that buttonFrame a size
          buttonIconFrame?.setSize(0.025, 0.025);

          // const t = Trigger.create();

          // t.triggerRegisterFrameEvent(buttonFrame, FRAMEEVENT_CONTROL_CLICK);

          // t.addAction(() => {print("My button was clicked!")});
       }

      }
 
 
    }
  }
  
}


// BlzFrameSetAbsPoint takes one point of a Frame unbound that point and places it to a specific coordinates on the screen.
function moveFrame(){}
// BlzFrameSetPoint places a point of FrameA relative to a point of FrameB. When FrameB moves FrameA's point will keep this rule and moves with it.
function assignFrameChild(){}
// BlzFrameClearAllPoints removes all curent bound points of that frame.
function releaseFrameChildren(){}
// BlzFrameSetAllPoints FrameA will copy FrameB in size and position. FrameA will update when FrameB is changed later
function imitateFrame(){}

// FRAMEPOINT_TOPLEFT
// FRAMEPOINT_TOP
// FRAMEPOINT_TOPRIGHT
// FRAMEPOINT_LEFT
// FRAMEPOINT_CENTER
// FRAMEPOINT_RIGHT
// FRAMEPOINT_BOTTOMLEFT
// FRAMEPOINT_BOTTOM
// FRAMEPOINT_BOTTOMRIGHT