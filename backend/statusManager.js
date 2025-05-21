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

    constructor(farmbot) {
        this.backend;
        this.runningJob = false;
        this.farmbot = farmbot;
        this.status = FarmbotStatus.OFFLINE;
        this.currentTask;
        this.currentJob;
        this.lastState;
        this._newStatusRecieved = this._newStatusRecieved.bind(this);

        // TODO handle unsubscribe
        farmbot.on("offline",
            function(data, eventName) {
                this.status = FarmbotStatus.OFFLINE;
                console.log("ALERT: Connection lost!")
            }
        )

        farmbot.on("logs",
            function(data, eventName) {
                console.log("Log:", data);
            }
        )

        farmbot.on("online",
            function(data, eventName) {
                this.Status = FarmbotStatus.READY;
                console.log("Bot:", data);
            }
        )

        farmbot.on("status",
            this._newStatusRecieved
        )
    }

    startJob(newJob) {
        console.log("Starting Job");
        this.currentJob = newJob;
        this.runningJob = true;
        this._checkNextTask()
    }

    _checkNextTask() {
        if (this.currentJob.isJobCompleted()) { // Check if Job is completed
            this.status = FarmbotStatus.READY;
            this.runningJob = false
            console.log("Finished a Job");
            this.backend.finishJob(this.currentJob);
        } else {
            // Starting the next Task
            this.currentTask = this.currentJob.getNextTask();
            this.status = this.currentTask.status;
            console.log("Status:", this.status);
            this.currentTask.execute(this.farmbot, this.lastState);
        }

    }

    isOnline() {
        return this.status != FarmbotStatus.OFFLINE;
    }

    _newStatusRecieved(data, eventName) {
        this.lastState = data;
        if (this.runningJob){
            if (this.currentTask.checkCondition(data)) {
                this.currentJob.taskFinished();
                this._checkNextTask();
            }
        }
    }

    pauseJob() {
        //this.status = FarmbotStatus.PAUSED;
        this.currentTask.pauseTask(farmbot);
    }

    continueJob() {
        this.status = this.currentTask.status;
        this.currentTask.continueTask();
    }

    deactivate() {
        
    }
}

export {StatusManager};
export {FarmbotStatus};