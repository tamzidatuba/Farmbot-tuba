import mongoose from 'mongoose';


const seedingJobSchema = new mongoose.Schema({
  jobname: String,
  createdat: Date,
  seeds: [{
    xcoordinate: Number,
    ycoordinate: Number,
    depth: Number,
    seedtype: String,
  }],
});

const seedingJobModel = mongoose.model('seedingjob', seedingJobSchema);

async function InsertSeedingJobToDB(jobname, seeds) {
  const now = new Date();
  let existingjob = await seedingJobModel.findOne({"jobname":jobname});
  if (existingjob)
  {
    return false;
  }
  else
  {
  await seedingJobModel.create({ jobname: jobname, createdat: now, seeds: seeds });
  console.log('Job has been inserted');
  return true;
  }

}

async function ReturnSeedingJob(id)
{
    const job = await seedingJobModel.findById(id).select('jobname');
    if( job !== null && typeof(job) !== "undefined")
    {
      return{jobType:"Seeding",job};
    }
    else{
      return null;
    }

}




//mongoose.Types.ObjectId(req.params.id)


async function FetchSeedingJobsFromDB() {
  const jobs = await seedingJobModel.find();
  return jobs;
}

async function DeleteSeedingJobFromDB(jobname) {
  await seedingJobModel.deleteOne({ "jobname": jobname });
}

async function UpdateSeedingJobToDB(jobname, plants) {
  const now = new Date();
  await seedingJobModel.findOneAndUpdate({ "jobname": jobname }, { jobname: jobname, createdat: now, seeds: seeds });
  console.log("Job has been updated.");

}


export default {
  InsertSeedingJobToDB,
  FetchSeedingJobsFromDB,
  DeleteSeedingJobFromDB,
  UpdateSeedingJobToDB,
  ReturnSeedingJob,
};