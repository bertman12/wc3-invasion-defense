gg_trg_Melee_Initialization = nil
gg_rct_ZombieSpawn1 = nil
function InitGlobals()
end

function CreateBuildingsForPlayer0()
local p = Player(0)
local u
local unitID
local t
local life

u = BlzCreateUnitWithSkin(p, FourCC("hcas"), -512.0, 64.0, 270.000, FourCC("hcas"))
u = BlzCreateUnitWithSkin(p, FourCC("hvlt"), -1280.0, -1280.0, 270.000, FourCC("hvlt"))
u = BlzCreateUnitWithSkin(p, FourCC("hctw"), -64.0, -448.0, 270.000, FourCC("hctw"))
u = BlzCreateUnitWithSkin(p, FourCC("hctw"), -64.0, 448.0, 270.000, FourCC("hctw"))
u = BlzCreateUnitWithSkin(p, FourCC("hctw"), -960.0, 448.0, 270.000, FourCC("hctw"))
u = BlzCreateUnitWithSkin(p, FourCC("hctw"), -896.0, -576.0, 270.000, FourCC("hctw"))
end

function CreateUnitsForPlayer0()
local p = Player(0)
local u
local unitID
local t
local life

u = BlzCreateUnitWithSkin(p, FourCC("Hamg"), -924.8, -382.4, 305.495, FourCC("Hamg"))
end

function CreatePlayerBuildings()
CreateBuildingsForPlayer0()
end

function CreatePlayerUnits()
CreateUnitsForPlayer0()
end

function CreateAllUnits()
CreatePlayerBuildings()
CreatePlayerUnits()
end

function CreateRegions()
local we

gg_rct_ZombieSpawn1 = Rect(-1024.0, 1696.0, 64.0, 2112.0)
end

function Trig_Melee_Initialization_Actions()
MeleeStartingVisibility()
MeleeStartingHeroLimit()
MeleeGrantHeroItems()
MeleeStartingResources()
MeleeClearExcessUnits()
MeleeStartingUnits()
MeleeStartingAI()
MeleeInitVictoryDefeat()
end

function InitTrig_Melee_Initialization()
gg_trg_Melee_Initialization = CreateTrigger()
TriggerAddAction(gg_trg_Melee_Initialization, Trig_Melee_Initialization_Actions)
end

function InitCustomTriggers()
InitTrig_Melee_Initialization()
end

function RunInitializationTriggers()
ConditionalTriggerExecute(gg_trg_Melee_Initialization)
end

function InitCustomPlayerSlots()
SetPlayerStartLocation(Player(0), 0)
SetPlayerColor(Player(0), ConvertPlayerColor(0))
SetPlayerRacePreference(Player(0), RACE_PREF_HUMAN)
SetPlayerRaceSelectable(Player(0), true)
SetPlayerController(Player(0), MAP_CONTROL_USER)
end

function InitCustomTeams()
SetPlayerTeam(Player(0), 0)
end

function main()
SetCameraBounds(-29952.0 + GetCameraMargin(CAMERA_MARGIN_LEFT), -30208.0 + GetCameraMargin(CAMERA_MARGIN_BOTTOM), 29952.0 - GetCameraMargin(CAMERA_MARGIN_RIGHT), 29696.0 - GetCameraMargin(CAMERA_MARGIN_TOP), -29952.0 + GetCameraMargin(CAMERA_MARGIN_LEFT), 29696.0 - GetCameraMargin(CAMERA_MARGIN_TOP), 29952.0 - GetCameraMargin(CAMERA_MARGIN_RIGHT), -30208.0 + GetCameraMargin(CAMERA_MARGIN_BOTTOM))
SetDayNightModels("Environment\\DNC\\DNCLordaeron\\DNCLordaeronTerrain\\DNCLordaeronTerrain.mdl", "Environment\\DNC\\DNCLordaeron\\DNCLordaeronUnit\\DNCLordaeronUnit.mdl")
NewSoundEnvironment("Default")
SetAmbientDaySound("LordaeronSummerDay")
SetAmbientNightSound("LordaeronSummerNight")
SetMapMusic("Music", true, 0)
CreateRegions()
CreateAllUnits()
InitBlizzard()
InitGlobals()
InitCustomTriggers()
RunInitializationTriggers()
end

function config()
SetMapName("TRIGSTR_001")
SetMapDescription("TRIGSTR_003")
SetPlayers(1)
SetTeams(1)
SetGamePlacement(MAP_PLACEMENT_USE_MAP_SETTINGS)
DefineStartLocation(0, -512.0, 0.0)
InitCustomPlayerSlots()
SetPlayerSlotAvailable(Player(0), MAP_CONTROL_USER)
InitGenericPlayerSlots()
end

