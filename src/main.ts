import { RoundManager } from './shared/round-manager';
import { W3TS_HOOK, addScriptHook } from "w3ts/hooks";
import { init_startingResources, initializePlayerStateInstances } from "./players";
import { init_map_triggers } from './init';

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
    print("Rally your forces and prepare for an undead attack. The capital city must survive!");

    initializePlayerStateInstances();

    SuspendTimeOfDay(true);
    SetTimeOfDay(12);
    StopMusic(false);
    PlayMusic(gg_snd_NagaTheme);

    init_map_triggers();
    RoundManager.trig_setup_StartRound();

    init_startingResources();
  } catch (e) {
    print(e);
  }
}

addScriptHook(W3TS_HOOK.MAIN_AFTER, tsMain);
