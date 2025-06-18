import databaseservice from "../databaseservice.js";
import DatabaseService from "../databaseservice.js";

const SCHEDULE_CHECKING_INTERVAL = 900000 // 15*60*1000 = 15min
const SCHEDULE_TOLERANCE = 15000; // 15 Second execution tolerance

class ScheduleManager {

    constructor(backend) {
        this.backend = backend;
        this.jobsToExecute = new Array();

        this.checkForScheduledJobs()
        this.currentTimeout;

    }

    async loadQueuedjobsFromDB() {
        // ask DB for queued Jobs from last time
        
        let queuedJobs = await DatabaseService.FetchJobsFromDB(DatabaseService.JobType.EXECUTION);
        queuedJobs.sort(function(job1 ,job2) {
            if (job1.time_stamp > job2.time_stamp) return 1;
            else if (job1.time_stamp < job2.time_stamp) return -1;
            else return 0;
        });
        console.log("Queued jobs from last Uptime: ", queuedJobs);
        for (let job of queuedJobs) {
            let loadedJob = await DatabaseService.ReturnSingleJob(job.job_name);
            if (typeof(loadedJob) === "undefined") {
                console.log("Couldn't find job with jobname '" + job.job_name + "' in DB");
                DatabaseService.DeleteJobFromDB(DatabaseService.JobType.EXECUTION, job.job_name);
            } else {
                this.jobsToExecute.push(loadedJob);
            }
        }
    }

    isJobScheduled() {
        return this.jobsToExecute.length > 0;
    }

    getScheduledJob() {
        // remove job from queue DB
        DatabaseService.DeleteJobFromDB(DatabaseService.JobType.EXECUTION, this.jobsToExecute[0].job.jobname);
        return this.jobsToExecute.shift();
    }

    removeScheduledJob(name) {
        for (const job in this.jobsToExecute) {
            if (this.jobsToExecute[job].job.name == name) {
                this.jobsToExecute.splice(job, 1);
                // remove job from queue DB
                DatabaseService.DeleteJobFromDB(DatabaseService.JobType.EXECUTION, jobsToExecute[job].job.jobname);
                return true;
            }
        }
        return false;
    }

   async appendScheduledJob(newJob) {
    // Check if job is already queued
        for (const job in this.jobsToExecute) {
            if (this.jobsToExecute[job].job.jobname == newJob.job.jobname) {
                return false;
            }
        }
        // add job to queue DB
        await DatabaseService.InsertJobToDB(DatabaseService.JobType.EXECUTION, {
            job_name: newJob.job.jobname,
            time_stamp: Date.now()
        });

        this.jobsToExecute.push(newJob);
        console.log("Scheduled to be executed:", newJob.job.jobname);
        return true;
    }     

    async checkForScheduledJobs() {
        clearTimeout(this.currentTimeout);
        // ask database for scheduledtasks
        let scheduledJobs = await DatabaseService.FetchJobsFromDB(DatabaseService.JobType.WATERING);

        let currentTime = Date.now();
        let nextScheduleCheck = SCHEDULE_CHECKING_INTERVAL;

        for (const scheduled_job of scheduledJobs) {
            
            //check if scheduled job is active
            if (!scheduled_job.isScheduled || scheduled_job.scheduleData.enabled) {
                continue;
            }

            // calculate the time difference of current time and planned execution time
            let time_difference = scheduled_job.scheduleData.next_execution_time - currentTime;
            if (time_difference <= SCHEDULE_TOLERANCE) {
                appendScheduledJob({jobType: DatabaseService.JobType.WATERING, job: scheduled_job});
            } else {
                nextScheduleCheck = Math.min(nextScheduleCheck, time_difference);
            }
        }
        // assign the next timeout based on the next scheduled job
        this.currentTimeout = setTimeout(this.checkForScheduledJobs.bind(this), nextScheduleCheck);
        this.backend.checkForNextJob();
    }

    calculateNextSchedule(jobData) {
        // calculate next execution-time
        jobData.job.scheduleData.next_execution_time = jobData.job.scheduleData.interval + (Date.now());

        // modify entry in DB
        DatabaseService.UpdateJobToDB(jobData.jobType, jobData.job);
    }
}

export {ScheduleManager};
