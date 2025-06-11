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
            this.backend.finishJob();
        } else {
            // Starting the next Task
            this.currentTask = this.currentJob.getNextTask();
            this.status = this.currentTask.status;
            //console.log("Starting a new Task, Status:", this.status);
            this.currentTask.execute(this.farmbot, this.lastState);
        }

    }

    isOnline() {
        return this.status != FarmbotStatus.OFFLINE;
    }

    _newStatusRecieved(data, eventName) {
        this.lastState = data;
        //console.log(data.pins)
        if (this.runningJob){
            if (this.currentTask.checkCondition(data)) {
                this.currentJob.taskFinished();
                this._checkNextTask();
            }
        }
    }

    pauseJob() {
        //this.status = FarmbotStatus.PAUSED;
        this.isPaused = true;
        this.currentTask.pauseTask(this.farmbot);
    }

    continueJob() {
        this.isPaused = false;
        this.status = this.currentTask.status;
        this.currentTask.continueTask(this.farmbot, this.lastState);
    }

    cancelJob() {
        this.pauseJob();
        this.isPaused = false;
        this.runningJob = false
        this.backend.finishJob();
    }
}

export {StatusManager};
export {FarmbotStatus};