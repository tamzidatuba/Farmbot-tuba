import mongoose from 'mongoose';

const seedingJobSchema = new mongoose.Schema({
  jobname: String,
  seeds: [{
    xcoordinate: Number,
    ycoordinate: Number,
    depth: Number,
    seedtype: String,
  }],
});

const seedingJobModel = mongoose.model('seedingjob', seedingJobSchema);

async function InsertSeedingJobToDB(jobname, seeds) {
  await seedingJobModel.create({ jobname: jobname, seeds: seeds });
  return true;
}

async function ReturnSeedingJob(jobname)
{
    const job = await seedingJobModel.findOne({"jobname": jobname});
    if( job !== null && typeof(job) !== "undefined")
    {
      return{jobType:"Seeding",job};
    }
    else{
      return null;
    }
}

async function FetchSeedingJobsFromDB() {
  const jobs = await seedingJobModel.find();
  return jobs;
}

async function DeleteSeedingJobFromDB(jobname) {
  await seedingJobModel.deleteOne({ "jobname": jobname });
}

async function UpdateSeedingJobToDB(jobname, seeds) {
  const now = new Date();
  await seedingJobModel.findOneAndUpdate({ "jobname": jobname }, { jobname: jobname, seeds: seeds });
  console.log("Job has been updated.");

}

export default {
  InsertSeedingJobToDB,
  FetchSeedingJobsFromDB,
  DeleteSeedingJobFromDB,
  UpdateSeedingJobToDB,
  ReturnSeedingJob,
  findOne: (args) => seedingJobModel.findOne(args),
};