import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import DatabaseService from './databaseservice.js';
import { initalizeBackend } from './backend/backend.js';

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

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

app.get('/api/status', (req, res) => {
  if (backend_initialized) {
    res.status(200).json({status: backend.statusManager.status});
  }
  else {
    res.status(200).json({status: "Initializing"});
  }
});
const backend = await initalizeBackend();
backend_initialized = true;
