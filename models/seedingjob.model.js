import mongoose from 'mongoose';

const seedingJobSchema = new mongoose.Schema({
  jobname : String,
  xcoordinate: Number,
  ycoordinate: Number,
  depth: Number,
  planttype: String,
  createdAt: Date
});

const seedingJob = mongoose.model('seedingjob', seedingJobSchema);

async function InsertSeedingJobToDB(jobname, x, y, planttype, depth) {
  const now = new Date();
  await seedingJob.create({ jobname: jobname, xcoordinate: x, ycoordinate: y, planttype: planttype, depth: depth, createdAt: now });
  console.log('Job has been inserted');
}

async function FetchSeedingJobsFromDB() {
  const jobs = await seedingJob.find();
  return jobs;
}

async function DeleteSeedingJobFromDB(jobname) {
  await seedingJob.deleteOne({jobname: jobname});
}

export default {
  InsertSeedingJobToDB,
  FetchSeedingJobsFromDB,
  DeleteSeedingJobFromDB,
  //   findAll,
  //   model: seedingJob,
};