export enum ABILITIES {
    //InfoAbilities
    supplies = FourCC("A000"),
    DEPRECATED_supplyUnit = FourCC("A00L"),
    supplyUsingUnit = FourCC("A02M"),
    goldIncome = FourCC("A002"),
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
    firelord_armyOfFlame = FourCC("ANlm"),
    pitLord_howlOfTerror = FourCC("ANht"),

    //Special
    shopShareAlly = FourCC("Aall"),
    magicGuard = FourCC("A00X"),

    //Demigod
    battleCharge = FourCC("A00T"),

    //Blood Mage
    timeDistortion = FourCC("A02V"),

    //Items
    forceBoots = FourCC("A00V"),
    proc_greaterChainLightning = FourCC("A02K"),
    proc_unholyFrenzy_demonsEyeTrinket = FourCC("A039"),
    proc_unholyFrenzy_demonBlade = FourCC("A042"),
    item_tranquility = FourCC("A03J"),

    //Army Controller
    command_moveAllMilitary = FourCC("A02D"),
    command_attackMoveAllMilitary = FourCC("A02J"),
    command_meleeMoveAllMilitary = FourCC("A02F"),
    command_meleeAttackMoveAllMilitary = FourCC("A02E"),
    command_rangedMoveAllMilitary = FourCC("A02H"),
    command_rangedAttackMoveAllMilitary = FourCC("A02G"),
}

export enum UpgradeCodes {
    armor = FourCC("Rhar"),
    meleeWeapons = FourCC("Rhme"),
    supplyUpgrade = FourCC("R000"),
    dayTime = FourCC("R002"),
    nightTime = FourCC("R003"),
    magicGuardUpgrade = FourCC("R004"),
    slaveRations = FourCC("R005"),
    improvedLevies = FourCC("R008"),
    foodPreservation = FourCC("R009"),
}

export enum PlayerIndices {
    KingdomOfAlexandria = 9,
    HumanDefenders = 18,
    NeutralHostile = 24,
    NeutralPassive = 25,
    Items = 27,
}

export enum UNITS {
    greatWatchTower = FourCC("h003"),
    small_circleOfPower = FourCC("ncop"),
    armyController = FourCC("H00T"),
    unitShop = FourCC("H00W"),
    dummyCaster = FourCC("h00V"),
    dummyCaster_cenariusGhost = FourCC("h011"),
    upgradeCenter = FourCC("h00X"),

    //Human Buildings
    customPeasant = FourCC("h00G"),
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
    druidLaborer = FourCC("h00O"),
    acolyteSlaveLaborer = FourCC("h00P"),
    grainSilo = FourCC("h00N"),
    militia = FourCC("h000"),
    factory = FourCC("h00U"),

    //Human units
    flyingMachine = FourCC("hgyr"),
    engineer = FourCC("n000"),
    footman = FourCC("hfoo"),
    knight = FourCC("hkni"),
    farmHand = FourCC("h00Q"),
    infantryGeneral = FourCC("hcth"),
    archerGeneral = FourCC("n00H"),
    goblinLandMine = FourCC("n00F"),
    heavyCavalry = FourCC("h00I"),
    supplyHorse = FourCC("h001"),
    purifiedProtector = FourCC("u00L"),

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
    pathFinder = FourCC("u00H"),

    //Undead Buildings
    blackCitadel = FourCC("u006"),
    blackCitadelNorth = FourCC("u00B"),
    blackCitadelTownHall = FourCC("u00C"),
    spiritTower = FourCC("u005"),
    infectedGranary = FourCC("h00H"),
    undeadSentinelGuard = FourCC("u007"),
    undeadSentinelCannon = FourCC("u00G"),
    templeOfTheDamned = FourCC("utod"),
    nerubianTower = FourCC("uzg2"),
    undeadLumberMill = FourCC("u008"),
    undeadBlacksmith = FourCC("u00A"),
    undeadBarracks = FourCC("u009"),
    undeadSpawn = FourCC("u00F"),
    undeadFactory = FourCC("u00I"),

    //Triggering Purposes
    farmGrant = FourCC("n008"),
    townGrant = FourCC("n00L"),
    castleGrant = FourCC("n00M"),
    lumberMillGrant = FourCC("n00N"),
    title_duchyOfTheNorthernKnights = FourCC("n00O"),

    //Undead Hero Squad
    uh_cryptLord = FourCC("Ucrl"),
    uh_deathKnight = FourCC("Udea"),
    uh_dreadLord = FourCC("Udre"),
    uh_lich = FourCC("Ulic"),
}

