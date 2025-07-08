/*
import {getTranslation} from "../frontend/scripts/translation.js";
const FarmbotStatus = Object.freeze({
    OFFLINE: getTranslation("offline"),
    READY: getTranslation("ready"),
    MOVING: getTranslation("moving"),
    MOVING_TO_SEEDING_POSITION: getTranslation("movingToSeedingPosition"),
    MOVING_TO_WATERING_POSITION: getTranslation("movingToWateringPosition"),
    FETCHING: getTranslation("statusFetching"),
    SEEDING: getTranslation("statusSeeding"),
    WATERING: getTranslation("statusWatering"),
    //PAUSED: 8
});
*/
const FarmbotStatus = Object.freeze({
    OFFLINE: "Offline",
    READY: "Ready",
    MOVING: "Moving",
    MOVING_TO_SEEDING_POSITION: "Moving to seeding position",
    MOVING_TO_WATERING_POSITION: "Moving to watering position",
    FETCHING: "Fetching",
    SEEDING: "Seeding",
    WATERING: "Watering",
    //PAUSED: 8
});


class StatusManager {

    constructor(backend) {
        this.backend = backend;

        this.lastState = {
            location_data: { 
                position: {
                    x: 0, y: 0, z: 0
                }
            }
        };

        this.runningJob = false;
        this.isPaused = false;

        this.is_pausing = false;
        this.wants_to_resume = false;
        this.status = FarmbotStatus.OFFLINE;

        this.currentTask;
        this.currentJob;
        
        this._newStatusRecieved = this._newStatusRecieved.bind(this);
    }
    init(farmbot) {
        this.status = FarmbotStatus.READY;
        this.farmbot = farmbot;
        // TODO handle unsubscribe
        /*
        farmbot.on("offline",
            function(data, eventName) {
                this.status = FarmbotStatus.OFFLINE;
                console.log("ALERT: Connection lost!")
            }
        )
        */

        // OPTIONAL
        farmbot.on("logs",
            function(data, eventName) {
                console.log("Log:", data);
            }
        )
        /*
        farmbot.on("online",
            function(data, eventName) {
                this.Status = FarmbotStatus.READY;
                console.log("Bot:", data);
            }
        )
        */

        farmbot.on("status",
            this._newStatusRecieved
        )
    }

    // starts a new job
    startJob(newJob) {
        console.log("Starting Job");
        this.currentJob = newJob;
        this.runningJob = true;
        this._checkNextTask()
    }

    // checks if there is another task to be executed and finishes job if there is no task left
    _checkNextTask() {
        // check if job is completed
        if (this.currentJob.isJobCompleted()) {
            this.status = FarmbotStatus.READY;
            this.runningJob = false
            this.backend.finishJob();
        } else {
            this.currentTask = this.currentJob.getNextTask();
            // set the status to the task-status
            this.status = this.currentTask.status;
            // Starting the next Task
            this.currentTask.execute(this.farmbot, this.lastState);
        }

    }

    isOnline() {
        return this.status != FarmbotStatus.OFFLINE;
    }

    // Recieves the status of the farmbot and checks if the current task is completed
    _newStatusRecieved(data, eventName) {
        this.lastState = data;
        //console.log("Busy:", data.informational_settings.busy);
        //console.log("Pins:", data.pins);
        if (this.runningJob){
            // check the condition of the currently running task
            if (this.currentTask.checkCondition(data)) {

                // mark task as finished and check for the next task
                this.currentJob.taskFinished();
                this._checkNextTask();
            }
        }
    }

    // pauses the currently running job
    async pauseJob() {
        if(this.is_pausing) return
        
        //this.status = FarmbotStatus.PAUSED;
        this.isPaused = true;
        this.is_pausing = true;
        await this.currentTask.pauseTask(this.farmbot);
        this.is_pausing = false;
        if(this.wants_to_resume) this.continueJob();
    }

    // continues the paused job
    continueJob() {
        if(this.is_pausing) {
            this.wants_to_resume = true;
            return;
        }
        else this.wants_to_resume = false;
        this.isPaused = false;
        this.status = this.currentTask.status;
        this.currentTask.continueTask(this.farmbot, this.lastState);
    }

    // Cancels the currently running job
    cancelJob() {
        this.pauseJob();
        this.isPaused = false;
        this.runningJob = false
        this.backend.finishJob();
    }
}

export {StatusManager};
export {FarmbotStatus};