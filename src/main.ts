import { Sound, Timer, Unit } from "w3ts";
import { OrderId, Players } from "w3ts/globals";
import { W3TS_HOOK, addScriptHook } from "w3ts/hooks";
import { init_itemAbilities } from "./abilities/items";
import { setupUndeadUnitPreview } from "./abilities/misc";
import { trig_wayGate } from "./abilities/waygate";
import { initFrames } from "./frames";
import { init_map_triggers } from "./init";
import { init_startingResources, initializePlayers } from "./players";
import { TimerManager } from "./shared/Timers";
import { setup_reportCasualtyCounts } from "./shared/misc";
import { RoundManager } from "./shared/round-manager";
import { trig_destroyHumanBuilding } from "./towns";
import { convertHumanToUndeadStructures } from "./undead/conversion";
import { setup_undeadSpawn } from "./undead/taxonomy";
import { tColor } from "./utils/misc";
import { init_quests } from "./utils/quests";

const BUILD_DATE = compiletime(() => new Date().toUTCString());
const TS_VERSION = compiletime(() => require("typescript").version);
const TSTL_VERSION = compiletime(() => require("typescript-to-lua").version);

compiletime(({ objectData, constants }) => {
    objectData.save();
});

function tsMain() {
    try {
        print(`Build: ${BUILD_DATE}`);
        print(`Typescript: v${TS_VERSION}`);
        print(`Transpiler: v${TSTL_VERSION}`);
        print(" ");
        trig_wayGate();
        setupUndeadUnitPreview();
        initFrames();

        //Game starting message
        Timer.create().start(5, false, () => {
            Sound.fromHandle(gg_snd_U08Archimonde19)?.start();
            Sound.fromHandle(gg_snd_Hint)?.start();
            print(`[${tColor("Objective", "goldenrod")}] - Defend the capital city`);
            print("The elite nobles of the Kingdom of Alexandria must rally their forces to fight the undead. The capital city must survive!");
            print("");
            print(`Type ${tColor("-start", "goldenrod")} to start the game.`);
        });

        initializePlayers();
        SetGameDifficulty(MAP_DIFFICULTY_INSANE);
        init_quests();
        trig_destroyHumanBuilding();
        convertHumanToUndeadStructures();

        //Environment setup
        SuspendTimeOfDay(true);
        SetTimeOfDay(12);
        ClearMapMusic();
        StopMusic(false);
        PlayMusic(gg_snd_NightElfX1);

        TimerManager.trig_setup();
        const u = Unit.create(Players[9], FourCC("hfoo"), 0, 0);
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

        setup_reportCasualtyCounts();
        init_itemAbilities();
        init_map_triggers();
        RoundManager.trig_setup_StartRound();

        init_startingResources();
        setup_undeadSpawn();
        // setup_zombies();
    } catch (e) {
        print("An error occurred: ", e);
    }
}

addScriptHook(W3TS_HOOK.MAIN_AFTER, tsMain);
