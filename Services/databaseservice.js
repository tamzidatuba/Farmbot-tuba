import express from 'express';
import mongoose from 'mongoose';
import wateringModule from '../models/wateringjob.model.js';
import seedingModule from '../models/seedingjob.model.js';

const connectionString = 'mongodb://localhost:27017/admin';
const app = express();
app.use(express.json());

// test connection to local database
mongoose.connect(connectionString)
.then(() => console.log('MongoDB connected'))
.catch((err) => console.error('MongoDB connection error:', err));

async function SaveWateringJob(plantName, x, y, duration)
{
  await wateringModule.create({plantName: plantName, xcoordinate: x, ycoordinate: y,wateringDuration:duration});
}

async function SaveSeedingJob(x, y, planttype, depth) {
  await seedingModule.InsertSeedingJobToDB(x, y, planttype, depth);
}

export default {
  SaveWateringJob,
  SaveSeedingJob,
};