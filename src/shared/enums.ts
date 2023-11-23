export enum ABILITIES {
    //InfoAbilities
    supplies = FourCC("A000"),
    income = FourCC("A002"),
    lumberIncome = FourCC("A00J"),
    armorUpgrade = FourCC("A006"),
    weaponUpgrade = FourCC("A007"),
    magicGuardInfo = FourCC("A00W"),
    grainSiloInfo = FourCC("A01G"),

    //Other
    charge = FourCC("A005"),
    makeAlliance = FourCC("A00A"),
    replenishLifeAndMana = FourCC("Ambt"),
    hireFlyingMachinePatrol = FourCC("A00G"),
    foodCapBonus = FourCC("A00I"),
    heroicLeap = FourCC("A00P"),
    purchaseFarmGrant = FourCC("A00S"),
    disbandUnit = FourCC("A01I"),

    //Special
    shopShareAlly = FourCC("Aall"),
    magicGuard = FourCC("A00X"),

    //Demigod
    battleCharge = FourCC("A00T"),

    //Items
    forceBoots = FourCC("A00V"),
}

export enum UpgradeCodes {
    armor = FourCC("Rhar"),
    meleeWeapons = FourCC("Rhme"),
    supplyUpgrade = FourCC("R000"),
    dayTime = FourCC("R002"),
    nightTime = FourCC("R003"),
    magicGuardUpgrade = FourCC("R004"),
}

export enum PlayerIndices {
    KingdomOfAlexandria = 9,
    NeutralHostile = 24,
    NeutralPassive = 25,
    Items = 27,
}

export enum UNITS {
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
    caltrops = FourCC("h005"),
    citadelOfTheNorthernKnights = FourCC("h00E"),
    humanLaborer = FourCC("h00L"),
    peonLaborer = FourCC("h00K"),
    grainSilo = FourCC("h00N"),

    //Human units
    flyingMachine = FourCC("hgyr"),
    engineer = FourCC("n000"),
    infantryGeneral = FourCC("hcth"),
    archerGeneral = FourCC("n00H"),

    //Undead
    abomination = FourCC("uabo"),
    skeletalOrc = FourCC("nsko"),
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
    infernalMachine = FourCC("ninm"),
    blackCitadelMeatWagon = FourCC("u00D"),

    //Undead Buildings
    blackCitadel = FourCC("u006"),
    blackCitadelNorth = FourCC("u00B"),
    blackCitadelTownHall = FourCC("u00C"),
    spiritTower = FourCC("u005"),
    infectedGranary = FourCC("h00H"),
    undeadSentinel = FourCC("u007"),
    templeOfTheDamned = FourCC("utod"),
    nerubianTower = FourCC("uzg2"),
    undeadLumberMill = FourCC("u008"),
    undeadBlacksmith = FourCC("u00A"),
    undeadBarracks = FourCC("u009"),

    //Triggering Purposes
    nullUnit = FourCC("n008"),
}

export enum ITEMS {
    farmGrant = FourCC("I003"),
    blinkDagger = FourCC("I006"),
    bootsOfSpeed = FourCC("I005"),
    handOfMidas = FourCC("I007"),
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

export enum TERRAIN_CODE {
    //Lordaeron Summer - 12 prefix
    dirt = 1281651316,
    grass = 1281847923,
    darkGrass = 1281847908,
    grassyDirt = 1281651303,
    roughDirt = 1281651311,
    rocks = 1282568043,
    //Village Tileset - 14 prefix
    stonePath = 1450407024,
    cobblePath = 1449353840,
    crops = 1365471856, //on lordaeron summer
    //Nope
    // blightMaybe = 12816513,
    // blight_ = 1282568043
}
