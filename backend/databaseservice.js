import mongoose from 'mongoose';
import seedingModule from '../models/seedingjob.model.js';
import wateringModule from '../models/wateringjob.model.js';
import notificationModel from '../models/notification.model.js';
import plantModel from '../models/plant.model.js';
import userModel from '../models/user.model.js';
import ExecutionModel from '../models/execution.model.js';
import questionModel from '../models/question.model.js';
import { GetDistance } from '../frontend/scripts/tools.js';

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
    radish: 2,
}

async function InsertJobToDB(jobType, object) {
    const now = new Date();
    if (jobType === JobType.SEEDING) {
        const { jobname, seeds } = object;
        let existingjob =  await seedingModule.findOne({ "jobname": jobname });
        if (existingjob) {
            return "The Job name already exists in the database.";
        }

        let invalids = await  ValidateNewSeedsAgainstThemselves(seeds);
        if (invalids.length > 0) {
            return "Coordinates given have overlap with one of the seeds inside the job.";
        }
        invalids = await ValidateCurrentSeedsAgainstOtherJobs(jobname, seeds);
        if (invalids.length > 0) {
            return "Coordinates given have overlap with one of the seeds inside one of previous jobs.";
        }
        invalids = await ValidateNewSeedsAgainstPlants(seeds);
        if (invalids.length > 0) {
            return "Coordinates given have overlap with plants.";
        }

        await seedingModule.InsertSeedingJobToDB(jobname, seeds);        
    }

    else if (jobType === JobType.WATERING) {
        const { jobname, plantstobewatered, is_scheduled, scheduleData } = object;
        let existingjob = await wateringModule.findOne({ "jobname": jobname });
        if (existingjob) {
            return "The Job name already exists in the Database.";
        }
        await wateringModule.InsertWateringJobToDB(jobname, plantstobewatered, is_scheduled, scheduleData);
    }
    else if (jobType == JobType.EXECUTION){
        const {job_name, time_stamp} = object;
        await ExecutionModel.InsertintoExecutionDB(job_name,time_stamp);
    }
    return true;
}

async function ReturnSingleJob(jobname) {
    let job = await seedingModule.ReturnSeedingJob(jobname);
    if (job !== null && typeof (job) !== "undefined") {
        return job;

    }
    job = await wateringModule.ReturnWateringJob(jobname);
    if (job !== null && typeof (job) !== "undefined") {
        return job;
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

        let invalids = ValidateNewSeedsAgainstThemselves(seeds);
        if (invalids.length > 0) {
            return "New coordinates have overlap with one of the seeds inside the job.";
        }
        invalids = await ValidateCurrentSeedsAgainstOtherJobs(jobname, seeds);
        if (invalids.length > 0) {
            return "New coordinates have overlap with one of the seeds inside one of previous jobs.";
        }
        invalids = await ValidateNewSeedsAgainstPlants(seeds);
        if (invalids.length > 0) {
            return "New coordinates have overlap with plants.";
        }

        await seedingModule.UpdateSeedingJobToDB(jobname, seeds);
    }

    else if (jobType === JobType.WATERING) {
        const { jobname, plantstobewatered, is_scheduled, ScheduleData } = object;
        await wateringModule.UpdateWateringJobToDB(jobname, plantstobewatered, is_scheduled, ScheduleData);
    }

    console.log('The Job has been updated in the Database.');
    return true;
}



async function InsertQuestionsIntoDB(question, answer)
{
   let question1 =  await questionModel.InsertQuestionsToDB(question, answer);
}

async function FetchAlltheQuestionsFromDB()
{
   let question2 =  await questionModel.FetchAllQuestionsFromDB();
   return question2;
}

async function FetchQuestionsFromDBbyQuestion(question)
{
   let question3 =  await questionModel.FetchSpecificQuestionsFromDB(question);
   return question3;
}

async function InsertAnswerIntoDB(question, answer)
{
    let answer_recieved = await questionModel.InsertAnswersIntoDB(question,answer);
    return answer_recieved;
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

async function DeletePlantFromDB(xcoordinate, ycoordinate) {
    await plantModel.DeletePlantFromDB(xcoordinate, ycoordinate);
}

function ValidateNewSeedsAgainstThemselves(newSeeds) {
    let invalidSeeds = [];

    for (let i = 0; i < newSeeds.length; i++) {
        for (let j = i + 1; j < newSeeds.length; j++) {
            let seedA = newSeeds[i];
            let seedB = newSeeds[j];
            let distance = GetDistance(seedA.xcoordinate, seedA.ycoordinate, seedB.xcoordinate, seedB.ycoordinate);
            let typeA = seedA.seedtype.toLowerCase();
            let typeB = seedB.seedtype.toLowerCase();

            if (distance <= PlantRadii[typeA] + PlantRadii[typeB]) {
                if (!invalidSeeds.includes(seedA)) invalidSeeds.push(seedA);
                if (!invalidSeeds.includes(seedB)) invalidSeeds.push(seedB);
            }
        }
    }

    return invalidSeeds;
}

async function ValidateCurrentSeedsAgainstOtherJobs(jobname, seeds) {
    let allJobs = await FetchJobsFromDB(JobType.SEEDING);
    let currentJob = allJobs.find(job => job.jobname === jobname);
    let otherJobs;
    if(currentJob === undefined)  // this happens when the we are creating a new job
    {
        otherJobs = allJobs; 
    }
    else // this happens when the we are modifying a previous job
    {
        otherJobs = allJobs.filter(job => job.jobname !== currentJob.jobname);
    }       
     
    let invalidSeeds = [];

    for (let seed of seeds) {
        for (let otherJob of otherJobs) {
            let isValid = true;
            for (let existingseed of otherJob.seeds) {
                let distance = GetDistance(seed.xcoordinate, seed.ycoordinate, existingseed.xcoordinate, existingseed.ycoordinate);
                let existingseedtype = existingseed.seedtype.toLowerCase();
                let seedtype = seed.seedtype.toLowerCase();
                if (distance <= PlantRadii[existingseedtype] + PlantRadii[seedtype]) {
                    invalidSeeds.push(seed);
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

async function clearPlantFromWateringJobs(xcoordinate,  ycoordinate) {
    let watering_jobs = await FetchJobsFromDB(JobType.WATERING);
    for (let watering_job of watering_jobs) {
        let new_plants_to_be_watered = new Array();
        let job_modified = false;
        for (let watering_data of watering_job.plantstobewatered) {
            if (watering_data.plant.xcoordinate == xcoordinate && watering_data.plant.ycoordinate == ycoordinate) {
                job_modified = true;
            } else {
                new_plants_to_be_watered.push(watering_data);
            }
        }
        if (!job_modified) continue;
        if (new_plants_to_be_watered.length > 0) {
            watering_job.plantstobewatered = new_plants_to_be_watered;
            UpdateJobToDB(JobType.WATERING, watering_job);
        } else {
            DeleteJobFromDB(JobType.WATERING, watering_job.jobname);
        }
    }
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
    ValidateNewSeedsAgainstPlants,
    FetchPlantsfromDB,
    FetchUserfromDB,
    ReturnSingleJob,
    InsertQuestionsIntoDB,
    FetchAlltheQuestionsFromDB,
    FetchQuestionsFromDBbyQuestion,
    DeletePlantFromDB,
    InsertAnswerIntoDB,
    clearPlantFromWateringJobs,
};
