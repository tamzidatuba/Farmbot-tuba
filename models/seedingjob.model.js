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

const seedingJobModel = mongoose.model('seedingjob', seedingJobSchema);

async function InsertSeedingJobToDB(jobname, plants) {
  const now = new Date();
  let existingjob = await seedingJobModel.findOne({"jobname":jobname});
  if (existingjob)
  {
    return false;
  }
  else
  {
  await seedingJobModel.create({ jobname: jobname, createdat: now, plants: plants });
  console.log('Job has been inserted');
  return true;
  }

}

async function FetchSeedingJobsFromDB() {
  const jobs = await seedingJobModel.find();
  return jobs;
}

async function DeleteSeedingJobFromDB(jobname) {
  await seedingJobModel.deleteOne({ " jobname": jobname });
}

async function UpdateSeedingJobToDB(jobname, plants) {
  const now = new Date();
  await seedingJobModel.findOneAndUpdate({ "jobname": jobname }, { jobname: jobname, createdat: now, plants: plants });
  console.log("Job has been updated.");

}


export default {
  InsertSeedingJobToDB,
  FetchSeedingJobsFromDB,
  DeleteSeedingJobFromDB,
  UpdateSeedingJobToDB,
};