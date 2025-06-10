import DatabaseService from "../databaseservice.js";

const SCHEDULE_CHECKING_INTERVAL = 900000 // 15*60*1000 = 15min
const SCHEDULE_TOLERANCE = 15000; // 15 Second execution tolerance

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
            if (this.jobsToExecute[job].job.name == name) {
                this.jobsToExecute.splice(job, 1);
                break;
            }
        }
    }

    appendScheduledJob(newJob) {
        for (const job in this.jobsToExecute) {
            if (this.jobsToExecute[job].job.name == newJob.name) {
                return false;
            }
        }
        this.jobsToExecute.push(newJob);
    }

    checkForScheduledJobs() {
        clearTimeout(this.currentTimeout);
        // TODO ask database for active scheduledtasks
        // let scheduledJobs = DatabaseServive.FetchActiveScheduledJobsFromDB();

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
                this.jobsToExecute.push({jobType: DatabaseService.JobType.WATERING, job: scheduledJobs[job_idx]});
                console.log("Scheduled to be executed:", scheduledJobs[job_idx].name);
            } 
            else {
                nextScheduleCheck = Math.min(nextScheduleCheck, time_difference);
            }
        }
        //console.log("Next schedule check:", nextScheduleCheck)
        this.currentTimeout = setTimeout(this.checkForScheduledJobs.bind(this), nextScheduleCheck);
    }

    calculateNextSchedule(jobData) {
        jobData.job.nextExecution = jobData.job.executionInterval + (Date.now());

        // modify entry in DB
        DatabaseService.UpdateJobToDB(jobData.jobType, jobData.job);
    }
}

export {ScheduleManager};
