import { RoundManager } from './shared/round-manager';
import { W3TS_HOOK, addScriptHook } from "w3ts/hooks";
import { init_startingResources, initializePlayerStateInstances, initializePlayers } from "./players";
import { init_map_triggers } from './init';
import { forEachAlliedPlayer, forEachPlayer } from './utils/players';
import { setup_transferTownControl } from './towns';
import { FogModifier, Sound, Timer, Unit } from 'w3ts';
import { TimerManager } from './shared/Timers';
import { Players } from 'w3ts/globals';
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

    Timer.create().start(5, false, () => {
      Sound.fromHandle(gg_snd_U08Archimonde19)?.start();
      Sound.fromHandle(gg_snd_Hint)?.start();
      print(`[${tColor("Objective", "goldenrod")}] - Defend the capital city`);
      print("The elite nobles of the Kingdom of Alexandria must rally their forces to fight the undead. The capital city must survive!");
      print("");
      print(`Type ${tColor("-start", "goldenrod")} to start the game.`);
    });

    initializePlayers();
    initializePlayerStateInstances();
    SetGameDifficulty(MAP_DIFFICULTY_INSANE);

    setup_transferTownControl();

    SuspendTimeOfDay(true);
    SetTimeOfDay(12);
    ClearMapMusic();

    StopMusic(false);
    PlayMusic(gg_snd_NightElfX1);

    TimerManager.trig_setup();

    //For looking at minimap icons
    // Array.from(minimapIconPaths).forEach((path, index) => {
    //   CreateMinimapIcon(-20000 + (index*4000), 0, 255, 255, 255, path, FOG_OF_WAR_FOGGED);
    // });



    // forEachPlayer(p => {
    //   const clearFogState = FogModifier.create(Players[0], FOG_OF_WAR_VISIBLE, 0,0, 25000, true, true);
    //   clearFogState?.start();
    //   clearFogState?.destroy();
    // })




    init_map_triggers();
    RoundManager.trig_setup_StartRound();

    init_startingResources();
  } catch (e) {
    print(e);
  }
}

addScriptHook(W3TS_HOOK.MAIN_AFTER, tsMain);
