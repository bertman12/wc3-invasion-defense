import { RoundManager } from './shared/round-manager';
import { W3TS_HOOK, addScriptHook } from "w3ts/hooks";
import { init_startingResources, initializePlayerStateInstances } from "./players";
import { init_map_triggers } from './init';
import { forEachAlliedPlayer } from './utils/players';
import { setup_transferTownControl } from './towns';
import { Sound, Timer, Unit } from 'w3ts';
import { tColor } from './utils/misc';

const BUILD_DATE = compiletime(() => new Date().toUTCString());
const TS_VERSION = compiletime(() => require("typescript").version);
const TSTL_VERSION = compiletime(() => require("typescript-to-lua").version);

compiletime(( { objectData, constants }) => {
  objectData.save();
});

function tsMain() {
  try {
    print(`Build: ${BUILD_DATE}`);
    print(`Typescript: v${TS_VERSION}`);
    print(`Transpiler: v${TSTL_VERSION}`);
    print(" ");
    print("Welcome to TypeScript!");
    print(" ");

    Timer.create().start(5, false, () => {
      Sound.fromHandle(gg_snd_Hint)?.start();
      print(`[${tColor("Objective", "goldenrod")}] - Defend the capital city`);
      print("The elite nobles of the Kingdom of Alexandria must rally their forces to fight the undead. The capital city must survive!");
    })
    
    initializePlayerStateInstances();
    SetGameDifficulty(MAP_DIFFICULTY_INSANE);
    SetMeleeAI();
    
    setup_transferTownControl();

    SuspendTimeOfDay(true);
    SetTimeOfDay(12);
    ClearMapMusic();

    StopMusic(false);
    PlayMusic(gg_snd_NightElfX1);

    //For looking at minimap icons
    // Array.from(minimapIconPaths).forEach((path, index) => {
    //   CreateMinimapIcon(-20000 + (index*4000), 0, 255, 255, 255, path, FOG_OF_WAR_FOGGED);
    // });

    forEachAlliedPlayer((p, index) => {
      Unit.create(p, FourCC("Hpal"), -300 + (50 * index), -300);
    })

    init_map_triggers();
    RoundManager.trig_setup_StartRound();

    init_startingResources();
  } catch (e) {
    print(e);
  }
}

addScriptHook(W3TS_HOOK.MAIN_AFTER, tsMain);
