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
  await seedingJob.deleteOne({" jobname": jobname });
}

async function UpdateSeedingJobToDB(jobname, x,y, planttype, depth) {
  const now = new Date();
  await seedingJob.findOneAndUpdate( {"jobname": jobname},{ xcoordinate: x, ycoordinate: y, planttype: planttype, depth: depth, createdAt: now});
  console.log("Job has been updated.");
  
}


export default {
  InsertSeedingJobToDB,
  FetchSeedingJobsFromDB,
  DeleteSeedingJobFromDB,
  UpdateSeedingJobToDB,
};