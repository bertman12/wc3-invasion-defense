import { forEachPlayer, giveRoundEndResources } from "src/players";
import { forEachUnitOfPlayerWithAbility } from "src/utils/players";
import { spawnZombies } from "src/zombies";
import { Trigger, Sound, Timer } from "w3ts";
import { Players } from "w3ts/globals";

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
        
        const zombieTimer = Timer.create();
        zombieTimer.start(15, true, () => spawnZombies(RoundManager.currentRound));
        
        const timer = Timer.create()
        
        timer.start(59, false, () => {RoundManager.endCurrentRound(zombieTimer)});
        
        print(`Round ${RoundManager.currentRound} has begun...`);
    }
    
    static endCurrentRound(zombieTimer?: Timer){
        print(`Round ${RoundManager.currentRound} has ended...`);
        giveRoundEndResources();
        zombieTimer?.destroy();
        
        Sound.fromHandle(gg_snd_QuestCompleted)?.start();
        
        SetTimeOfDay(12);

        //Refill stocks for units - doesn't do anything >=(
        AddUnitToAllStock(FourCC("h000"), 20, 20);

        forEachPlayer((p) => {
            forEachUnitOfPlayerWithAbility(p, "A002", (u) => {
                print("Found a unit with the ability: ", u.name);
            })
            forEachUnitOfPlayerWithAbility(p, "A000", (u) => {
                print("Found a unit with the ability: ", u.name);
            })
        })


        Timer.create().start(5, false, () => {
            Sound.fromHandle(gg_snd_Hint)?.start();
            print("Supply horses have arrived at the capital. They are able to heal your units.");
        });
    }
} 