export enum ITEMS {
    farmGrant = FourCC("I003"),
    blinkDagger = FourCC("I006"),
    bootsOfSpeed = FourCC("I005"),
    handOfMidas = FourCC("I007"),
    recipe_blinkTreads = FourCC("I009"),
    blinkTreads = FourCC("I00A"),
    windWalkerTreads = FourCC("I001"),
    sobiMask = FourCC("rwiz"),
    greaterSobiMask = FourCC("I00B"),
    recipe_greaterSobiMask = FourCC("I00C"),
    recipe_swordMastersBlade = FourCC("I00E"),
    recipe_staffOfPrimalThunder = FourCC("I00H"),
    swordMastersBlade = FourCC("I00D"),
    savageBlade = FourCC("srbd"),
    staffOfKnowledge = FourCC("I00F"),
    staffOfPrimalThunder = FourCC("I00G"),
    thunderLizardDiamond = FourCC("thdm"),
    berserkersCleaver = FourCC("I00I"),
    recipe_berserkersCleaver = FourCC("I00J"),
    helmOfBattleThirst = FourCC("hbth"),
    corpseCleaver = FourCC("I008"),
    clawsOfAttack_20 = FourCC("I00K"),
    clawsOfAttack_10 = FourCC("I00L"),
    clawsOfAttack_5 = FourCC("rat6"),
    crownOfTheNorthernKnights_15 = FourCC("I00N"),
    crownOfReanimation_lvl1 = FourCC("I00O"),
    crownOfReanimation_lvl2 = FourCC("I00P"),
    crownOfReanimation_lvl3 = FourCC("I00Q"),
    recipe_crownOfReanimation_lvl1 = FourCC("I00S"),
    recipe_crownOfReanimation_lvl2 = FourCC("I00T"),
    recipe_crownOfReanimation_lvl3 = FourCC("I00U"),
    pendantOfEnergy_200 = FourCC("I00R"),
    crownOfKings_5 = FourCC("ckng"),
    talismanOfEvasion_15 = FourCC("evtl"),
    amuletOfSpellShield = FourCC("spsh"),
    amuletOfTheSentinel = FourCC("I00V"),
    recipe_amuletOfTheSentinel = FourCC("I00W"),
    ringOfProtection_5 = FourCC("rde4"),
    ghoulishMaskOfMidas = FourCC("I00X"),
    recipe_ghoulishMaskOfMidas = FourCC("I00Y"),
    maskOfTheFrenziedGhoul = FourCC("I002"),
    staffOfTeleportation = FourCC("stel"),
    alaricsSpearOfThunder = FourCC("I011"),
    recipe_alaricsSpearOfThunder = FourCC("I010"),
    recipe_demonsEyeTrinket = FourCC("I013"),
    demonsEyeTrinket = FourCC("I014"),
    assassinsRing = FourCC("I00Z"),
    stalwartShield = FourCC("arsh"),
    shieldOfTheGuardian = FourCC("I015"),
    recipe_shieldOfTheGuardian = FourCC("I016"),
    ringOfRegeneration_2 = FourCC("rlif"),
    khadgarsGemOfHealth = FourCC("rhth"),
    staffOfTheArchmage = FourCC("I018"),
    recipe_bloodRitualPendant = FourCC("I017"),
    bloodRitualPendant = FourCC("I019"),
    beltOfGiantStrength = FourCC("bgst"),
    fragmentOfTheEmeraldDream = FourCC("I01A"),
    recipe_yserasGrace = FourCC("I01B"),
    yserasGrace = FourCC("I01C"),
    trinity = FourCC("I01D"),
    recipe_trinity = FourCC("I01E"),
    spikedArmor = FourCC("I01I"),
    recipe_spikedArmor = FourCC("I01H"),
    amuletOfCorruption = FourCC("I01F"),
    shieldOfTheCorruptor = FourCC("I01J"),
    recipe_shieldOfTheCorruptor = FourCC("I01G"),
    recipe_demonBlade = FourCC("I01K"),
    demonBlade = FourCC("I01L"),
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
    questGiver = "UI\\Minimap\\MiniMap-QuestGiver.mdl",
    questObjectiveBonus = "UI\\Minimap\\Minimap-QuestObjectiveBonus.mdl",
    questObjectivePrimary = "UI\\Minimap\\Minimap-QuestObjectivePrimary.mdl",
    questTurnIn = "UI\\Minimap\\Minimap-QuestTurnIn.mdl",
    hero = "UI\\Minimap\\MiniMap-Hero.mdl",
    item = "UI\\Minimap\\MiniMap-Item.mdl",
    neutralBuilding = "UI\\Minimap\\MiniMap-NeutralBuilding.mdl",
    ping = "UI\\Minimap\\Minimap-Ping.mdl",
}

export const minimapIconPathsSet = new Set<MINIMAP_ICONS>([
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

export const laborerUnitSet = new Set<number>([UNITS.peonLaborer, UNITS.druidLaborer, UNITS.humanLaborer, UNITS.acolyteSlaveLaborer]);
