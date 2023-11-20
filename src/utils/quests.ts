import { Quest, Timer } from "w3ts";
import { tColor } from "./misc";

export function init_quests() {
    Timer.create().start(1, false, () => {
        addQuest(
            "Player 1 Commands",
            `
        ${tColor("-start", "goldenrod")} : starts the round.
        ${tColor("-end", "goldenrod")} : ends the round.
        `,
            "ReplaceableTextures\\WorldEditUI\\StartingLocation.blp",
        );

        addQuest(
            "Basic Game Info",
            `\n
            \n${tColor("Main Objective", "goldenrod")}: Hold out for 15 nights until reinforcements arrive.
            \n${tColor("Upgrades", "goldenrod")}: Certain allied buildings that are not destroyed will provide upgrades.
            \n${tColor("Buying Units", "goldenrod")}: Buy units from allied buildings.
            \n${tColor("Economy", "goldenrod")}: Farms, towns and castles will provide daily income. You can also buy farms to earn +50 gold per day.
        `,
            "ReplaceableTextures\\CommandButtons\\BTNPeasant.blp",
        );

        addQuest(
            "Capturing and Losing Buildings",
            `
            \n${tColor("Human Structures", "goldenrod")}: - Destroyed human structures will turn into undead structures at the start of the next night.
            \n${tColor("Undead Structures", "goldenrod")}: - Destroyed undead structures will turn into human structures at the start of the next day.
        `,
            "ReplaceableTextures\\CommandButtons\\BTNTownHall.blp",
        );

        addQuest(
            "About Undead",
            `\n
             \n${tColor("Undead Spawns", "goldenrod")}: 2 - 5 undead spawns will be chosen at random every night. The skulls on the minimap show their chosen spawn locations.
             \n${tColor("White Skull Spawns", "goldenrod")}: This is your standard undead spawn. It will only spawn tier 1 and 2 units. Undead will spawn every 15 seconds from these spawns. 
             \n${tColor("Orange Skull Spawns", "goldenrod")}: May spawn Tier 1,2 and 3 units. 75% more undead will spawn every 30 seconds from these spawns with a higher chance to spawn stronger undead. 
             \n${tColor("Undead Scaling", "goldenrod")}: Every night that passes, the chance for stronger undead units to spawn will increase. 
        `,
            "ReplaceableTextures\\CommandButtons\\BTNSkeletalOrcChampion.blp",
        );

        addQuest("Map Info", "Created by JediMindTrix/NihilismIsDeath", "ReplaceableTextures\\CommandButtons\\BTNClayFigurine.blp");
    });
}

export function addQuest(title: string, description: string, iconPath?: string) {
    const q = Quest.create();

    if (q) {
        q.setTitle(title);
        q.setDescription(description);
        if (iconPath) {
            q.setIcon(iconPath);
        }
    }
}
