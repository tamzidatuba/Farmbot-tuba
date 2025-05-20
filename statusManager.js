const FarmbotStatus = Object.freeze({
    OFFLINE: 0,
    READY: 1,
    MOVING: 2,
    MOVING_TO_SEEDING_POSITION: 3,
    MOVING_TO_WATERING_POSITION: 4,
    FETCHING: 5,
    SEEDING: 6,
    WATERING: 7,
    //PAUSED: 8
});


class StatusManager {

    constructor(farmbot) {
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
        this.currentTask.pauseTask();
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