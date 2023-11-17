import { Timer, Unit } from "w3ts";
import { OrderId } from "w3ts/globals";

interface ApplyForceConfig {
    sustainedForceDuration?: number;
    whileActive?: (currentSpeed?: number, timeElapsed?: number) => void;
}

/**
 * @param angle degrees
 * @param unit
 * @param initialSpeed meters per second
 * @param affectHeight determines whether or not to change unit height whilst force is applied
 */
export function applyForce(angle: number, unit: Unit, initialSpeed: number, config?: ApplyForceConfig) {
    const timer = Timer.create();
    const refreshInterval = 0.01;
    const updatesPerSecond = 1 / refreshInterval;
    const frictionConstant = 600; //meters per second friction decay
    let currentSpeed = initialSpeed;
    let timeElapsed = 0;

    //to make it so that the unit move speed is not calculated into the movement, subtract unit move x,y vector based on their CURRENT (in case their slowed) movement speed and angle. Slow wont affect our applied force only default unit move vector
    //Subtract move vector from applied force vector if it > 0.
    //Hopefully this prevents adding the units move speed to the vector
    unit.setflyHeight(400, 400);

    //Need to determine if a unit is moving or not
    const unitIsMovingVector_x = unit.moveSpeed * Math.cos(Deg2Rad(unit.facing));
    const unitIsMovingVector_y = unit.moveSpeed * Math.sin(Deg2Rad(unit.facing));
    // unit.currentOrder ===
    [OrderId.Move, OrderId.Attackground, OrderId.Patrol, OrderId.Attack].forEach((x) => print("Order id ref: ", x));
    const clickMoveOrder = 851971;

    print("Current order id of unit: ", unit.currentOrder);
    timer.start(refreshInterval, true, () => {
        const xVelocity = (currentSpeed / updatesPerSecond) * Math.cos(Deg2Rad(angle));
        const yVelocity = (currentSpeed / updatesPerSecond) * Math.sin(Deg2Rad(angle));

        if (currentSpeed <= 0) {
            print("applied force has decayed!");
            timer.destroy();
            return;
        }

        if (config?.whileActive) {
            config.whileActive(currentSpeed, timeElapsed);
        }

        unit.x += xVelocity;
        unit.y += yVelocity;

        timeElapsed += refreshInterval;

        if (config?.sustainedForceDuration && timeElapsed <= config.sustainedForceDuration) {
            return;
        }

        currentSpeed -= frictionConstant / updatesPerSecond;
    });
}
