import mongoose from 'mongoose';

const seedingJobSchema = new mongoose.Schema({
  xcoordinate: Number,
  ycoordinate: Number,
  planttype : String,
  date: Date
});

const seedingJob = mongoose.model('seedingjob', seedingJobSchema);

async function InsertSeedingJobToDB(x, y, planttype) {
  const now = new Date();
  await seedingJob.create({ xcoordinate: x, ycoordinate: y, planttype: planttype, date: now });
  console.log('Job has been inserted');
}

export default {
  InsertSeedingJobToDB,
//   findAll,
//   model: seedingJob,
};