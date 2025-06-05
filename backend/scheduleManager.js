import DatabaseService from "../databaseservice.js";

const SCHEDULE_CHECKING_INTERVAL = 900000 // 15*60*1000 = 15min
const SCHEDULE_TOLERANCE = 10000; // 10 Second execution tolerance

class ScheduleManager {

    constructor() {
        this.jobsToExecute = new Array();
        this.checkForScheduledJobs()
        this.currentTimeout;
    }

    isJobScheduled() {
        return this.jobsToExecute.length > 0;
    }

    getScheduledJob() {
        return this.jobsToExecute.shift();
    }

    removeScheduledJob(name) {
        for (const job in this.jobsToExecute) {
            if (this.jobsToExecute[name].name == name) {
                this.jobsToExecute.splice(job, 1);
                break;
            }
        }
    }

    appendScheduledJob(newJob) {
        for (const job in this.jobsToExecute) {
            if (this.jobsToExecute[job].name == newJob.name) {
                return false;
            }
        }
        this.jobsToExecute.push(newJob);
    }

    checkForScheduledJobs() {
        clearTimeout(this.currentTimeout);
        // TODO ask database for scheduledtasks
        // let scheduledJobs = DatabaseServive.FetchScheduledJobsFromDB();

        let scheduledJobs = {};//{0: {"nextExecution": Date.now()+5000, "name": "Job1"}, 1: {"nextExecution": Date.now()+17000, "name": "Job2"}};
        let currentTime = Date.now();
        let nextScheduleCheck = SCHEDULE_CHECKING_INTERVAL;

        for (const job_idx in scheduledJobs) {
            
            //check if scheduled job is active
            if (!scheduledJobs[job_idx].active) {
                continue;
            }

            // calculate the time difference of current time and planned execution time
            let time_difference = scheduledJobs[job_idx].nextExecution - currentTime;
            if (time_difference <= SCHEDULE_TOLERANCE) {
                scheduledJobs[job_idx].jobType = DatabaseService.JobType.WATERING
                this.jobsToExecute.push(scheduledJobs[job_idx]);
                console.log("Scheduled to be executed:", scheduledJobs[job_idx].name);
            } 
            else {
                nextScheduleCheck = Math.min(nextScheduleCheck, time_difference);
            }
        }
        //console.log("Next schedule check:", nextScheduleCheck)
        this.currentTimeout = setTimeout(this.checkForScheduledJobs.bind(this), nextScheduleCheck);
    }

    calculateNextSchedule(job) {
        job.nextExecution = job.executionInterval + (Date.now());

        // modify entry in DB
        let jobType = job.jobType
        delete job[jobType]
        DatabaseService.UpdateJobToDB(jobType, job);
    }
}

export {ScheduleManager};
