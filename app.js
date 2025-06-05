import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import DatabaseService from './databaseservice.js';
import { initalizeBackend, Backend} from './backend/backend.js';
import plantModel from './models/plant.model.js';
import createJobsRouter from './routes/jobs.js';


const app = express();
const PORT = 3000;

// Setup __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const backend = new Backend();
let backend_initialized = false;

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
    let plants = await DatabaseService.FetchPlantsfromDBtoFE();
    res.status(200).json(plants);
  }
  catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error in fetching" });
  }});

app.get('/api/notifications', (req, res) => {
  if (backend_initialized) {
    res.status(200).json(backend.notification_history);
  }
  else {
    res.status(200).json(new Array());
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

app.get('/api/status', (req, res) => {
  if (backend_initialized) {
    res.status(200).json({ status: backend.statusManager.status });
  }
  else {
    res.status(200).json({ status: "Offline" });
  }
});

app.get('/api/frontendData', (req, res) => {
  if (backend_initialized) {
    res.status(200).json(backend.generateFrontendData());
  }
  else {
    res.status(201).json({
      "status": "Offline",
      "notifications": [],
      "executionPipeline": []
    });
  }
});

await initalizeBackend(backend);
backend_initialized = true;

// TODO delete
let wateringJob = { jobType: "watering", name: "MyWateringJob", positions: new Array({ x: 100, y: 100, z: -50 }), "ml": 500 }
//let plants =  await DatabaseService.FetchPlantsfromDBtoFE();
//console.log(plants);

backend.scheduleManager.appendScheduledJob(wateringJob);
backend.checkForNextJob();