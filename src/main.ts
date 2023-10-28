import { Timer, Unit } from "w3ts";
import { Players } from "w3ts/globals";
import { W3TS_HOOK, addScriptHook } from "w3ts/hooks";
import { Units } from "@objectdata/units";
import { init_map_triggers } from "./init";
import { initFrames } from "./frames";
import { zombieSpawn } from "./zombies";
import { startRound } from "./roundManager";

const BUILD_DATE = compiletime(() => new Date().toUTCString());
const TS_VERSION = compiletime(() => require("typescript").version);
const TSTL_VERSION = compiletime(() => require("typescript-to-lua").version);

compiletime(( { objectData, constants }) => {
  const unit = objectData.units.get(constants.units.Footman);

  if (!unit) {
    return;
  }

  unit.modelFile = "units\\human\\TheCaptain\\TheCaptain.mdl";

  objectData.save();
});

function tsMain() {
  try {
    print(`Build: ${BUILD_DATE}`);
    print(`Typescript: v${TS_VERSION}`);
    print(`Transpiler: v${TSTL_VERSION}`);
    print(" ");
    print("Welcome to TypeScript!");

    // const unit = new Unit(Players[0], FourCC(Units.Footman), 0, 0, 270);
    // // Unit.create(Players[0], FourCC(Units.Footman), 0,0,0)
    // new Timer().start(1.0, true, () => {
    //   unit.color = Players[math.random(0, bj_MAX_PLAYERS)].color;
    // });

    init_map_triggers();
    initFrames();
    print("Helloooo")
    
    //Spawn zombies
    Timer.create().start(5, false, () => {startRound(); zombieSpawn()});

  } catch (e) {
    print(e);
  }
}

addScriptHook(W3TS_HOOK.MAIN_AFTER, tsMain);
