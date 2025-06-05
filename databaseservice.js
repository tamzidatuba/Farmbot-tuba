import mongoose from 'mongoose';
import seedingModule from './models/seedingjob.model.js';
import wateringModule from './models/wateringjob.model.js';
import notificationModel from './models/notification.model.js';
import plantModel from './models/plant.model.js';
import userModel from './models/user.model.js';

//connect to DB
const connectionString = 'mongodb://localhost:27017/admin';

// test connection to local database
mongoose.connect(connectionString)
    .then(() => console.log('MongoDB connected'))
    .catch((err) => console.error('MongoDB connection error:', err));

const JobType = Object.freeze({
    SEEDING: 'Seeding',
    WATERING: 'Watering',
});

const PlantRadii = {
    lettuce: 15,
    tomato: 10,
    carrot: 5,
}

async function InsertJobToDB(jobType, object) {
    const now = new Date();
    if (jobType === JobType.SEEDING) {
        const { jobname, seeds } = object;

        let result = await seedingModule.InsertSeedingJobToDB(jobname, seeds);
        
        if (result) {
            return true;
        }
        else {
            return false;
        }
    }
    
    else if (jobType === JobType.WATERING) {
        const { jobname, plantName, x, y, wateringcapacity } = object;

        if (isNaN(x) || isNaN(y) || isNaN(wateringcapacity)) {
            throw new Error("Invalid watering job data");
        }
        await wateringModule.InsertWateringJobToDB(jobname, plantName, x, y, wateringcapacity);
    }

    console.log('Job has been inserted');
}

async function ReturnSingleJob(id)
{
    let job = await seedingModule.ReturnSeedingJob(id);
    if( job !== null && typeof(job) !== "undefined")
    {
        return {job};
       
    }
    job = await wateringModule.ReturnWateringJob(id);
    if( job !== null && typeof(job) !== "undefined")
    {
        return {job};
    }
    

}


async function FetchJobsFromDB(jobType) {
    if (!Object.values(JobType).includes(jobType)) {
        throw new Error("Invalid job type: " + jobType);
    }

    let jobs = [];

    if (jobType === JobType.SEEDING) {
        jobs = await seedingModule.FetchSeedingJobsFromDB();
    } else if (jobType === JobType.WATERING) {
        jobs = await wateringModule.FetchAllWateringJobsFromDB();
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
    } else if (jobType === JobType.WATERING) {
        await wateringModule.DeleteWateringJobFromDB(jobname);
    }
}

async function UpdateJobToDB(jobType, object) {
    const now = new Date();

    if (!Object.values(JobType).includes(jobType)) {
        throw new Error("Invalid job type: " + jobType);
    }

    let payload = {};

    if (jobType === JobType.SEEDING) {
        const { jobname, seeds } = object;
        await seedingModule.UpdateSeedingJobToDB(jobname, seeds);
    }

    else if (jobType === JobType.WATERING) {
        const { jobname, plantName, x, y, wateringcapacity } = object;

        if (isNaN(x) || isNaN(y) || isNaN(wateringcapacity)) {
            throw new Error("Invalid watering job data");
        }
        payload = {
            jobname,
            plantName,
            x,
            y,
            wateringcapacity,
        };

        await wateringModule.UpdateWateringJobToDB(jobname, plantName, x, y, wateringcapacity);
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

    const plants  = await plantModel.FetchPlantsFromDB();
    return plants;
}

async function InsertPlantsToDB(plants)
{
    for (let plant of plants) {
        await plantModel.InsertPlantToDB(plant);
    }    
}

async function FetchUserfromDB(username,password) {
    const users  = await userModel.FetchUser(username,password);
    return users;
}

async function UpdateUserToDB(username,password) {
    const users  = await userModel.UpdateUser(username,password);
}

async function ValidateNewSeedsAgainstPreviousJobs(newSeedsToPutInNewJob)
{
    let existingJobs = await FetchJobsFromDB(JobType.SEEDING);
    let invalidSeeds = [];

    for (let newSeed of newSeedsToPutInNewJob) {
        for (let existingJob of existingJobs) {
            let isValid = true;
            for (let seedInsideExistingJob of existingJob.seeds) {
                let distance = GetDistance(newSeed.xcoordinate, newSeed.ycoordinate, seedInsideExistingJob.xcoordinate, seedInsideExistingJob.ycoordinate);
                if (distance <= PlantRadii[seedInsideExistingJob.seedtype]) {
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

async function ValidateNewSeedsAgainstPlants(seeds){
    let plants = await FetchPlantsfromDB();
    let invalidSeeds = [];

    for (let seed of seeds) {
        let isValid = true;
        for (let plant of plants) {
            let distance = GetDistance(seed.xcoordinate, seed.ycoordinate, plant.xcoordinate, plant.ycoordinate);
            if (distance <= PlantRadii[plant.planttype]) {
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
