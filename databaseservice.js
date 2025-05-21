import mongoose from 'mongoose';
import seedingModule from './models/seedingjob.model.js';
import wateringModule from './models/wateringjob.model.js';
import notificationModel from './models/notification.model.js';

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
        const {jobname, x, y, planttype, depth } = object;

        if (!planttype || isNaN(x) || isNaN(y) || isNaN(depth)) {
            throw new Error("Invalid seeding job data");
        }

        payload = {
            jobname,
            x,
            y,
            planttype,
            depth,
        };

        await seedingModule.InsertSeedingJobToDB(jobname, x, y, planttype, depth);
    }

    else if (jobType === JobType.WATERING) {
        const {jobname, plantName, x, y, wateringcapacity } = object;

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

        await wateringModule.InsertWateringJobToDB(jobname, plantName, x, y, wateringcapacity);
    }

    console.log('Job has been inserted');
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

    if(!jobname) {
        throw new Error("Invalid job Name: " + jobname);
    }

    if (jobType === JobType.SEEDING) {
        await seedingModule.DeleteSeedingJobFromDB(jobname);
    } else if (jobType === JobType.WATERING) {
        await wateringModule.DeleteWateringJobFromDB(jobname);
    }
}

async function InsertNotificationToDB(text) {
    await notificationModel.InsertNotificationToDB(text);
}

async function FetchNotificationsFromDB() {
    const notifications = await notificationModel.FetchNotificationsFromDB();
    return notifications;
}

export default {
    InsertJobToDB,
    FetchJobsFromDB,
    DeleteJobFromDB,
    JobType,
    InsertNotificationToDB,
    FetchNotificationsFromDB,
};