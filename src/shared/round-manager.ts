import { forEachPlayer, forEachUnitOfPlayerWithAbility, forEachUnitTypeOfPlayer } from "src/utils/players";
import { spawnZombies } from "src/undead/undead";
import { Trigger, Sound, Timer, FogModifier } from "w3ts";
import { Players } from "w3ts/globals";
import { ABILITIES } from "./enums";
import { player_giveHumansStartOfDayResources } from "src/players";
import { tColor } from "src/utils/misc";
import { playCustomSound } from "./sounds";
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

export class RoundManager {
    static currentRound: number = 0;
    static roundStartSubscribers:RoundStartFn[] = [];
    static roundEndSubscribers:RoundEndFn[] = [];

    static trig_setup_StartRound(){
        const tStart = Trigger.create()
        tStart.registerPlayerChatEvent(Players[0], "-start", false);
        tStart.addAction(() => {
            RoundManager.startNextRound();
        });
        
        const tEnd = Trigger.create();
        tEnd.registerPlayerChatEvent(Players[0], "-end", false);
        tEnd.addAction(() => {
            RoundManager.endCurrentRound();
        })
    }
    
    static startNextRound(){
        RoundManager.currentRound++;

        if(RoundManager.currentRound >= 10){
            print("Congratulations, you have won. The map is still in development with many more features to come.");
            print("Nights will continue forever now.");

            forEachPlayer(p => {
                const clearFogState = FogModifier.create(Players[0], FOG_OF_WAR_VISIBLE, 0,0, 25000, true, true);
                clearFogState?.start();
            });
        }

        Sound.fromHandle(gg_snd_QuestNew)?.start();
        Sound.fromHandle(gg_snd_TheHornOfCenarius)?.start();
        ClearMapMusic();
        StopMusic(false);
        PlayMusic(gg_snd_NightElfX1);
        
        //Set to night time 
        SetTimeOfDay(0);

        print(`Night ${RoundManager.currentRound} has begun...`);

        RoundManager.roundStartSubscribers.forEach(cb => {
            cb(RoundManager.currentRound);
        });

        TimerManager.startNightTimer(() => {RoundManager.endCurrentRound()});
    }
    
    static endCurrentRound(){


        print(`Night ${RoundManager.currentRound} has ended...`);
        SetTimeOfDay(12);

        RoundManager.roundEndSubscribers.forEach(cb => {
            cb(RoundManager.currentRound);
        });

        ClearMapMusic();
        StopMusic(false);
        PlayMusic(gg_snd_IllidansTheme);

        Sound.fromHandle(gg_snd_QuestCompleted)?.start();

        Timer.create().start(5, false, () => {
            Sound.fromHandle(gg_snd_Hint)?.start();
            // print(`[${tColor("WARNING", "red")}] - The remaining undead are marching upon your capital.`)
            print("Supply horses have arrived at the capital. Use them to heal your units.");
        });

        TimerManager.startDayTimer(() => {RoundManager.startNextRound()});
    }

    static onNightStart(cb: RoundStartFn){
        RoundManager.roundStartSubscribers.push(cb)
    }

    static onDayStart(cb: RoundEndFn){
        RoundManager.roundEndSubscribers.push(cb)
    }
} 

