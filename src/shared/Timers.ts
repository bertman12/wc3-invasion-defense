import { Timer, Trigger } from "w3ts";

//Singleton timer class
//I could also just make this handle any timer in this manner by passing the timer as an argument and then I could manage a set of timers
export class TimerManager {
    static nightTimer: Timer = Timer.create();
    static dayTimer: Timer = Timer.create();
    static dayTimeDuration = 135;
    static nightTimeDuration = 180;
    private static nightTimerDialog: timerdialog;
    private static dayTimerDialog: timerdialog;

    static trig_setup() {
        const nightTrig = Trigger.create();
        nightTrig.registerTimerExpireEvent(TimerManager.nightTimer.handle);
        nightTrig.addAction(() => {
            TimerDialogDisplayBJ(false, TimerManager.nightTimerDialog);
        });

        const dayTrig = Trigger.create();
        dayTrig.registerTimerExpireEvent(TimerManager.dayTimer.handle);
        dayTrig.addAction(() => {
            TimerDialogDisplayBJ(false, TimerManager.dayTimerDialog);
        });

        const nd = CreateTimerDialogBJ(TimerManager.nightTimer.handle, "Time until dawn...");
        if (nd) {
            TimerManager.nightTimerDialog = nd;
        }

        const dd = CreateTimerDialogBJ(TimerManager.dayTimer.handle, "Time until night fall...");
        if (dd) {
            TimerManager.dayTimerDialog = dd;
        }
    }

    /**
     * Uses standard night duration if none is passed
     */
    static startNightTimer(cb: () => void, duration?: number) {
        TimerManager.nightTimer.start(duration ?? TimerManager.nightTimeDuration, false, cb);
        TimerDialogDisplayBJ(true, TimerManager.nightTimerDialog);
        TimerDialogSetTitle(TimerManager.nightTimerDialog, "Time until dawn...");
    }

    /**
     * Uses standard day duration if none is passed
     */
    static startDayTimer(cb: () => void, duration?: number) {
        TimerManager.dayTimer.start(duration ?? TimerManager.dayTimeDuration, false, cb);
        TimerDialogDisplayBJ(true, TimerManager.dayTimerDialog);
        TimerDialogSetTitle(TimerManager.dayTimerDialog, "Time until night fall...");
    }

    static isDayTime() {
        const time = GetTimeOfDay();

        if (time === 12) {
            return true;
        }

        return false;
    }
}
