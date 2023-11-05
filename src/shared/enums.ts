
export enum ABILITIES {
    charge = FourCC("A005"),
    supplies = FourCC("A000"),
    income = FourCC("A002"),
    armorUpgrade = FourCC("A006"),
    weaponUpgrade = FourCC("A007"),
    makeAlliance = FourCC("A00A"),
    replenishLifeAndMana = FourCC("Ambt"),
}

export enum UpgradeCodes {
    armor = FourCC("Rhar"),
    meleeWeapons = FourCC("Rhme"),
    supplyUpgrade = FourCC("R000"),
}

export enum CUSTOM_UNITS {
    farmTown = FourCC("h002"),
    castle = FourCC("hcas"),
    barracks = FourCC("hbar"),
    blacksmith = FourCC("h004"),
    cannonTower = FourCC("hctw"),
    guardTower = FourCC("hgtw"),
}

//Can find looking up models for a spell at the Art - Target field
export type MINIMAP_ICONS = 
   | "UI\\Minimap\\MiniMap-ControlPoint.mdl"
   | "UI\\Minimap\\MiniMap-QuestGiver.mdl"
   | "UI\\Minimap\\Minimap-QuestObjectiveBonus.mdl"
   | "UI\\Minimap\\Minimap-QuestObjectivePrimary.mdl"
   | "UI\\Minimap\\Minimap-QuestTurnIn.mdl"
   | "UI\\Minimap\\MiniMap-Hero.mdl"
   | "UI\\Minimap\\Minimap-Ping.mdl"
   | "UI\\Minimap\\MiniMap-Item.mdl"
   | "UI\\Minimap\\MiniMap-NeutralBuilding.mdl"

export enum MinimapIconPath {
    controlPoint = "UI\\Minimap\\MiniMap-ControlPoint.mdl",
    questGiver = "UI\\Minimap\\MiniMap-ControlPoint.mdl",
    questObjectiveBonus = "UI\\Minimap\\MiniMap-ControlPoint.mdl",
    questObjectivePrimary = "UI\\Minimap\\MiniMap-ControlPoint.mdl",
    questTurnIn = "UI\\Minimap\\MiniMap-ControlPoint.mdl",
    hero = "UI\\Minimap\\MiniMap-ControlPoint.mdl",
    item = "UI\\Minimap\\MiniMap-ControlPoint.mdl",
    neutralBuilding = "UI\\Minimap\\MiniMap-ControlPoint.mdl",
    ping = "UI\\Minimap\\Minimap-Ping.mdl"
}

export const minimapIconPaths = new Set<MINIMAP_ICONS>([
    "UI\\Minimap\\MiniMap-ControlPoint.mdl",
    "UI\\Minimap\\MiniMap-Hero.mdl",
    "UI\\Minimap\\MiniMap-Item.mdl",
    "UI\\Minimap\\MiniMap-NeutralBuilding.mdl",
    "UI\\Minimap\\MiniMap-QuestGiver.mdl",
    "UI\\Minimap\\Minimap-Ping.mdl",
    "UI\\Minimap\\Minimap-QuestObjectiveBonus.mdl",
    "UI\\Minimap\\Minimap-QuestObjectivePrimary.mdl",
    "UI\\Minimap\\Minimap-QuestTurnIn.mdl"
]);