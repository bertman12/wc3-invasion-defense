import { forEachPlayer, forEachUnitOfPlayerWithAbility, forEachUnitTypeOfPlayer } from "src/utils/players";
import { spawnZombies } from "src/zombies";
import { Trigger, Sound, Timer } from "w3ts";
import { Players } from "w3ts/globals";
import { ABILITIES } from "./enums";
import { player_giveRoundEndResources } from "src/players";
import { tColor } from "src/utils/misc";
import { playCustomSound } from "./sounds";
import { TimerManager } from "./Timers";

/**
 * rounds should be able to be started early, but should automatically start after 2 minutes the round has ended. That way people arent intentionally waiting for mana to return.
 */

export class RoundManager {
    static currentRound: number = 0;

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
            print("Congratulations. The map is still in development with many more features to come.");
            return;
        }
        
        Sound.fromHandle(gg_snd_QuestNew)?.start();
        Sound.fromHandle(gg_snd_TheHornOfCenarius)?.start();
        ClearMapMusic();
        StopMusic(false);
        PlayMusic(gg_snd_NightElfX1);
        
        //Set to night time 
        SetTimeOfDay(0);


        spawnZombies(RoundManager.currentRound, RoundManager.endCurrentRound);
        
        print(`Night ${RoundManager.currentRound} has begun...`);
    }
    
    static endCurrentRound(){
        print(`Night ${RoundManager.currentRound} has ended...`);
        SetTimeOfDay(12);
        player_giveRoundEndResources(RoundManager.currentRound);
        
        ClearMapMusic();
        StopMusic(false);
        PlayMusic(gg_snd_IllidansTheme);

        Sound.fromHandle(gg_snd_QuestCompleted)?.start();

        Timer.create().start(5, false, () => {
            Sound.fromHandle(gg_snd_Hint)?.start();
            print(`[${tColor("WARNING", "red")}] - The remaining undead are marching upon your capital.`)
            print("Supply horses have arrived at the capital. Use them to heal your units.");
        });

        TimerManager.startDayTimer(() => {RoundManager.startNextRound()});
    }
} 

