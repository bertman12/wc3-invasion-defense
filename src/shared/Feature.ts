import { notifyPlayer, tColor } from "src/utils/misc";
import { forEachAlliedPlayer, forEachPlayer, forEachUnitOfPlayer } from "src/utils/players";
import { delayedTimer } from "src/utils/timer";
import { Rectangle, Region, Sound, Trigger, Unit } from "w3ts";
import { Players } from "w3ts/globals";
import { GameConfig } from "./GameConfig";
import { PlayerIndices, UNITS } from "./enums";

export class Feature {
    static heroMode: boolean = false;
    static setup_turnOnHeroMode() {
        const t = Trigger.create();
        t.registerPlayerChatEvent(Players[0], "-heroMode", false);
        t.addAction(() => {
            notifyPlayer("Hero mode enabled.");
            Feature.enableHeroMode();

            t.destroy();
        });

        delayedTimer(GameConfig.heroPreparationTime - 1, () => {
            notifyPlayer(tColor("Game mode locked...", "red"));

            t.destroy();
        });
    }

    /**
     * Minor setup required since most configs are already defined for the base game mode
     */
    static baseGameModeSetup() {
        GameConfig.undeadSpawnPoints = [gg_rct_southSpawn2, gg_rct_zSouthspawn4];

        //Setting all units owned by Human Defenders to Neutral Passive
        const previewRegion = Region.create();
        const baseGameRegion = Region.create();
        const baseGameRectangle = Rectangle.fromHandle(gg_rct_baseGameArea);
        const previewRectangle = Rectangle.fromHandle(gg_rct_undead_unit_showcase);
        if (!previewRectangle || !previewRegion || !baseGameRectangle || !baseGameRegion) {
            return;
        }

        previewRegion.addRect(previewRectangle);
        baseGameRegion.addRect(baseGameRectangle);

        delayedTimer(GameConfig.heroPreparationTime - 1, () => {
            if (!GameConfig.heroModeEnabled) {
                forEachUnitOfPlayer(Players[PlayerIndices.HumanDefenders], (u) => {
                    if (!IsUnitInRegion(baseGameRegion.handle, u.handle) && !IsUnitInRegion(previewRegion.handle, u.handle)) {
                        u.owner = Players[PlayerIndices.NeutralPassive];
                    }
                });
            }
        });
    }

