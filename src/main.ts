import { Sound, Timer, Unit } from "w3ts";
import { OrderId, Players } from "w3ts/globals";
import { W3TS_HOOK, addScriptHook } from "w3ts/hooks";
import { init_itemAbilities } from "./abilities/items";
import { setupUndeadUnitPreview } from "./abilities/misc";
import { trig_wayGate } from "./abilities/waygate";
import { initFrames } from "./frames";
import { setupNightAndDayHooks } from "./hooks/startOfDay";
import { init_map_triggers } from "./init";
import { init_startingResources, setupPlayers } from "./players";
import { TimerManager } from "./shared/Timers";
import { RoundManager } from "./shared/round-manager";
import { setup_destroyStructure } from "./towns";
import { init_undead } from "./undead/taxonomy";
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
            print("The Heroes of the Kingdom of Alexandria must rally their forces to fight the undead.");
            print(" ");
            print("Take your time to prepare for battle. Get footman to hold choke points, buy some items and invest some money into building Farm Laborers or purchasing structures.");
            print(" ");
        });

        setupPlayers();
        SetGameDifficulty(MAP_DIFFICULTY_INSANE);
        init_quests();

        setup_destroyStructure();

        //Environment setup
        SuspendTimeOfDay(true);
        SetTimeOfDay(12);
        // ClearMapMusic();
        StopMusic(false);
        PlayMusic(gg_snd_NightElfX1);

        TimerManager.trig_setup();
        const u = Unit.create(Players[9], FourCC("hfoo"), 0, 0);
        u?.issueOrderAt(OrderId.Move, -300, 2850);
        u?.setTimeScale(0.25);

        //Give undead map vision
        // forEachPlayer((p) => {
        //     if (p.isPlayerAlly(Players[0]) === false) {
        //         const clearFogState = FogModifier.create(p, FOG_OF_WAR_VISIBLE, 0, 0, 25000, true, true);
        //         clearFogState?.start();
        //     }

        //     // SetPlayerMaxHeroesAllowed(1, p.handle);

        //     // clearFogState?.destroy();
        // });

        init_itemAbilities();
        init_map_triggers();
        RoundManager.trig_setup_StartRound();

        init_startingResources();

        setupNightAndDayHooks();
        //10 second timer
        init_undead();
        //For looking at minimap icons
        // Array.from(minimapIconPathsSet).forEach((path, index) => {
        //     print(index, " - ", path);
        //     CreateMinimapIcon(-20000 + index * 4000, 0, 255, 255, 255, path, FOG_OF_WAR_FOGGED);
        // });
    } catch (e) {
        print("An error occurred: ", e);
    }
}

addScriptHook(W3TS_HOOK.MAIN_AFTER, tsMain);
