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

// Handle await backend init
await backend_init_promise;