    static enableHeroMode() {
        //Modify some constants that other game systems read from.
        GameConfig.heroModeEnabled = true;
        GameConfig.enemyPreparationTime = 60;
        GameConfig.dayDuration = 60;
        GameConfig.waveIntervalSeconds = 30;
        GameConfig.nightDuration = 120;
        GameConfig.useEnemyBounty = true;

        //Disable the usage of other undead spawns from the base game
        //Or just use the spawns defined here if hero mode is on.
        //also change default attack location.
        //18700 11640

        GameConfig.defaultEnemyAttackX;
        const undeadSpawn = Rectangle.create(18700 - 100, 11640 - 100, 18700, 11640);
        GameConfig.undeadSpawnPoints = [undeadSpawn.handle];
        GameConfig.heroSpawnX = 18520;
        GameConfig.heroSpawnY = 6042;
        GameConfig.defaultEnemyAttackX = 18520;
        GameConfig.defaultEnemyAttackY = 6042;

        GameConfig.waveIntervalSeconds = 30;
        GameConfig.playersRequiredBeforeScaling = 1;

        GameConfig.enemyHP_baseIncreasePercentage = 0.05;
        GameConfig.enemyHP_RoundCountMultiplier = 5;
        GameConfig.enemyHP_SpawnDifficultyMultiplier = 10;
        GameConfig.enemyHP_playerCountPercentageMultiplier = 0.1;

        GameConfig.enemyDMG_baseIncreasePercentage = 0;
        GameConfig.enemyDMG_playerCountPercentageMultiplier = 0.05;
        GameConfig.enemyDMG_RoundCountMultiplier = 4;
        GameConfig.enemyDMG_SpawnDifficultyMultiplier = 5;

        GameConfig.enemyBaseBounty = 50;
        GameConfig.enemyBountySpawnDifficulty = 20;
        GameConfig.enemyBountyRoundCountModifier = 6;
        GameConfig.enemyBountyPlayerCountModifier = 2;

        GameConfig.bossSpawnWaveNumber = 1;

        //Setting all units owned by Human Defenders to Neutral Passive
        const previewRegion = Region.create();
        const heroModeRegion = Region.create();
        const heroModeRectangle = Rectangle.fromHandle(gg_rct_heroModeArea);
        const previewRectangle = Rectangle.fromHandle(gg_rct_undead_unit_showcase);
        if (!previewRectangle || !previewRegion || !heroModeRectangle || !heroModeRegion) {
            return;
        }

        previewRegion.addRect(previewRectangle);
        heroModeRegion.addRect(heroModeRectangle);

        forEachUnitOfPlayer(Players[PlayerIndices.HumanDefenders], (u) => {
            if (!IsUnitInRegion(previewRegion.handle, u.handle) && !IsUnitInRegion(heroModeRegion.handle, u.handle)) {
                u.owner = Players[PlayerIndices.NeutralPassive];
            }
        });

        //Create computer town hall offset by 400 from where heroes spawn
        const townHall = Unit.create(Players[PlayerIndices.HumanDefenders], UNITS.townHall, GameConfig.heroSpawnX, GameConfig.heroSpawnY - 400);
        const tower1 = Unit.create(Players[PlayerIndices.HumanDefenders], UNITS.guardTower, GameConfig.heroSpawnX - 400, GameConfig.heroSpawnY - 400);
        const tower2 = Unit.create(Players[PlayerIndices.HumanDefenders], UNITS.guardTower, GameConfig.heroSpawnX + 400, GameConfig.heroSpawnY - 400);

        if (tower1 && tower2) {
            tower1.setBaseDamage(15, 0);
            tower2.setBaseDamage(15, 0);
        }

        townHall?.setBaseDamage(0, 0);
        townHall?.setDiceNumber(0, 0);
        townHall?.setDiceSides(0, 0);
        if (townHall) {
            townHall.removeAbility(FourCC("A03P"));
            BlzSetUnitWeaponBooleanField(townHall?.handle, UNIT_WEAPON_BF_ATTACKS_ENABLED, 0, false);
        }
        //Enabling bounties
        forEachPlayer((p) => {
            p.setState(PLAYER_STATE_GIVES_BOUNTY, 1);
        });

        GameConfig.heroStartItems = [FourCC("stel"), FourCC("ankh")];

        GameConfig.setup_defeatCondition = () => {
            const t = Trigger.create();
            t.registerAnyUnitEvent(EVENT_PLAYER_UNIT_DEATH);
            t.addAction(() => {
                const unit = Unit.fromEvent();

                if (unit && unit.typeId === UNITS.townHall) {
                    let foundAlliedTownHall = false;
                    //check if any other allied player town halls exist
                    forEachAlliedPlayer((p) => {
                        forEachUnitOfPlayer(p, (u) => {
                            if (u.typeId === UNITS.townHall && u.isAlive()) {
                                foundAlliedTownHall = true;
                            }
                        });
                    });

                    if (!foundAlliedTownHall) {
                        GameConfig.playersAreDefeated = true;
                        ClearMapMusic();
                        StopMusic(false);
                        PlayMusic(gg_snd_UndeadVictory);
                        //play sad sound
                        Sound.fromHandle(gg_snd_SargerasLaugh)?.start();
                        print(tColor("No town halls remain. You have been defeated!", "red"));
                        print(tColor("No town halls remain. You have been defeated!", "red"));
                        print(tColor("No town halls remain. You have been defeated!", "red"));
                        print(tColor("No town halls remain. You have been defeated!", "red"));
                        print(tColor("No town halls remain. You have been defeated!", "red"));
                    }
                }
            });
        };
    }
}
