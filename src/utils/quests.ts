import { Quest, Timer } from "w3ts";
import { tColor } from "./misc";

export function init_quests() {
    Timer.create().start(1, false, () => {
        addQuest(
            "Basic Game Info",
            `\n
            \n${tColor("Main Objective", "goldenrod")}: Survive for 9 nights
        `,
            "ReplaceableTextures\\CommandButtons\\BTNPeasant.blp",
        );

        addQuest(
            "Commands",
            `
            \n${tColor("-cam ####", "goldenrod")}: Sets the camera distance.
            \n${tColor("-start", "goldenrod")}: Only use if the next round hasn't started and it is night and you see no timer.
            \n${tColor("-heromode", "goldenrod")}: Experimental - Sets the game mode to hero mode. Must be used before preparation timer at the beginning has ended.
        `,
            "ReplaceableTextures\\WorldEditUI\\Doodad-Cinematic.blp",
            false,
        );

        addQuest(
            "Economy",
            `\n
            \n${tColor("Economy", "goldenrod")}: Primary income will come from your gold mine.
            \n${tColor("Wisps", "goldenrod")}: Primary lumber income.
            \n${tColor("Druid Farmer", "goldenrod")}: Secondary source of income. Provides gold every minute.
        `,
            "ReplaceableTextures\\CommandButtons\\BTNChestOfGold.blp",
            false,
        );

        addQuest(
            "Undead Spawns",
            `\n
             \n${tColor("Undead Spawns", "goldenrod")}: The skulls on the minimap show their chosen spawn locations.
             \n${tColor("White Skull Spawns", "goldenrod")}: This is your standard undead spawn. It will only spawn tier 1 and 2 units. Undead will spawn every 20 seconds from these spawns. 
             \n${tColor("Yellow Skull Spawns", "goldenrod")}: May spawn Tier 1,2 and 3 units. Has a higher chance to spawn stronger undead. 
             \n${tColor("Orange Skull Spawns", "goldenrod")}: Spawns Tier 2 and 3 units. 
             \n${tColor("Red Skull Spawns", "goldenrod")}: Only spawns Tier 3. 
             \n${tColor("Undead Scaling", "goldenrod")}: Every night that passes, the health and damage of the undead will increase, as well as the frequency of higher tier units. 
             \n${tColor("Final Nights", "goldenrod")}: The final night lasts for 9 minutes.  
        `,
            "ReplaceableTextures\\CommandButtons\\BTNSkeletalOrcChampion.blp",
        );

        addQuest(
            "Loading Screen Info",
            `\n|cffff00ffObjective|r - Survive for 9 nights. 
            \n|cff00ff00Beginner|r : Pick Hero at the Tarvern then use your hero to place your town hall. Build some towers near the walls.
            \n|cff00ff00Hero Abilities have been enhanced and also go to level 4 now.|r
            \n|cffff0000Bosses|r: Spawns every 3rd night.
            \n|cffffff00Income|r -  Build Druid Farmers for additional gold income.
            \n|cffffff00Engineers|r - Able to build defensive structures. 
            \n|cffff0000Final Night|r: Lasts 9 minutes.
            \n|cffff0000Lose Condition|r: No town halls remain.
            
            Made by JediMindTrix/NihilismIsDeath
            
        `,
            "ReplaceableTextures\\CommandButtons\\BTNBansheeRanger.blp",
            false,
        );

        addQuest("|cffffcc00Undead Siege Defense v0.30|r", "Created by JediMindTrix/NihilismIsDeath", "ReplaceableTextures\\CommandButtons\\BTNClayFigurine.blp", false);
    });
}

export function addQuest(title: string, description: string, iconPath?: string, required: boolean = true) {
    const q = Quest.create();
    if (q) {
        q.setTitle(title);
        q.required = required;
        q.setDescription(description);
        if (iconPath) {
            q.setIcon(iconPath);
        }
    }
}
