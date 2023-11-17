export enum ABILITIES {
    charge = FourCC("A005"),
    supplies = FourCC("A000"),
    income = FourCC("A002"),
    lumberIncome = FourCC("A00J"),
    armorUpgrade = FourCC("A006"),
    weaponUpgrade = FourCC("A007"),
    makeAlliance = FourCC("A00A"),
    replenishLifeAndMana = FourCC("Ambt"),
    hireFlyingMachinePatrol = FourCC("A00G"),
    foodCapBonus = FourCC("A00I"),
    heroicLeap = FourCC("A00P"),
    purchaseFarmGrant = FourCC("A00S"),
}

export enum UpgradeCodes {
    armor = FourCC("Rhar"),
    meleeWeapons = FourCC("Rhme"),
    supplyUpgrade = FourCC("R000"),
    dayTime = FourCC("R002"),
    nightTime = FourCC("R003"),
}

export enum PlayerIndices {
    NeutralHostile = 24,
    NeutralPassive = 25,
}

export enum CUSTOM_UNITS {
    //Human Buildings
    farmTown = FourCC("h002"),
    townHall = FourCC("htow"),
    rampartCannonTower = FourCC("h008"),
    rampartGuardTower = FourCC("h00A"),
    castle = FourCC("hcas"),
    capital = FourCC("h00B"),
    barracks = FourCC("hbar"),
    blacksmith = FourCC("h004"),
    cannonTower = FourCC("hctw"),
    guardTower = FourCC("hgtw"),
    workshop = FourCC("harm"),
    arcaneSanctum = FourCC("hars"),
    lumberMill = FourCC("hlum"),
    granary = FourCC("h00C"),
    citadelOfTheNorthernKnights = FourCC("h00E"),
    //Human units
    flyingMachine = FourCC("hgyr"),

    //Undead
    abomination = FourCC("uabo"),
    meatWagon = FourCC("umtw"),
    boss_pitLord = FourCC("N005"),
    fleshBeetle = FourCC("u002"),
    demonFireArtillery = FourCC("n007"),
    skeletalFrostMage = FourCC("u000"),
    necromancer = FourCC("u001"),
    skeletalArcher = FourCC("nskm"),
    zombie = FourCC("nzom"),
    lich = FourCC("u004"),
    obsidianStatue = FourCC("uobs"),
    greaterObsidianStatue = FourCC("u003"),
    gargoyle = FourCC("ugar"),
    skeletalOrcChampion = FourCC("nsoc"),

    //Triggering Purposes
    nullUnit = FourCC("n008"),
}

export enum ITEMS {
    farmGrant = FourCC("I003"),
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
    | "UI\\Minimap\\MiniMap-NeutralBuilding.mdl";

export enum MinimapIconPath {
    controlPoint = "UI\\Minimap\\MiniMap-ControlPoint.mdl",
    questGiver = "UI\\Minimap\\MiniMap-ControlPoint.mdl",
    questObjectiveBonus = "UI\\Minimap\\MiniMap-ControlPoint.mdl",
    questObjectivePrimary = "UI\\Minimap\\MiniMap-ControlPoint.mdl",
    questTurnIn = "UI\\Minimap\\MiniMap-ControlPoint.mdl",
    hero = "UI\\Minimap\\MiniMap-ControlPoint.mdl",
    item = "UI\\Minimap\\MiniMap-ControlPoint.mdl",
    neutralBuilding = "UI\\Minimap\\MiniMap-ControlPoint.mdl",
    ping = "UI\\Minimap\\Minimap-Ping.mdl",
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
    "UI\\Minimap\\Minimap-QuestTurnIn.mdl",
]);
