import { FieldConstants } from "../backend.js";
/*
A Job is a list of Tasks inside a Queue for the Farmbot to complete


TODO before executing next task. ensure the last task condition is still met (especialy for move commands)
*/

class Job {
    constructor(jobName) {
        this.taskQueue = new Array(); //new Queue();
        this.name = jobName
    }

    isJobCompleted() {
        return this.taskQueue.length == 0;
    }

    getNextTask() {
        return this.taskQueue[0];
    }

    taskFinished() {
        console.log("Finished a task");
        this.taskQueue.shift();
    }

    adjustCoordinatesToFieldDimension(x, y) {
        return {
            "x": this.clampXToField(x + FieldConstants.FIELD_START_X),
            "y": this.clampYToField(y + FieldConstants.FIELD_START_Y)
        }
    }
    clampXToField(x) {
        return Math.min(Math.max(x, FieldConstants.FIELD_START_X), FieldConstants.FIELD_END_X);
    }
    clampYToField(y) {
        return Math.min(Math.max(y, FieldConstants.FIELD_START_Y), FieldConstants.FIELD_END_Y);
    }
}

export {Job};