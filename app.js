import express from 'express';

import path from 'path';
import { fileURLToPath } from 'url';
import DatabaseService from './databaseservice.js';

const app = express();
const PORT = 3000;

// Setup __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files (CSS, JS) from root
app.use(express.static(__dirname));
app.use(express.json());

// Serve index.html on root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});


app.post('/api/insertjob/:jobType', async (req, res) => {
  const { jobType } = req.params;
  const object = req.body;

  try {
    await DatabaseService.InsertJobToDB(jobType, object);
    res.status(200).json({ message: 'Job saved' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save job' });
  }
});


app.get('/api/getjobs/:jobType', async (req, res) => {
  const { jobType } = req.params;
  try {
    let jobs;
    jobs = await DatabaseService.FetchJobsFromDB(jobType);
    res.status(200).json(jobs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }  
});


app.delete('/api/deletejob/:jobtype/:id', async (req, res) => {
  const {jobtype, id} = req.params;
  try {
    await DatabaseService.DeleteJobFromDB(jobtype, id);
    res.status(200).json({ message: 'Job deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete job' });
  }
});

// app.delete('/api/deletewateringjob/:id', async (req, res) => {
//   const {id} = req.params;
//   try {
//     await WateringModule.DeleteWateringJobToDB(id);
//     res.status(200).json({ message: 'Job deleted' });
//   } catch (err) {
//     res.status(500).json({ error: 'Failed to delete job' });
//   }
// });

// app.get('/api/wateringjobs', async (req,res)=>{
//     try {
//     const allwateringjobs = await WateringModule.FetchAllWateringJobs();
//     res.status(200).json(allwateringjobs);
//   } catch (err) {
//     res.status(500).json({ error: 'Failed to fetch jobs' });
//   }
// })


app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});