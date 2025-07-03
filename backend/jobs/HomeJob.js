import { Job } from "./Job.js";
import { MoveTask } from "./tasks/MoveTask.js";
import { MoveZTask } from "./tasks/MoveZTask.js";
import { FarmbotStatus } from "../statusManager.js";
import { FieldConstants } from "../backend.js";

class HomeJob extends Job {
    constructor() {
        super("Home");

        let moveToSafetyHeight = new MoveZTask(FarmbotStatus.MOVING, FieldConstants.SAFETY_HEIGHT);
        this.taskQueue.push(moveToSafetyHeight);

        let goHome = new MoveTask(FarmbotStatus.MOVING, 0, 0);
        this.taskQueue.push(goHome);
    }
}

export {HomeJob};