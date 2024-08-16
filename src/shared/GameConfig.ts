/**
 * Default values are initialized for the base game.
 */
export class GameConfig {
    static playersAreDefeated = false;
    static heroPreparationTime = 60;
    static enemyPreparationTime = 200;
    static nightDuration = 200;
    static dayDuration = 130;
    static waveIntervalSeconds = 20;
    static useBaseBuildingEconomy = true;
    static createHeroController = true;
    static useEnemyBounty = false;

    static enemyBaseBounty = 0;
    static enemyBountyPlayerCountModifier = 0;
    static enemyBountyRoundCountModifier = 0;
    static enemyBountySpawnDifficulty = 0;

    /**
     * Not used in base game
     */
    static undeadSpawnPoints: rect[] = [];
    static heroModeEnabled = false;
    static setup_defeatCondition: (() => void) | undefined = undefined;

    static defaultEnemyAttackX = -1200;
    static defaultEnemyAttackY = -15500;
    static enableEnemyScaling = true;
    static playersRequiredBeforeScaling = 2;

    static enemyHP_baseIncreasePercentage = 0.1;
    static enemyHP_SpawnDifficultyMultiplier = 0;
    static enemyHP_RoundCountMultiplier = 3;
    static enemyHP_playerCountPercentageMultiplier = 0.06;

    static enemyDMG_baseIncreasePercentage = 0.1;
    static enemyDMG_SpawnDifficultyMultiplier = 10;
    static enemyDMG_playerCountPercentageMultiplier = 0.05;
    static enemyDMG_RoundCountMultiplier = 5;

    static heroXPMultiplier = 0.35;
    static roundGoldBaseAmount = 0;
    static roundGoldMultiplier = 0;

    static bossSpawnWaveNumber = 3;

    static player_startGold = 2550;
    static player_startLumber = 1650;

    static heroSpawnX: number | undefined = undefined;
    static heroSpawnY: number | undefined = undefined;
    static heroStartItems: number[] = [
        //Staff of Teleport
        FourCC("stel"),
        //Town Hall
        FourCC("tcas"),
    ];
}
