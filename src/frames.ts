import { Frame } from "w3ts";

export function initFrames() {
  // Create a "GLUEBUTTON" named "Facebutton", the clickable Button, for game UI
  const origin = Frame.fromOrigin(ORIGIN_FRAME_GAME_UI, 0)

    if(origin){
        const buttonFrame = new Frame("FaceButton", origin, 0, 0, "GLUEBUTTON", "");
        // Place the buttonFrame to the center of the screen
        buttonFrame.setAbsPoint(FRAMEPOINT_CENTER, 0.4, 0.3);

        // Give that buttonFrame a size
        buttonFrame.setSize(0.05, 0.05);
    }

    // const originFrame = BlzGetOriginFrame(ORIGIN_FRAME_GAME_UI, 0);

    // if(!originFrame) return;

    // BlzCreateFrameByType("", "my-frame", originFrame, "", 1)
    
    // BlzLoadTOCFile("");
    // // Copy
    // // Create a "GLUEBUTTON" named "Facebutton", the clickable Button, for game UI
    // const originFrame = Frame.fromOrigin(ORIGIN_FRAME_GAME_UI, 0);
    // if(originFrame){
    //     const buttonFrame = Frame.createType("FaceButton", originFrame, 0, "originFrame", "originFrame");
        
    //     // Place the buttonFrame to the center of the screen
    //     buttonFrame?.setAbsPoint(FRAMEPOINT_CENTER, 0.4, 0.3);

    //     // Give that buttonFrame a size
    //     buttonFrame?.setSize(0.05, 0.05);
    // }

}