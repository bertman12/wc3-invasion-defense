import { Quest, Timer } from "w3ts";
import { tColor } from "./misc";

export function init_quests(){
    Timer.create().start(1, false, () => {
        
        addQuest("Map Info", "Created by JediMindTrix/NihilismIsDeath", "ReplaceableTextures\\CommandButtons\\BTNPeon.blp" );

        addQuest("Commands", `
        ${tColor("-start", "goldenrod")} : starts the round.
        ${tColor("-end", "goldenrod")} : ends the round.
        `, "ReplaceableTextures\\CommandButtons\\BTNClayFigurine.blp" );

        addQuest("Basic Game Info", `
        |cffE0A526Objective|r - Hold out for 10 nights until reinforcements arrive. Start off by defending the northern farmlands.

        |cffE0A526Supplies|r - Certain units carry supplies which can be used to heal units. They also get bonuses from supply structures.

        |cffE0A526Buying Units|r - Certain units are sold at different buildings.

        |cffE0A526Upgrades|r - Certain buildings will provide upgrades to your units at the start of each day.

        |cffE0A526Economy|r - Certain buildings will grant lumber, gold, supplies and food.
        `, "ReplaceableTextures\\CommandButtons\\BTNClayFigurine.blp" );
      });
}

export function addQuest(title: string, description: string, iconPath?: string){
    const q = Quest.create();

    if(q){
        q.setTitle(title);
        q.setDescription(description);
        if(iconPath) q.setIcon(iconPath);
    }
}
