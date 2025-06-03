import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import DatabaseService from './databaseservice.js';
import { initalizeBackend } from './backend/backend.js';
import { WateringJob } from './jobs/WateringJob.js';
import plantModel from './models/plant.model.js';



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
    let result = await DatabaseService.InsertJobToDB(jobType, object);
    if (result){
      backend.appendNotification("Job " + object.name + " saved at ");
      res.status(200).json({ message: 'Job saved' });}
    else{
      res.status(201).json({message:"The job name already exists."});
    }
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

app.delete('/api/deletejob/:jobtype/:jobname', async (req, res) => {
  const {jobtype, jobname} = req.params;
  try {
    await DatabaseService.DeleteJobFromDB(jobtype, jobname);
    backend.appendNotification("Job " + id + " deleted at ");
    res.status(200).json({ message: 'Job deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete job' });
  }
});

app.put('/api/updatejob/:jobtype', async (req, res) => {
  const {jobtype} = req.params;
  const object = req.body;
  try {
    await DatabaseService.UpdateJobToDB(jobtype, object);
    backend.appendNotification("Job " + object.name + " modified at ");
    res.status(200).json({ message: 'Job updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update job' });
  }
});



app.get('/api/getnotifications', async (req, res) => {
  try {
    const notifications = await DatabaseService.FetchNotificationsFromDB();
    res.status(200).json(notifications);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

app.post('/api/insertnotification', async (req, res) => {
  const { text } = req.body;

  try {
    await DatabaseService.InsertNotificationToDB(text);
    res.status(200).json({ message: 'Notification saved' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save notification' });
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


//to get plants
app.get('/api/plants', async (req,res) => {
  try{
    let plants = await DatabaseService.FetchPlantsfromDBtoFE();
    res.status(200).json(plants);
  }
  catch(err){
    console.error(err);
    res.status(500).json({error: "Error in fetching"});
  }
});

app.post('/api/user/:username/:password', async (req,res) => {
  const { username, password } = req.params;
  try{
    let users = await DatabaseService.FetchUserfromDBtoFE(username, password);
    if (users == null){
      res.status(500).json({error: "Error. Invalid credentials"});
    }
    else{
       res.status(200).json({Message : "Login Successful."});
    }
  }
  catch(err){
    console.error(err);
    res.status(500).json({error: "Error. Invalid credentials"});
  }
});

app.put('/api/updateuser/:username/:password', async (req, res) => {
    const { username, password } = req.params;
  try {
    const user = await DatabaseService.UpdateUserToDB(username, password);
    res.status(200).json({ message : "Password Updated"})
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update user' });
  }
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
let wateringJob = {jobType: "watering", name: "MyWateringJob", positions: new Array({x: 100, y: 100,z: -50}), "ml": 500}
 //let plants =  await DatabaseService.FetchPlantsfromDBtoFE();
 //console.log(plants);
backend.scheduleManager.appendScheduledJob(wateringJob);
backend.checkForNextJob();