import { UNITS } from "src/shared/enums";
import { playerStates } from "src/shared/playerState";
import { forEachAlliedPlayer, isPlayingUser } from "src/utils/players";
import { MapPlayer, Trigger, Unit } from "w3ts";

/**
 * Must occur after player states have been setup
 */
export function setup_heroPurchasing() {
    trig_heroPurchasedAfterPrepTime();
}

/**
 * This the normal hero spawning trigger which will be activated after 30 seconds
 */
function trig_heroPurchasedAfterPrepTime() {
    const t = Trigger.create();

    t.registerAnyUnitEvent(EVENT_PLAYER_UNIT_SELL);

    t.addCondition(() => {
        const u = Unit.fromHandle(GetBuyingUnit());
        if (u && u.typeId === FourCC("nshe")) {
            return true;
        }

        return false;
    });

    t.addAction(() => {
        const heroPicker = Unit.fromHandle(GetBuyingUnit());
        const purchasedHero = Unit.fromHandle(GetSoldUnit());
        const seller = Unit.fromHandle(GetSellingUnit());

        if (!heroPicker || !purchasedHero || !seller) {
            return;
        }

        heroPicker.kill();

        const playerState = playerStates.get(purchasedHero.owner.id);

        if (playerState) {
            playerState.playerHero = purchasedHero;
        }

        // purchasedHero?.addItemById(FourCC("stel"));
        // purchasedHero?.addItemById(FourCC("tcas"));

        SelectUnitForPlayerSingle(purchasedHero.handle, purchasedHero.owner.handle);
        SelectUnitRemoveForPlayer(seller?.handle, purchasedHero.owner.handle);
        moveSingleHeroToStartLocationAndGiveItems(purchasedHero.owner);

        // const startX = purchasedHero.owner.startLocationX;
        // const startY = purchasedHero.owner.startLocationY;
        // SetCameraPositionForPlayer(heroPicker.owner.handle, startX, startY);

        // purchasedHero.x = startX;
        // purchasedHero.y = startY;

        // const armyController = Unit.create(purchasedHero.owner, UNITS.armyController, -28950 + purchasedHero.owner.id * 50 - 250 * Math.floor(purchasedHero.owner.id / 5), -28950 - Math.floor(purchasedHero.owner.id / 5) * 75);
        // armyController?.setHeroLevel(18, false);
    });
}

/**
 * This will be used for the first 30 seconds of the game, then the match will begin, this trigger will be disabled and the other trigger will be used instead
 */
function trig_heroPurchasedDuringPrepTime() {
    const t = Trigger.create();

    t.registerAnyUnitEvent(EVENT_PLAYER_UNIT_SELL);

    t.addCondition(() => {
        const u = Unit.fromHandle(GetBuyingUnit());
        if (u && u.typeId === FourCC("nshe")) {
            return true;
        }

        return false;
    });

    t.addAction(() => {
        const heroPicker = Unit.fromHandle(GetBuyingUnit());
        const purchasedHero = Unit.fromHandle(GetSoldUnit());
        const seller = Unit.fromHandle(GetSellingUnit());

        if (!heroPicker || !purchasedHero || !seller) {
            return;
        }

        heroPicker.kill();
        const playerState = playerStates.get(purchasedHero.owner.id);

        if (playerState) {
            playerState.playerHero = purchasedHero;
        }

        SelectUnitForPlayerSingle(purchasedHero.handle, purchasedHero.owner.handle);
        SelectUnitRemoveForPlayer(seller?.handle, purchasedHero.owner.handle);
    });
}

/**
 * Should happen exactly at the transition when the prep trigger ends and the post prep hero purchase trigger starts
 * Logic can be used inside postPrep hero purchased trigger
 */
function moveAllPrepHeroesToStartLocationAndGiveItems() {
    forEachAlliedPlayer((p) => {
        if (isPlayingUser(p)) {
            const playerState = playerStates.get(p.id);

            if (playerState) {
                const purchasedHero = playerState.playerHero;
                if (!purchasedHero) {
                    return;
                }

                purchasedHero?.addItemById(FourCC("stel"));
                purchasedHero?.addItemById(FourCC("tcas"));
                const startX = purchasedHero.owner.startLocationX;
                const startY = purchasedHero.owner.startLocationY;
                SetCameraPositionForPlayer(p.handle, startX, startY);
                purchasedHero.x = startX;
                purchasedHero.y = startY;
                const armyController = Unit.create(purchasedHero.owner, UNITS.armyController, -28950 + purchasedHero.owner.id * 50 - 250 * Math.floor(purchasedHero.owner.id / 5), -28950 - Math.floor(purchasedHero.owner.id / 5) * 75);
                armyController?.setHeroLevel(18, false);
            }
        }
    });
}

/**
 * Player should already have a hero assigned when this is used
 *
 * Will give the hero their starting items and then move to start location as well create the hero army controller
 * @param player
 * @returns
 */
function moveSingleHeroToStartLocationAndGiveItems(player: MapPlayer) {
    if (isPlayingUser(player)) {
        const playerState = playerStates.get(player.id);

        if (playerState) {
            const purchasedHero = playerState.playerHero;
            if (!purchasedHero) {
                return;
            }

            purchasedHero?.addItemById(FourCC("stel"));
            purchasedHero?.addItemById(FourCC("tcas"));
            const startX = purchasedHero.owner.startLocationX;
            const startY = purchasedHero.owner.startLocationY;
            SetCameraPositionForPlayer(player.handle, startX, startY);
            purchasedHero.x = startX;
            purchasedHero.y = startY;
            const armyController = Unit.create(purchasedHero.owner, UNITS.armyController, -28950 + purchasedHero.owner.id * 50 - 250 * Math.floor(purchasedHero.owner.id / 5), -28950 - Math.floor(purchasedHero.owner.id / 5) * 75);
            armyController?.setHeroLevel(18, false);
        }
    }
}
