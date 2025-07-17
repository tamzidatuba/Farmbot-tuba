import DatabaseService from "./databaseservice.js";

const SCHEDULE_CHECKING_INTERVAL = 900000 // 15*60*1000 = 15min
const SCHEDULE_TOLERANCE = 15000; // 15 Second execution tolerance

class ScheduleManager {

    constructor(backend) {
        this.backend = backend;
        this.jobsToExecute = new Array();
        
        this.currentTimeout;

    }

    // load jobs from execution queue from previous runtime of the software
    // (unecessary feature!)
    async loadQueuedjobsFromDB() {

        // ask DB for queued Jobs from last time
        let queuedJobs = await DatabaseService.FetchJobsFromDB(DatabaseService.JobType.EXECUTION);
        // sort the queued-jobs based on their queue-time to recreate the order
        queuedJobs.sort(function(job1 ,job2) {
            if (job1.time_stamp > job2.time_stamp) return 1;
            else if (job1.time_stamp < job2.time_stamp) return -1;
            else return 0;
        });
        console.log("Queued jobs from last Uptime: ", queuedJobs);
        // go through all the queued jobs and queue them
        for (let job of queuedJobs) {
            let loadedJob = await DatabaseService.ReturnSingleJob(job.job_name);
            if (typeof(loadedJob) === "undefined") {
                console.log("Couldn't find job with jobname '" + job.job_name + "' in DB");
                try {
                    await DatabaseService.DeleteJobFromDB(DatabaseService.JobType.EXECUTION, job.job_name);
                } catch {
                    console.log("!!! Corrupted Job in Execution DB detected. Please delete manually !!!");
                }
            } else {
                this.jobsToExecute.push(loadedJob);
            }
        }
    }
    // checks if any job is in execution-queue
    isJobScheduled() {
        return this.jobsToExecute.length > 0;
    }

    jobFinished() {
        this.jobsToExecute.shift()
    }

    // returns the next job to be executed from the execution-queue
    getScheduledJob() {
        try {
            // remove job from queue DB
            DatabaseService.DeleteJobFromDB(DatabaseService.JobType.EXECUTION, this.jobsToExecute[0].job.jobname);
        }
        catch {
            console.log("Job is not in Execution DB");
        }
        return this.jobsToExecute[0];
    }

    // removes a scheduled job from execution-queue
    removeScheduledJob(name) {
        if (this.backend.statusManager.runningJob) {
            if (name == this.backend.currentJobData.job.jobname) return false // return false in case its already being executed
        }
        for (const job_idx in this.jobsToExecute) {
            if (this.jobsToExecute[job_idx].job.jobname == name) {

                // remove job from queue
                const job_data = this.jobsToExecute.splice(job_idx, 1)[0];

                // handle demo job
                if("demo" in job_data) {
                    this.backend.demo_job_queued = false;
                    return true
                }
                // remove job from queue DB
                DatabaseService.DeleteJobFromDB(DatabaseService.JobType.EXECUTION, job_data.job.jobname);
                return true;
            }
        }
        return false;
    }

    // adds a job to the queue. returns true on success
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

        // adds job to execution-queue
        this.jobsToExecute.push(newJob);
        this.backend.appendNotification("queued", newJob.job.jobname);
        return true;
    }
    
    // adds a demo-job to the queue. returns true on success
    appendDemoJob(demo_job) {
        // Check if job is already queued
        for (const queued_job of this.jobsToExecute) {
            if ( queued_job.job.jobname == demo_job.job.jobname) {
                return false;
            }
        }
        // stop other demos from being queued
        this.backend.demo_job_queued = true;
        // add demo_job to queue
        this.jobsToExecute.push(demo_job);
        console.log("Scheduled to be executed:", demo_job.job.jobname);
        return true
    }
    /*
    * Checks all scheduled jobs if they are due to be executed
    * 
    * Queues scheduled jobs if they are overdue
    * 
    * Sets the next check to either SCHEDULE_CHECKING_INTERVAL (15 Minutes) or the lowest next schedule-time
    */
    async checkForScheduledJobs() {
        // clear previous timeout to avoid duplicate timeouts
        clearTimeout(this.currentTimeout);

        // ask database for scheduledtasks
        let scheduledJobs = await DatabaseService.FetchJobsFromDB(DatabaseService.JobType.WATERING);

        // get current-time and set the next-schedule-check to the maximum
        let currentTime = Date.now();
        let nextScheduleCheck = SCHEDULE_CHECKING_INTERVAL;

        // go through every scheduled job
        for (const scheduled_job of scheduledJobs) {
            
            //check if scheduled job is scheduled and enabled
            if (!scheduled_job.is_scheduled || !scheduled_job.ScheduleData.enabled) {
                continue;
            }

            // calculate the time difference of current time and planned execution time
            let time_difference = scheduled_job.ScheduleData.next_execution_time - currentTime;

            // checks if time_difference is lower than SCHEDULE_TOLERANCE (15 Seconds) -> queues the job
            // Otherwise sets next-schedule-check to minimum of current maximum-check-time and current-job schedule-time
            if (time_difference <= SCHEDULE_TOLERANCE) {
                await this.appendScheduledJob({jobType: DatabaseService.JobType.WATERING, job: scheduled_job});
            } else {
                nextScheduleCheck = Math.min(nextScheduleCheck, time_difference);
            }
        }
        // assign the next timeout based on the next scheduled job or Maximum-check-time
        this.currentTimeout = setTimeout(this.checkForScheduledJobs.bind(this), nextScheduleCheck);

        // check if job is scheduled -> ask backend to execute it
        if (this.isJobScheduled()) this.backend.checkForNextJob();
    }

    // calculates the next-schedule for a given job
    async calculateNextSchedule(jobData) {
        // calculate next execution-time
        jobData.job.ScheduleData.next_execution_time = jobData.job.ScheduleData.interval + (Date.now());

        // modify entry in DB
        await DatabaseService.UpdateJobToDB(jobData.jobType, jobData.job);

        // check the schedule of the jobs again (necessary if next_execution_time is lower then current timeout)
        this.checkForScheduledJobs();
    }
}

export {ScheduleManager};
