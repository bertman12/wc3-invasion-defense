import { Quest, Timer } from "w3ts";
import { tColor } from "./misc";

export function init_quests() {
    Timer.create().start(1, false, () => {
        addQuest(
            "Player 1 Commands",
            `Only needs to be used once otherwise it will break the game timer cycle.
        ${tColor("-start", "goldenrod")} : starts the round.
        `,
            "ReplaceableTextures\\WorldEditUI\\StartingLocation.blp",
        );

        addQuest(
            "Basic Game Info",
            `\n
            \n${tColor("Main Objective", "goldenrod")}: Hold out for 15 nights until reinforcements arrive.
            \n${tColor("Upgrades", "goldenrod")}: Certain allied buildings that are not destroyed will provide upgrades.
            \n${tColor("Buying Units", "goldenrod")}: Buy units from allied buildings.
        `,
            "ReplaceableTextures\\CommandButtons\\BTNPeasant.blp",
        );
        addQuest(
            "Economy",
            `\n
            \n${tColor("Economy", "goldenrod")}: Farms, towns and castles will provide daily income. You can also buy farms to earn +50 gold per day.
            \n${tColor("The Farm Hand", "goldenrod")}: The Farm Hand can build laborers which will provide you gold after a set amount of days.
        `,
            "ReplaceableTextures\\CommandButtons\\BTNChestOfGold.blp",
            false,
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
            "Food",
            `
            \n${tColor("Allied Structures", "goldenrod")}: - Granaries will provide increase the food cap by +2 while they are alive. The Capital City also increases the food cap by 5 every day, so by the 15th night it will provide 75 food.
            \n${tColor("Grain Silo", "goldenrod")}: - You can also build Grain Silo's with the Farm Hand to temporarily increase your food cap by +5. This bonus will last for 5 days and then you will lose the bonus when the building is destroyed.
        `,
            "ReplaceableTexturesCommandButtonsBTNMonsterLure.blp",
            false,
        );

        addQuest(
            "Undead Spawns",
            `\n
             \n${tColor("Undead Spawns", "goldenrod")}: 2 - 5 undead spawns will be chosen at random every night. The skulls on the minimap show their chosen spawn locations.
             \n${tColor("White Skull Spawns", "goldenrod")}: This is your standard undead spawn. It will only spawn tier 1 and 2 units. Undead will spawn every 15 seconds from these spawns. 
             \n${tColor("Yellow Skull Spawns", "goldenrod")}: May spawn Tier 1,2 and 3 units. 75% more undead will spawn every 30 seconds from these spawns with a higher chance to spawn stronger undead. 
             \n${tColor("Orange Skull Spawns", "goldenrod")}: 1 spawn every 3rd night will be orange. Every 5th night , all spawns will be open and be orange. Only spawns Tier 2 and 3 units. 
             \n${tColor("Red Skull Spawns", "goldenrod")}: Only spawns Tier 3. All spawns on the 14th and 15th night will be red. 
             \n${tColor("Undead Scaling", "goldenrod")}: Every night that passes, the chance for stronger undead units to spawn will increase. 
             \n${tColor("Final Nights", "goldenrod")}: The final night lasts for 5 minutes.  
        `,
            "ReplaceableTextures\\CommandButtons\\BTNSkeletalOrcChampion.blp",
        );

        addQuest(
            "More Tips",
            `\n|cffff00ffObjective|r - Hold out for 15 nights until reinforcements arrive. 
            \n|cff00ff00Starter Tip|r - Spend your starting money on some defenses, units and items. 
            \n|cff00ff00Defenses|r - Strategically decide which areas to build defenses and hold.
            \n|cff00ff00Engineers|r - Trained at blacksmiths. Able to build defensive structures. 
            \n|cff00ff00Farm Hands|r - Trained at farms. Able to build economic structures. 
            \n|cff00ffffRivers|r - All units fighting in the river are severely hindered.
            \n|cffff0000Destroyed Buildings|r - Destroyed human buildings turn into undead ones at the start of night. Destroyed undead buildings turn into human at the start of day.
            \n|cffffff00Buying Units|r - Buy units at allied structures.
            \n|cffffff00Upgrades|r - Allied buildings provide upgrades to all units, as long as they are alive.
            \n|c00ffff00Economy|r - Allied buildings will grant gold, lumber and food as long as they are alive. You may also purchase a farm for additional gold income and use the engineer to build more economic structures.
        `,
            "ReplaceableTextures\\CommandButtons\\BTNBansheeRanger.blp",
            false,
        );

        addQuest("Map Info", "Created by JediMindTrix/NihilismIsDeath", "ReplaceableTextures\\CommandButtons\\BTNClayFigurine.blp", false);
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
        // q.required = false;
    }

    return q as Quest;
}
