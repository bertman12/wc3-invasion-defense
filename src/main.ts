import { RoundManager } from './shared/round-manager';
import { W3TS_HOOK, addScriptHook } from "w3ts/hooks";
import { init_startingResources, initializePlayerStateInstances, initializePlayers } from "./players";
import { init_map_triggers } from './init';
import { forEachAlliedPlayer, forEachPlayer } from './utils/players';
import { setup_transferTownControl } from './towns';
import { FogModifier, Quest, Sound, Timer, Unit } from 'w3ts';
import { TimerManager } from './shared/Timers';
import { OrderId, Players } from 'w3ts/globals';
import { tColor } from './utils/misc';
import { setup_zombies } from './zombies';
import { Units } from 'war3-objectdata-th';
import { wayGateInit } from './abilities/waygate';
import { setupUndeadUnitPreview } from './abilities/misc';

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
    wayGateInit();
    setupUndeadUnitPreview();
    Timer.create().start(1, false, () => {
      const mapInfo = Quest.create()

      if(mapInfo){
        mapInfo.setTitle("Map Info");
        mapInfo.setDescription("Created by JediMindTrix/NihilismIsDeath");
        mapInfo.setIcon("ReplaceableTextures\\CommandButtons\\BTNPeasant.blp");
      }

      const commands = Quest.create()

      if(commands){
        commands.setTitle("Commands");
        commands.setDescription(`
        ${tColor("-start", "goldenrod")} : starts the round.
        ${tColor("-end", "goldenrod")} : ends the round.
        `);
        commands.setIcon("ReplaceableTextures\\CommandButtons\\BTNClayFigurine.blp");
      }

      const basicGuide = Quest.create();

      if(basicGuide){
        basicGuide.setTitle("Basic Game Info");
        basicGuide.setDescription(`
        |cffE0A526Objective|r - Hold out for 10 nights until reinforcements arrive. Start off by defending the northern farmlands.

        |cffE0A526Supplies|r - Certain units carry supplies which can be used to heal units. They also get bonuses from supply structures.

        |cffE0A526Buying Units|r - Certain units are sold at different buildings.

        |cffE0A526Upgrades|r - Certain buildings will provide upgrades to your units at the start of each day.

        |cffE0A526Economy|r - Certain buildings will grant lumber, gold, supplies and food.
        `);

        basicGuide.setIcon("ReplaceableTextures\\CommandButtons\\BTNClayFigurine.blp");
      }


    });

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
    const u = Unit.create(Players[9], FourCC("hfoo"), 0,0)
    u?.issueOrderAt(OrderId.Move, -300, 2850);
    u?.setTimeScale(0.25);

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
    setup_zombies();

  } catch (e) {
    print(e);
  }
}

addScriptHook(W3TS_HOOK.MAIN_AFTER, tsMain);


