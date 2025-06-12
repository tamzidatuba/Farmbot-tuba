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
            this.jobsToExecute.push(loadedJob);
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
                break;
            }
        }
    }

   appendScheduledJob(newJob) {
        for (const job in this.jobsToExecute) {
            if (this.jobsToExecute[job].job.jobname == newJob.job.jobname) {
                return false;
            }
        }
        // add job to queue DB
        DatabaseService.InsertJobToDB(DatabaseService.JobType.EXECUTION, {
            job_name: newJob.job.jobname,
            time_stamp: Date.now()
        });

        this.jobsToExecute.push(newJob);
        console.log("Scheduled to be executed:", newJob.job.jobname);
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
