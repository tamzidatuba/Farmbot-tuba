import mongoose from 'mongoose';
import seedingModule from './models/seedingjob.model.js';
import wateringModule from './models/wateringjob.model.js';

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

async function InsertJobToDB(jobType, object) {
    const now = new Date();

    if (!Object.values(JobType).includes(jobType)) {
        throw new Error("Invalid job type: " + jobType);
    }

    let payload = {};

    if (jobType === JobType.SEEDING) {
        const { x, y, planttype, depth } = object;

        if (!planttype || isNaN(x) || isNaN(y) || isNaN(depth)) {
            throw new Error("Invalid seeding job data");
        }

        payload = {
            x,
            y,
            planttype,
            depth,
        };

        await seedingModule.InsertSeedingJobToDB(x, y, planttype, depth);
    }

    else if (jobType === JobType.WATERING) {
        const { plantName, x, y, wateringcapacity } = object;

        if (isNaN(x) || isNaN(y) || isNaN(wateringcapacity)) {
            throw new Error("Invalid watering job data");
        }
        payload = {
            plantName,
            x,
            y,
            wateringcapacity,
        };

        await wateringModule.InsertWateringJobToDB(plantName, x, y, wateringcapacity);
    }

    console.log('Job has been inserted');
}

async function FetchJobs(jobType) {
    if (!Object.values(JobType).includes(jobType)) {
        throw new Error("Invalid job type: " + jobType);
    }

    let jobs = [];

    if (jobType === JobType.SEEDING) {
        jobs = await seedingModule.FetchSeedingJobsFromDB();
    } else if (jobType === JobType.WATERING) {
        // jobs = await wateringModule.fet();
    }

    return jobs;
}

export default {
    InsertJobToDB,
    FetchJobs,
    JobType,
    //   findAll,
    //   model: seedingJob,
};