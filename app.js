import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import DatabaseService from './backend/databaseservice.js';
import { Backend } from './backend/backend.js';
import createJobsRouter from './routes/jobs.js';
import TokenManager from "./backend/tokenManager.js";


const app = express();
const PORT = 3000;

// Setup __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const backend = new Backend();

// Serve static files (CSS, JS) from root
app.use(express.static(path.join(__dirname, 'frontend//')));
app.use(express.json());


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
    res.status(500).json({ error: "Error in fetching plants from the database." });
  }
});

app.post('/api/questions', async (req, res) => {
  const { question, answer } = req.body
  try {
    await DatabaseService.InsertQuestionsIntoDB(question, answer);
    res.status(200).json({ message: "Thank you! Your question has been submitted." });
  }
  catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to save question to Database." });
  }
});

app.get('/api/getquestions', async (req, res) => {
  try {
    let getquestions = await DatabaseService.FetchAlltheQuestionsFromDB();
    res.status(200).json(getquestions);
  }
  catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch questions and answers from the database." });
  }
});

app.get('/api/getsinglequestion', async (req, res) => {
  const { question } = req.body;
  try {
    let getsinglequestion = await DatabaseService.FetchQuestionsFromDBbyQuestion(question);
    res.status(200).json(getsinglequestion);
  }
  catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch question and answer from database." });
  }
});

app.put('/api/putquestions', async (req, res) => {
  const { answer, question } = req.body;
  try {
    let insert_answer = await DatabaseService.InsertAnswerIntoDB(question, answer);
    res.status(200).json(insert_answer);
  }
  catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to insert answer to database." });
  }
});


// delete plant
app.delete('/api/plant', async (req, res) => {
  const { token, xcoordinate, ycoordinate } = req.body;
  if (!TokenManager.validateToken(token)) {
    res.status(500).json({ error: "You dont have permission to do that" });
    return
  }
  try {
    await DatabaseService.DeletePlantFromDB(xcoordinate, ycoordinate);
    for (const plant in backend.plants) {
      if (backend.plants[plant].xcoordinate == xcoordinate && backend.plants[plant].ycoordinate == ycoordinate) {

        // remove job from queue
        backend.plants.splice(plant, 1);
      }
    }
    res.status(200).json({ message: 'The Plant has been deleted from the database.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete plant from database.' });
  }
});

app.put('/api/updateuser/:username/:password', async (req, res) => {
  const { username, password } = req.params;
  const { token } = req.body
  if (!TokenManager.validateToken(token)) {
    res.status(500).json({ error: "You dont have permission to do that" });
    return
  }
  try {
    const user = await DatabaseService.UpdateUserToDB(username, password);
    res.status(200).json({ message: "The Password has been Updated." })
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update user in Database.' });
  }
});

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    let users = await DatabaseService.FetchUserfromDB(username, password);
    if (users == null) {
      res.status(500).json({ error: "Error. Invalid credentials for login." });
    }
    else {
      res.status(200).json({ Message: "Login Successful.", token: TokenManager.generateAndReturnToken() });
    }
  }
  catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error. Invalid credentials for login." });
  }
});

app.post('/api/logout', async (req, res) => {
  const { token } = req.body;
  TokenManager.removeToken(token);
});

app.get('/api/frontendData', (req, res) => {
  res.status(200).json(backend.generateFrontendData());
});

app.post('/api/demo/watering', async (req, res) => {
  const { payload, token } = req.body
  const job_data = { jobType: DatabaseService.JobType.WATERING, job: payload, demo: true }
  console.log(payload.plantstobewatered[0].plant);
  // append demo to schedule_manager
  if (!backend.demo_job_queued && backend.scheduleManager.appendDemoJob(job_data)) {
    backend.appendNotification(TokenManager.getUser(token) + " queued", "Watering-Demo");
    backend.checkForNextJob();
    res.status(200).json({ message: "A watering Demo has been queued." });
  } else {
    res.status(500).json({ error: 'A Demo is already queued.' });
  }
});

app.post('/api/demo/seeding', async (req, res) => {
  const { payload, token } = req.body
  const job_data = { jobType: DatabaseService.JobType.SEEDING, job: payload, demo: true }
  // append demo to schedule_manager
  if (!backend.demo_job_queued && backend.scheduleManager.appendDemoJob(job_data)) {
    backend.checkForNextJob();
    backend.appendNotification(TokenManager.getUser(token) + " queued", "Seeding-Demo");
    res.status(200).json({ message: "A seeding demo has been queued." })
  } else {
    res.status(500).json({ error: 'A Demo is already queued.' });
  }
});