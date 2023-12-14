import { Sound, Timer } from "w3ts";
import { W3TS_HOOK, addScriptHook } from "w3ts/hooks";
import { initFrames } from "./frames";
import { setupNightAndDayHooks } from "./hooks/startOfDay";
import { init_map_triggers } from "./init";
import { init_startingResources, setupPlayers } from "./players";
import { TimerManager } from "./shared/Timers";
import { RoundManager } from "./shared/round-manager";
import { setup_destroyStructure } from "./towns";
import { init_armyControllerTrigs } from "./triggers/armyController";
import { init_cameraTrigs } from "./triggers/camera";
import { init_itemAbilities } from "./triggers/items";
import { setupUndeadUnitPreview } from "./triggers/misc";
import { init_upgradeBasedTriggers } from "./triggers/upgrades";
import { trig_wayGate } from "./triggers/waygate";
import { init_undead } from "./undead/taxonomy";
import { notifyPlayer } from "./utils/misc";
import { init_quests } from "./utils/quests";
import { init_economyTriggers } from "./triggers/economy/init";

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
            notifyPlayer("Place your Town Hall with your hero.");
            TimerManager.startDayTimer(() => {
                RoundManager.startNextRound();
            }, 240);
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
        // const u = Unit.create(Players[9], FourCC("hfoo"), 0, 0);
        // u?.issueOrderAt(OrderId.Move, -300, 2850);
        // u?.setTimeScale(0.25);

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
        init_armyControllerTrigs();
        init_cameraTrigs();
        init_upgradeBasedTriggers();
        init_economyTriggers();
        //10 second timer
        init_undead();
        //For looking at minimap icons
        // Array.from(minimapIconPathsSet).forEach((path, index) => {
        //     print(index, " - ", path);
        //     CreateMinimapIcon(-20000 + index * 4000, 0, 255, 255, 255, path, FOG_OF_WAR_FOGGED);
        // })
    } catch (e) {
        print("An error occurred: ", e);
    }
}

addScriptHook(W3TS_HOOK.MAIN_AFTER, tsMain);
