import { GameConfig } from "src/shared/GameConfig";
import { RoundManager } from "src/shared/round-manager";
import { tColor } from "src/utils/misc";
import { isPlayingUser } from "src/utils/players";
import { Sound, Timer, Trigger, Unit } from "w3ts";

export function trig_heroDies() {
    const t = Trigger.create();
    t.registerAnyUnitEvent(EVENT_PLAYER_UNIT_DEATH);

    t.addCondition(() => {
        const u = Unit.fromHandle(GetDyingUnit());

        if (u && u.isHero() && !u.isIllusion() && isPlayingUser(u.owner) && !GameConfig.playersAreDefeated) {
            Sound.fromHandle(gg_snd_QuestFailed)?.start();
            const respawnTime = 15 + u.level + RoundManager.currentRound;
            print(`${tColor("!", "goldenrod")} - ${u.owner.name}, your hero will revive in ${respawnTime} seconds.`);
            const timer = Timer.create();

            timer.start(respawnTime, false, () => {
                if (GameConfig.heroModeEnabled) {
                    u.revive(GameConfig?.heroSpawnX ?? 0, GameConfig?.heroSpawnY ?? 0, true);
                } else {
                    u.revive(u.owner.startLocationX, u.owner.startLocationY, true);
                }
            });

            return true;
        }

        return false;
    });
}
