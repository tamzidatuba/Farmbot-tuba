import { Task } from "./Task.js"

const clamp = (num, min, max) => Math.min(Math.max(num, min), max)

const MINIMUM_PIN_ACTIVATION_DURATION = 0.5; // Duration should atleast last 0.5 seconds
const MAXIMUM_PIN_ACTIVATION_DURATION = 5; // Duration shall not exceed 5 seconds

class TimedPinTask extends Task {
    constructor(status, pinData, duration) { // Duration in seconds as arg
        super(status);
        this.duration = clamp(duration, MINIMUM_PIN_ACTIVATION_DURATION, MAXIMUM_PIN_ACTIVATION_DURATION) * 1000
        this.timeout = this.timeout.bind(this);
        
        this.start;
        this.currentTimeout;
        this.remainingTime = this.duration;

        this.executionFinished = false;
        this.farmbot;

        this.pinArgs = {
            pin_value: 1,
            pin_mode: 0,
            pin_number: {
                kind: "named_pin",
                args: pinData
            }
        };
    }

    execute(farmbot, lastState) {
        if (this.remainingTime < 500) {
            this.executionFinished = true;
            return
        }
        console.log("Executing Timed Pin Task!");
        this.farmbot = farmbot;
        this.start = Date.now();
        this.currentTimeout = setTimeout(this.timeout, this.remainingTime);
        this.pinArgs.pin_value = 1;
        farmbot.writePin(this.pinArgs);
    }

    timeout() {
        this.pinArgs.pin_value = 0;
        this.farmbot.writePin(this.pinArgs);
        this.executionFinished = true;
    }

    pauseTask(farmbot) {
        this.pinArgs.pin_value = 0;
        this.farmbot.writePin(this.pinArgs);
        clearTimeout(this.currentTimeout);
        this.remainingTime = this.remainingTime - (Date.now()-this.start);
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