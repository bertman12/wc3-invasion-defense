import { forEachPlayer } from "src/utils/players";
import { FogModifier, Sound, Timer, Trigger } from "w3ts";
import { Players } from "w3ts/globals";
import { GameConfig } from "./GameConfig";
import { TimerManager } from "./Timers";

/**
 * To help avoid circular dependencies, this class will not import anything, but will instead export it's services.
 * or just help keep imports minimal
 */

/**
 * possible we can add more data usable within these function types to serve multiple purposes
 */
type RoundEndFn = (round: number) => void;
type RoundStartFn = (round: number) => void;

/**
 * Singleton class
 */
export class RoundManager {
    static currentRound: number = 1;
    private static roundStartSubscribers: RoundStartFn[] = [];
    private static roundEndSubscribers: RoundEndFn[] = [];

    static trig_setup_StartRound() {
        const tStart = Trigger.create();
        tStart.registerPlayerChatEvent(Players[0], "-start", false);
        tStart.addAction(() => {
            RoundManager.startNextRound();
        });

        const tEnd = Trigger.create();
        tEnd.registerPlayerChatEvent(Players[0], "-end", false);
        tEnd.addAction(() => {
            RoundManager.endCurrentRound();
        });
    }

    static startNextRound() {
        if (GameConfig.playersAreDefeated) {
            return;
        }

        Sound.fromHandle(gg_snd_QuestNew)?.start();
        Sound.fromHandle(gg_snd_TheHornOfCenarius)?.start();
        ClearMapMusic();
        StopMusic(false);
        PlayMusic(gg_snd_Undead3);

        //Set to night time
        SetTimeOfDay(0);

        print(`Night ${RoundManager.currentRound} has begun...`);

        RoundManager.roundStartSubscribers.forEach((cb) => {
            cb(RoundManager.currentRound);
        });

        //Final round
        if (RoundManager.currentRound >= 9) {
            TimerManager.nightTimeDuration = 360;
        }

        TimerManager.startNightTimer(() => {
            RoundManager.endCurrentRound();
        }, TimerManager.nightTimeDuration);
    }

    static endCurrentRound() {
        if (GameConfig.playersAreDefeated) {
            return;
        }

        SetTimeOfDay(12);

        const nightTextFrame = BlzGetFrameByName("nightTextDisplay", 0);
        if (nightTextFrame) {
            BlzFrameSetText(nightTextFrame, `Nights Passed: ${RoundManager.currentRound}/9`);
        }

        RoundManager.roundEndSubscribers.forEach((cb) => {
            cb(RoundManager.currentRound);
            //I would like to hook into before income is applied and after
        });

        if (RoundManager.currentRound >= 9) {
            print("Congratulations, you have won. The map is still in development with many more features to come.");

            forEachPlayer((p) => {
                const clearFogState = FogModifier.create(Players[0], FOG_OF_WAR_VISIBLE, 0, 0, 25000, true, true);
                clearFogState?.start();
            });

            ClearMapMusic();
            StopMusic(true);
            PlayMusic(gg_snd_HeroicVictory);
        } else {
            // ClearMapMusic();
            StopMusic(false);
            PlayMusic(gg_snd_BloodElfTheme);
        }

        Sound.fromHandle(gg_snd_QuestCompleted)?.start();

        Timer.create().start(5, false, () => {
            Sound.fromHandle(gg_snd_Hint)?.start();
        });

        if (RoundManager.currentRound !== 9) {
            TimerManager.startDayTimer(() => {
                RoundManager.startNextRound();
            }, GameConfig.dayDuration);
        }

        RoundManager.currentRound++;
    }

    static onNightStart(cb: RoundStartFn) {
        RoundManager.roundStartSubscribers.push(cb);
    }

    static onDayStart(cb: RoundEndFn) {
        RoundManager.roundEndSubscribers.push(cb);
    }
}
