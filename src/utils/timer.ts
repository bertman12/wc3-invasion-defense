import { Timer } from "w3ts";

/**
 * @param duration milliseconds
 */
export function delay(duration: number, cb: (...args: any[]) => any) {
    const timer = Timer.create();
    timer.start(duration, false, () => {
        cb();
        timer.destroy();
    });
}
