import { Task } from "./Task.js"

const clamp = (num, min, max) => Math.min(Math.max(num, min), max)

const MINIMUM_PIN_ACTIVATION_DURATION = 0.5; // Duration should atleast last 0.5 seconds
const MAXIMUM_PIN_ACTIVATION_DURATION = 5; // Duration shall not exceed 5 seconds

const WATER_PIN = 8;
const VACUUM_PIM = 9;

class TimedPinTask extends Task {
    constructor(status, pinNumber, duration) { // Duration in seconds as arg
        super(status);
        this.pinNumber = pinNumber;
        this.duration = clamp(duration, 0.5, MAXIMUM_PIN_ACTIVATION_DURATION) * 1000
        this.timeout = this.timeout.bind(this);
        
        this.start;
        this.currentTimeout;
        this.remainingTime = this.duration;

        this.executionFinished = false;
        this.farmbot;
    }

    execute(farmbot, lastState) {
        console.log("Executing Timed Pin Task!");
        this.farmbot = farmbot;
        this.start = Date.now();
        farmbot.togglePin({pin_number: this.pinNumber});
        this.currentTimeout = setTimeout(this.timeout, this.remainingTime);
    }

    timeout() {
        console.log("timeout");
        this.farmbot.togglePin({pin_number: this.pinNumber});
        this.executionFinished = true;
    }

    pauseTask(farmbot) {
        farmbot.togglePin({pin_number: this.pinNumber})
        clearTimeout(this.currentTimeout)
        this.remainingTime = remainingTime - (Date.now()-this.start)
    }

    checkCondition(state) {
        if(this.executionFinished) {
            this.executionFinished = false;
            this.remainingTime = this.duration
            return true;
        }
        return false;
    }
}

export {TimedPinTask};