import { forEachUnitTypeOfPlayer } from "src/utils/players";
import { MapPlayer, Unit, Widget } from "w3ts";
import { OrderId } from "w3ts/globals";

export const playerStates = new Map<number, PlayerState>();

/**
 * Helps keep track of player data
 */
export class PlayerState {
    player: MapPlayer;
    maxSupplyHorses: number = 3;
    playerHero: Unit | undefined;
    rallyToHero: boolean = false;
    temporaryFoodCapIncrease: number = 0;
    /**
     * grain silos will permanently increase your food after they are destroyed
     */
    permanentFoodCapIncrease: number = 0;

    constructor(player: MapPlayer) {
        this.player = player;
    }

    createSupplyHorse() {
        let horseCount = 0;

        forEachUnitTypeOfPlayer("h001", this.player, (u) => {
            horseCount++;
        });

        if (horseCount < this.maxSupplyHorses) {
            const u = Unit.create(this.player, FourCC("h001"), -300 + this.player.id * 50, 300);
            const widget = Widget.fromHandle(this.playerHero?.handle);

            if (u && widget) {
                u.issueTargetOrder(OrderId.Move, widget);
            }
        }
    }

    /**
     * If the user has toggled on rally to hero, then the units in this array will move towards the hero , if they are alive.
     * @param units
     */
    sendUnitsToHero(units: Unit[]) {
        units.forEach((u) => {
            if (u && this.rallyToHero) {
                const widget = Widget.fromHandle(this.playerHero?.handle);

                if (widget) {
                    u.issueTargetOrder(OrderId.Move, widget);
                }
            }
        });
    }
}
