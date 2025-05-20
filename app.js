import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dbservice from './Services/databaseservice.js';
import { initalizeBackend } from './backend/backend.js';

const app = express();
const PORT = 3000;

// Setup __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let backend_initialized = false;

// Serve static files (CSS, JS) from root
app.use(express.static(path.join(__dirname, 'frontend//')));

// Serve index.html on root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend//index.html'));
});
// API endpoint
app.post('/api/seeding-job', async (req, res) => {
  const { x, y, plant, depth } = req.body;
  try {
    await dbservice.InsertSeedingJobToDB(x, y, plant, depth);
    res.status(200).json({ message: 'Job saved' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save job' });
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
