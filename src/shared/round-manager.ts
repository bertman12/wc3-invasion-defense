import { forEachPlayer, forEachUnitOfPlayerWithAbility } from "src/utils/players";
import { spawnZombies } from "src/zombies";
import { Trigger, Sound, Timer } from "w3ts";
import { Players } from "w3ts/globals";
import { ABILITIES } from "./enums";
import { player_giveRoundEndResources } from "src/players";

/**
 * rounds should be able to be started early, but should automatically start after 2 minutes the round has ended. That way people arent intentionally waiting for mana to return.
 */

export class RoundManager {
    static currentRound: number = 0;

    static trig_setup_StartRound(){
        const t = Trigger.create()
        t.registerPlayerChatEvent(Players[0], "-start", false);
        
        t.addAction(() => {
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
        Sound.fromHandle(gg_snd_QuestNew)?.start();
        
        //Set night time 
        SetTimeOfDay(0);
        
        spawnZombies(RoundManager.currentRound);
        
        // const zombieTimer = Timer.create();
        // zombieTimer.start(15, true, () => spawnZombies(RoundManager.currentRound));
        spawnZombies(RoundManager.currentRound, RoundManager.endCurrentRound)
        // const timer = Timer.create()
        
        // timer.start(59, false, () => {RoundManager.endCurrentRound(zombieTimer)});
        
        print(`Round ${RoundManager.currentRound} has begun...`);
    }
    
    static endCurrentRound(zombieTimer?: Timer){
        print(`Round ${RoundManager.currentRound} has ended...`);
        player_giveRoundEndResources(this.currentRound);
        zombieTimer?.destroy();
        
        Sound.fromHandle(gg_snd_QuestCompleted)?.start();
        
        SetTimeOfDay(12);

        //Refill stocks for units - doesn't do anything >=(
        // AddUnitToAllStock(FourCC("h000"), 20, 20);


    
        //There are 3 units with the ability however we only count 1. I hope to fucking god each unit doesnt have a unique ability id? If they did then comparing getAbility with 
        //Getting ability by ID might get a unique ability code lol, which means we can't store


        Timer.create().start(5, false, () => {
            Sound.fromHandle(gg_snd_Hint)?.start();
            print("Supply horses have arrived at the capital. They are able to heal your units.");
        });
    }
} 

