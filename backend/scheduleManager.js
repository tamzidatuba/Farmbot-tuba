import { Queue } from "../jobs/Queue.js";

const SCHEDULE_CHECKING_INTERVAL = 900000 // 15*60*1000 = 15min
const SCHEDULE_TOLERANCE = 30000; // 30 Second execution tolerance

class ScheduleManager {

    constructor() {
        this.jobsToExecute = new Queue();
        this.checkForScheduledJobs.bind(this);
        this.checkForScheduledJobs()
    }

    isJobScheduled() {
        return !this.jobsToExecute.isEmpty;
    }

    getScheduledJob() {
        return this.jobsToExecute.dequeue();
    }

    checkForScheduledJobs() {
        // TODO ask database for scheduledtasks
        let scheduledJobs = {0: {"nextExecution": Date.now()+5000, "name": "Job1"}, 1: {"nextExecution": Date.now()+34000, "name": "Job2"}};
        let currentTime = Date.now();
        let nextScheduleCheck = SCHEDULE_CHECKING_INTERVAL;

        for (const job_idx in scheduledJobs) {
            // calculate the time difference of current time and planned execution time
            let time_difference = scheduledJobs[job_idx].nextExecution - currentTime;
            console.log("Time difference:", time_difference);
            if (time_difference <= SCHEDULE_TOLERANCE) {
                //move job from scheduled_jobs to jobs_to_execute in database
                this.jobsToExecute.enqueue(scheduledJobs[job_idx]);
                console.log("Scheduled to be executed:", scheduledJobs[job_idx].name);
            } 
            else {
                nextScheduleCheck = Math.min(nextScheduleCheck, time_difference);
            }
        }
        console.log("Next schedule check:", nextScheduleCheck)
        setTimeout(this.checkForScheduledJobs.bind(this), nextScheduleCheck);
    }

    calculateNextSchedule(job) {
        job.nextExecution = job.executionInterval + (Date.now());
        // TODO write job back to scheduled_jobs in database
    }
}

export {ScheduleManager};