import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import DatabaseService from './databaseservice.js';
import { initalizeBackend } from './backend/backend.js';

import { WateringJob } from './jobs/WateringJob.js';

const app = express();
const PORT = 3000;

// Setup __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let backend_initialized = false;

// Serve static files (CSS, JS) from root
app.use(express.static(path.join(__dirname, 'frontend//')));
app.use(express.json());

// Serve index.html on root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend//index.html'));
});


// insert job
app.post('/api/insertjob/:jobType', async (req, res) => {
  const { jobType } = req.params;
  const object = req.body;

  try {
    await DatabaseService.InsertJobToDB(jobType, object);
    backend.appendNotification("Job " + object.name + " saved at ");
    res.status(200).json({ message: 'Job saved' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save job' });
  }
});


// get jobs of type jobType
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

// delete job with id
app.delete('/api/deletejob/:jobtype/:id', async (req, res) => {
  const {jobtype, id} = req.params;
  try {
    await DatabaseService.DeleteJobFromDB(jobtype, id);
    backend.appendNotification("Job " + id + " deleted at ");
    res.status(200).json({ message: 'Job deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete job' });
  }
});

// modify job with id
app.post('/api/modifyjob/:id', async (req, res) => {
  const { id } = req.params;
  const object = req.body;

  try {
    // TODO modify entry in DB
    //await DatabaseService.InsertJobToDB(jobType, object);
    backend.appendNotification("Job " + object.name + " modified at ");
    res.status(200).json({ message: 'Job modified' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to modify job' });
  }
});

//start job
app.post('/api/startjob/:id', async (req, res) => {
  const { id } = req.params;
  backend.queueJob(id, res);
});

//pause job
app.put('/api/pausejob', async (req, res) => {
  backend.pauseJob(res);
});

//resume job
app.put('/api/resumejob', async (req, res) => {
  backend.continueJob(res);
});


app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

app.get('/api/executionPipeline', async (req, res) => {
  if (backend_initialized) {
    res.status(200).json(backend.scheduleManager.jobsToExecute);
  } else {
    res.status(200).json(new Array());
  }
})

app.get('/api/notifications', (req, res) => {
  if (backend_initialized) {
    res.status(200).json(backend.notification_history);
  }
  else {
    res.status(200).json(new Array());
  }
});

app.get('/api/status', (req, res) => {
  if (backend_initialized) {
    res.status(200).json({status: backend.statusManager.status});
  }
  else {
    res.status(200).json({status: "Offline"});
  }
});
const backend = await initalizeBackend();
backend_initialized = true;

// TODO delete
let wateringJob ={jobType: "watering", name: "MyWateringJob", positions: new Array({x: 100, y: 100,z: -50}), "ml": 500}

backend.scheduleManager.appendScheduledJob(wateringJob);
backend.checkForNextJob();