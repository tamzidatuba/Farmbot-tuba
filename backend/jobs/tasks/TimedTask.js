import { Task } from "./Task.js";

const clamp = (num, min, max) => Math.min(Math.max(num, min), max)

const MINIMUM_DURATION = 0.5; // Duration should atleast last 0.5 seconds
const MAXIMUM_DURATION = 5; // Duration shall not exceed 5 seconds

class TimedTask extends Task {
    constructor(status, duration) {
        super(status);
        this.duration = clamp(duration, MINIMUM_DURATION, MAXIMUM_DURATION) * 1000
        this.timeout = this.timeout.bind(this);
        
        this.farmbot;

        this.start;
        this.currentTimeout;
        this.remainingTime = this.duration;

        this.executionFinished = false;
    }

    async execute(farmbot, lastState) {
        this.farmbot = farmbot;
        this.start = Date.now();
        this.currentTimeout = setTimeout(this.timeout, this.remainingTime);
    }

    timeout() {
        this.executionFinished = true;
        this.farmbot.readStatus();
    }

    pauseTask(farmbot) {
        clearTimeout(this.currentTimeout);
        this.remainingTime -= Date.now()-this.start;
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

export {TimedTask};