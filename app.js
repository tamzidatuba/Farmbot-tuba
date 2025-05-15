import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dbservice from './Services/databaseservice.js';

const app = express();
const PORT = 3000;

// Setup __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files (CSS, JS) from root
app.use(express.static(__dirname));

// Serve index.html on root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
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