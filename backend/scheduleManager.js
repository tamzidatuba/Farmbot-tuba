import DatabaseService from "../databaseservice.js";

const SCHEDULE_CHECKING_INTERVAL = 900000 // 15*60*1000 = 15min
const SCHEDULE_TOLERANCE = 15000; // 15 Second execution tolerance

class ScheduleManager {

    constructor() {
        this.jobsToExecute = new Array();

        this.checkForScheduledJobs()
        this.currentTimeout;

    }

    async loadQueuedjobsFromDB() {
        // TODO ask DB for queued Jobs from last time
        /*
        array.sort(function(job1 ,job2) {
            if (job1.time_stamp > job2.time_stamp) return 1;
            else if (job1.time_stamp < job2.time_stamp) return -1;
            else return 0;
        });
        for (let job of array) {
            this.jobsToExecute.push(await DatabaseService.ReturnSingleJob(job.jobname))
        }
        */
    }

    isJobScheduled() {
        return this.jobsToExecute.length > 0;
    }

    getScheduledJob() {
        // TODO remove job from queue DB
        // DatabaseService.DeleteFromExecutionDB(jobsToExecute[0].name);
        return this.jobsToExecute.shift();
    }

    removeScheduledJob(name) {
        for (const job in this.jobsToExecute) {
            if (this.jobsToExecute[job].job.name == name) {
                this.jobsToExecute.splice(job, 1);
                // TODO remove job from queue DB
                // DatabaseService.DeleteFromExecutionDB(jobsToExecute[job].name);
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
        // TODO add job to queue DB
        // DatabaseService.InsertToExecutionDB({job_name: newJob.jobname, time_stamp: Date.now()})
        this.jobsToExecute.push(newJob);
        console.log("Scheduled to be executed:", newJob.jobname);
        return true;
    }

    checkForScheduledJobs() {
        clearTimeout(this.currentTimeout);
        // ask database for active scheduledtasks
        let scheduledJobs = DatabaseService.FetchJobsFromDB(DatabaseService.JobType.SCHEDULED);

        //let scheduledJobs = {};//{0: {"nextExecution": Date.now()+5000, "name": "Job1"}, 1: {"nextExecution": Date.now()+17000, "name": "Job2"}};
        let currentTime = Date.now();
        let nextScheduleCheck = SCHEDULE_CHECKING_INTERVAL;

        for (const job_idx in scheduledJobs) {
            
            //check if scheduled job is active
            if (!scheduledJobs[job_idx].enabled) {
                continue;
            }

            // calculate the time difference of current time and planned execution time
            let time_difference = scheduledJobs[job_idx].nextexecution - currentTime;
            if (time_difference <= SCHEDULE_TOLERANCE) {
                appendScheduledJob({jobType: DatabaseService.JobType.SCHEDULED, job: scheduledJobs[job_idx]});
            } else {
                nextScheduleCheck = Math.min(nextScheduleCheck, time_difference);
            }
        }
        //console.log("Next schedule check:", nextScheduleCheck)
        this.currentTimeout = setTimeout(this.checkForScheduledJobs.bind(this), nextScheduleCheck);
    }

    calculateNextSchedule(jobData) {
        jobData.job.nextexecution = jobData.job.interval + (Date.now());

        // modify entry in DB
        DatabaseService.UpdateJobToDB(jobData.jobType, jobData.job);
    }
}

export {ScheduleManager};
