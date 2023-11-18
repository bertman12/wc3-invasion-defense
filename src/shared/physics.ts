import { Timer, Unit } from "w3ts";
import { OrderId } from "w3ts/globals";

interface ApplyForceConfig {
    /**
     * Default: 0
     */
    sustainedForceDuration?: number;
    /**
     * Default: 600
     */
    frictionConstant?: number;
    whileActive?: (currentSpeed?: number, timeElapsed?: number) => void;
    onStart?: (currentSpeed?: number, timeElapsed?: number) => void;
    onEnd?: (currentSpeed?: number, timeElapsed?: number) => void;
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
    const frictionConstant = 1200; //meters per second friction decay
    let currentSpeed = initialSpeed;
    let timeElapsed = 0;

    //to make it so that the unit move speed is not calculated into the movement, subtract unit move x,y vector based on their CURRENT (in case their slowed) movement speed and angle. Slow wont affect our applied force only default unit move vector
    //Subtract move vector from applied force vector if it > 0.
    //Hopefully this prevents adding the units move speed to the vector
    // unit.setflyHeight(400, 400);

    //Need to determine if a unit is moving or not
    const unitIsMovingVector_x = unit.moveSpeed * Math.cos(Deg2Rad(unit.facing));
    const unitIsMovingVector_y = unit.moveSpeed * Math.sin(Deg2Rad(unit.facing));
    // unit.currentOrder ===
    // [OrderId.Move, OrderId.Attackground, OrderId.Patrol, OrderId.Attack].forEach((x) => print("Order id ref: ", x));
    const clickMoveOrder = 851971;

    //Cancel unit commands
    unit.issueImmediateOrder(OrderId.Stop);

    // print("Current order id of unit: ", unit.currentOrder);
    timer.start(refreshInterval, true, () => {
        const xVelocity = (currentSpeed / updatesPerSecond) * Math.cos(Deg2Rad(angle));
        const yVelocity = (currentSpeed / updatesPerSecond) * Math.sin(Deg2Rad(angle));

        //On end hook runs before the timer is destroyed and the function ends
        if (config?.onEnd && currentSpeed <= 0) {
            config.onEnd(currentSpeed, timeElapsed);
        }

        //Complete execution when current speed of the initial force has decayed
        if (currentSpeed <= 0) {
            // print("applied force has decayed!");
            timer.destroy();
            return;
        }

        //Runs when the force is first applied
        if (config?.onStart && currentSpeed === initialSpeed) {
            config.onStart(currentSpeed, timeElapsed);
        }

        //Runs at any point while the function is executing
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

/**
 * we can also push units away from us by setting up a trigger where if a unit enters a certain range from us, we get the angle from us to them using arcsin(relative Y pos of detected unit) then applying force using the arcsin result
 */
