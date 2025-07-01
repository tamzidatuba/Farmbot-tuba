import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import DatabaseService from './databaseservice.js';
import { initalizeBackend, Backend } from './backend/backend.js';
import createJobsRouter from './routes/jobs.js';
import TokenManager from "./backend/tokenManager.js";


const app = express();
const PORT = 3000;

// Setup __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const backend = new Backend();
let backend_init_promise = initalizeBackend(backend);

// Serve static files (CSS, JS) from root
app.use(express.static(path.join(__dirname, 'frontend//')));
app.use(express.json());


//testing the method return single job for execution
//let a = await DatabaseService.ReturnSingleJob('682d82fd6037708c0a882e2b');
//let a1 = await DatabaseService.ReturnSingleJob('683f08e030a1434241a9f615');
//console.log(a1);
//const sample = await DatabaseService.ReturnSingleJob('6847ee82456f873240345d03');
//console.log(sample);



app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

// Serve index.html on root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend//index.html'));
});

app.use('/api/jobs', createJobsRouter(backend));

//to get plants
app.get('/api/plants', async (req, res) => {
  try {
    let plants = await DatabaseService.FetchPlantsfromDB();
    backend.plants = plants
    res.status(200).json(plants);
  }
  catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error in fetching" });
  }
});

app.post('/api/questions', async ( req, res) => {
  const { question, answer } = req.body
try {
    let questions = await DatabaseService.InsertQuestionsIntoDB(question, answer);
    res.status(200).json({message:"Thank you! Your question has been submitted."});
  }
  catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to save question." });
  }
});

app.get('/api/getquestions', async (req,res) => {
try{
  let getquestions = await DatabaseService.FetchAlltheQuestionsFromDB();
  res.status(200).json(getquestions);
}
catch(err)
{
  console.error(err);
  res.status(500).json({ error: "Failed to fetch questions."});
}
});

app.get('/api/getsinglequestion', async (req,res) => {
  const{ question } = req.body;
try{
  let getsinglequestion = await DatabaseService.FetchQuestionsFromDBbyQuestion(question);
  res.status(200).json(getsinglequestion);
}
catch(err)
{
  console.error(err);
  res.status(500).json({ error: "Failed to fetch question."});
}
});

// insert plant
app.post('/api/plants', async (req, res) => {
  const plants = req.body;
  try {
    await DatabaseService.InsertPlantsToDB(plants);
    for (let plant of plants) {
      backend.plants.push(plant)
    }
    res.status(200).json({ message: 'Plant saved' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save job' });
  }
});

app.put('/api/updateuser/:username/:password', async (req, res) => {
  const { username, password } = req.params;
  const { token } = req.body
  if (!TokenManager.validateToken(token)) {
    res.status(500).json({error: "You dont have permission to do that"});
    return
  }
  try {
    const user = await DatabaseService.UpdateUserToDB(username, password);
    res.status(200).json({ message: "Password Updated" })
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

app.post('/api/login', async (req,res) => {
  const { username, password } = req.body;
  try{
    let users = await DatabaseService.FetchUserfromDB(username, password);
    if (users == null){
      res.status(500).json({error: "Error. Invalid credentials"});
    }
    else {
      res.status(200).json({ Message: "Login Successful.", token: TokenManager.generateAndReturnToken() });
    }
  }
  catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error. Invalid credentials" });
  }
});

app.post('/api/logout', async (req,res) => {
  const { token } = req.body;
  TokenManager.removeToken(token);
});

app.get('/api/frontendData', (req, res) => {
  res.status(200).json(backend.generateFrontendData());
});

app.post('/api/demo/watering', async (req, res) => {
  const { payload, token } = req.body
  const job_data = {jobType: DatabaseService.JobType.WATERING, job: payload, demo: true}
  console.log(payload.plantstobewatered[0].plant);
  // append demo to schedule_manager
  if(!backend.demo_job_queued && backend.scheduleManager.appendDemoJob(job_data)) {
    backend.checkForNextJob();
    res.status(200).json({ message: "Queued watering demo" });
    backend.appendNotification(TokenManager.getUser(token) + " queued a Watering-Demo");
  } else {
    res.status(500).json({ error: 'Watering-Demo is already queued' });
  }
});

app.post('/api/demo/seeding', async (req, res) => {
  const { payload, token } = req.body
  const job_data = {jobType: DatabaseService.JobType.SEEDING, job: payload, demo: true}
  // append demo to schedule_manager
  if(!backend.demo_job_queued && backend.scheduleManager.appendDemoJob(job_data)) {
    backend.checkForNextJob();
    backend.appendNotification(TokenManager.getUser(token) + " queued a Seeding-Demo");
    res.status(200).json({ message: "Queued seeding demo" })
  } else {
    res.status(500).json({ error: 'Seeding-Demo is already queued' });
  }
});

// Handle await backend init
await backend_init_promise;