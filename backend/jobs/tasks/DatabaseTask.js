import DatabaseService from "../../../databaseservice.js";
import { Task } from "./Task.js";

class DatabaseTask extends Task {

    constructor(status, dbFunction, dbArgs) {
        super(status);
        this.dbFunction = dbFunction
        this.dbArgs = dbArgs
        this.promise_fulfilled = false
        this.paused = false;
    }

    checkCondition(state) {
        if(this.promise_fulfilled && !this.paused) {
            this.promise_fulfilled = false;
            return true;
        } return false;
    }

    async execute(farmbot, lastState) {
        try {
            await this.dbFunction(this.dbArgs);
            this.promise_fulfilled = true;
        } catch(e) {
            console.log(e)
        }
    }

    pauseTask(farmbot) { this.paused = true; }
    continueTask(farmbot, lastState) { this.paused = false; }
}

export {DatabaseTask};