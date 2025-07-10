import mongoose from 'mongoose';
import express from 'express';

//connect to DB
const connectionString = 'mongodb://localhost:27017/admin';
const app = express();
app.use(express.json());

// test connection to local database
mongoose.connect(connectionString)
  .then(() => console.log('MongoDB connected to the Seeding Job Database.'))
  .catch((err) => console.error('MongoDB connection error: to the Seeding Job Database.', err));

//define the schema or the structure of each document/ entry in Mongo DB
const seedingJobSchema = new mongoose.Schema({
  jobname: String,
  seeds: [{
    seedname: String,
    xcoordinate: Number,
    ycoordinate: Number,
    depth: Number,
    seedtype: String,
  }],
});

//create a model to interact with the schema
const seedingJobModel = mongoose.model('seedingjob', seedingJobSchema);


//function to insert seeding job into the DB
async function InsertSeedingJobToDB(jobname, seeds) {
  await seedingJobModel.create({ jobname: jobname, seeds: seeds });
  return true;
}

//function to retrieve a specific seeding job from the DB through the jobname
async function ReturnSeedingJob(jobname) {
  const job = await seedingJobModel.findOne({ "jobname": jobname });
  if (job !== null && typeof (job) !== "undefined") {
    return { jobType: "Seeding", job };
  }
  else {
    return null;
  }
}

//function to retrieve all seeding jobs from the DB
async function FetchSeedingJobsFromDB() {
  const jobs = await seedingJobModel.find();
  return jobs;
}

//funtion to delete seeding jobs from the DB through Jobname
async function DeleteSeedingJobFromDB(jobname) {
  await seedingJobModel.deleteOne({ "jobname": jobname });
}

//function to update seeds in the seeding job through jobname
async function UpdateSeedingJobToDB(jobname, seeds) {
  const now = new Date();
  await seedingJobModel.findOneAndUpdate({ "jobname": jobname }, { jobname: jobname, seeds: seeds });
  console.log("Job has been updated.");

}

//export all the functions for further usage
export default {
  InsertSeedingJobToDB,
  FetchSeedingJobsFromDB,
  DeleteSeedingJobFromDB,
  UpdateSeedingJobToDB,
  ReturnSeedingJob,
  findOne: (args) => seedingJobModel.findOne(args),
};