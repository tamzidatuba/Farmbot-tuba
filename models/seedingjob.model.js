import mongoose from 'mongoose';

const seedingJobSchema = new mongoose.Schema({
  jobname: String,
  createdat: Date,
  plants: [{
    xcoordinate: Number,
    ycoordinate: Number,
    depth: Number,
    planttype: String,
  }],
});

const seedingJob = mongoose.model('seedingjob', seedingJobSchema);

async function InsertSeedingJobToDB(jobname, plants) {
  const now = new Date();
  await seedingJob.create({ jobname: jobname, createdat: now, plants: plants });
  console.log('Job has been inserted');
}

async function FetchSeedingJobsFromDB() {
  const jobs = await seedingJob.find();
  return jobs;
}

async function DeleteSeedingJobFromDB(jobname) {
  await seedingJob.deleteOne({ " jobname": jobname });
}

async function UpdateSeedingJobToDB(jobname, plants) {
  const now = new Date();
  await seedingJob.findOneAndUpdate({ "jobname": jobname }, { jobname: jobname, createdat: now, plants: plants });
  console.log("Job has been updated.");

}


export default {
  InsertSeedingJobToDB,
  FetchSeedingJobsFromDB,
  DeleteSeedingJobFromDB,
  UpdateSeedingJobToDB,
};