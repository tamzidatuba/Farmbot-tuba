import mongoose from 'mongoose';

const seedingJobSchema = new mongoose.Schema({
  xcoordinate: Number,
  ycoordinate: Number,
  depth: Number,
  planttype: String,
  createdAt: Date
});

const seedingJob = mongoose.model('seedingjob', seedingJobSchema);

async function InsertSeedingJobToDB(x, y, planttype, depth) {
  const now = new Date();
  await seedingJob.create({ xcoordinate: x, ycoordinate: y, planttype: planttype, depth: depth, createdAt: now });
  console.log('Job has been inserted');
}

async function FetchSeedingJobsFromDB() {
  const jobs = await seedingJob.find();
  return jobs;
}

async function DeleteSeedingJobFromDB(id) {
  await seedingJob.findByIdAndDelete(id);
}

export default {
  InsertSeedingJobToDB,
  FetchSeedingJobsFromDB,
  DeleteSeedingJobFromDB,
  //   findAll,
  //   model: seedingJob,
};