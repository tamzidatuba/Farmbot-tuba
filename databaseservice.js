import mongoose from 'mongoose';
import seedingModule from './models/seedingjob.model.js';
import wateringModule from './models/wateringjob.model.js';
import notificationModel from './models/notification.model.js';
import plantModel from './models/plant.model.js';
import userModel from './models/user.model.js';
import ExecutionModel from './models/execution.model.js';

//connect to DB
const connectionString = 'mongodb://localhost:27017/admin';

// test connection to local database
mongoose.connect(connectionString)
    .then(() => console.log('MongoDB connected to perform Database Services.'))
    .catch((err) => console.error('MongoDB connection error: to Database Services', err));


const JobType = Object.freeze({
    SEEDING: 'Seeding',
    WATERING: 'Watering',    
    HOME: 'Home',
    EXECUTION: 'Execution',
});

const PlantRadii = {
    lettuce: 15,
    tomato: 30,
    carrot: 2,
}

async function InsertJobToDB(jobType, object) {
    const now = new Date();
    if (jobType === JobType.SEEDING) {
        const { jobname, seeds } = object;
        let existingjob =  await seedingModule.findOne({ "jobname": jobname });
        if (existingjob) {
            return "job name already exists";
        }

        let invalids = await ValidateNewSeedsAgainstPreviousJobs(seeds);
        if (invalids.length > 0) {
            return "existing seeds found in previous jobs";
        }
        invalids = await ValidateNewSeedsAgainstPlants(seeds);
        if (invalids.length > 0) {
            return "existing seeds found in plants";
        }

        await seedingModule.InsertSeedingJobToDB(jobname, seeds);        
    }

    else if (jobType === JobType.WATERING) {
        const { jobname, plantstobewatered } = object;
        let existingjob = await wateringModule.findOne({ "jobname": jobname });
        if (existingjob) {
            return "job name already exists";
        }
        await wateringModule.InsertWateringJobToDB(jobname, plantstobewatered);
    }
    else if (jobType == JobType.EXECUTION){
        const {job_name, time_stamp} = object;
        let new_job = await ExecutionModel.InsertintoExecutionDB(job_name,time_stamp);
    }
    return true;
}

async function ReturnSingleJob(jobname) {
    let job = await seedingModule.ReturnSeedingJob(job_name);
    if (job !== null && typeof (job) !== "undefined") {
        return { job };

    }
    job = await wateringModule.ReturnWateringJob(jobname);
    if (job !== null && typeof (job) !== "undefined") {
        return { job };
    }    
}


async function FetchJobsFromDB(jobType) {
    if (!Object.values(JobType).includes(jobType)) {
        throw new Error("Invalid job type: " + jobType);
    }
    let jobs = [];
    if (jobType === JobType.SEEDING) {
        jobs = await seedingModule.FetchSeedingJobsFromDB();
    } 
    else if (jobType === JobType.WATERING) {                
        jobs = await wateringModule.FetchAllWateringJobsFromDB();
    }
    else if (jobType == JobType.EXECUTION)
    {
        jobs = await ExecutionModel.FetchAllfromExecutionDB();
    }
    return jobs;
}

async function DeleteJobFromDB(jobType, jobname) {
    if (!Object.values(JobType).includes(jobType)) {
        throw new Error("Invalid job type: " + jobType);
    }
    if (!jobname) {
        throw new Error("Invalid job Name: " + jobname);
    }
    if (jobType === JobType.SEEDING) {
        await seedingModule.DeleteSeedingJobFromDB(jobname);
    } 
    else if (jobType === JobType.WATERING) {
        await wateringModule.DeleteWateringJobFromDB(jobname);
    }
    else if (jobType === JobType.EXECUTION) {

        await ExecutionModel.RemovefromExecutionDB(jobname);
    } 
}

async function UpdateJobToDB(jobType, object) {
    if (!Object.values(JobType).includes(jobType)) {
        throw new Error("Invalid job type: " + jobType);
    }

    if (jobType === JobType.SEEDING) {
        const { jobname, seeds } = object;
        await seedingModule.UpdateSeedingJobToDB(jobname, seeds);
    }

    else if (jobType === JobType.WATERING) {
        const { jobname, plantstobewatered } = object;
        await wateringModule.UpdateWateringJobToDB(jobname, plantstobewatered);
    }

    console.log('Job has been updated.');
}


async function InsertNotificationToDB(text) {
    await notificationModel.InsertNotificationToDB(text);
}

async function FetchNotificationsFromDB() {
    const notifications = await notificationModel.FetchNotificationsFromDB();
    return notifications;
}

async function FetchPlantsfromDB() {

    const plants = await plantModel.FetchPlantsFromDB();
    return plants;
}

async function InsertPlantsToDB(plants) {
    for (let plant of plants) {
        await plantModel.InsertPlantToDB(plant);
    }
}

async function FetchUserfromDB(username, password) {
    const users = await userModel.FetchUser(username, password);
    return users;
}

async function UpdateUserToDB(username, password) {
    const users = await userModel.UpdateUser(username, password);
}

async function ValidateNewSeedsAgainstPreviousJobs(newSeedsToPutInNewJob) {
    let existingJobs = await FetchJobsFromDB(JobType.SEEDING);
    let invalidSeeds = [];

    for (let newSeed of newSeedsToPutInNewJob) {
        for (let existingJob of existingJobs) {
            let isValid = true;
            for (let seedInsideExistingJob of existingJob.seeds) {
                let distance = GetDistance(newSeed.xcoordinate, newSeed.ycoordinate, seedInsideExistingJob.xcoordinate, seedInsideExistingJob.ycoordinate);
                var seedInsideExistingJobSmallCase = seedInsideExistingJob.seedtype.toLowerCase();
                if (distance <= PlantRadii[seedInsideExistingJobSmallCase]) {
                    invalidSeeds.push(newSeed);
                    isValid = false;
                }
                if (!isValid) {
                    break; // No need to check further seeds in this job
                }
            }
            if (!isValid) {
                break; // No need to check further jobs
            }
        }
    }

    return invalidSeeds;
}

async function ValidateNewSeedsAgainstPlants(seeds) {
    let plants = await FetchPlantsfromDB();
    let invalidSeeds = [];

    for (let seed of seeds) {
        let isValid = true;
        for (let plant of plants) {
            let distance = GetDistance(seed.xcoordinate, seed.ycoordinate, plant.xcoordinate, plant.ycoordinate);
            var planttypeSmallCase = plant.planttype.toLowerCase();
            if (distance <= PlantRadii[planttypeSmallCase]) {
                invalidSeeds.push(seed);
                isValid = false;
            }
            if (!isValid) {
                break; // No need to check further plants for this seed
            }
        }
    }

    return invalidSeeds;
}


function GetDistance(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow((x1 - x2), 2) + Math.pow((y1 - y2), 2));
}


export default {
    InsertJobToDB,
    FetchJobsFromDB,
    DeleteJobFromDB,
    JobType,
    UpdateJobToDB,
    InsertNotificationToDB,
    FetchNotificationsFromDB,
    InsertPlantsToDB,
    UpdateUserToDB,
    ValidateNewSeedsAgainstPreviousJobs,
    ValidateNewSeedsAgainstPlants,
    FetchPlantsfromDB,
    FetchUserfromDB,
    ReturnSingleJob,
};
