// server.js
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const DATA_FILE = './stories.json';

// Load or initialize story data
let stories = [];
if (fs.existsSync(DATA_FILE)) {
  stories = JSON.parse(fs.readFileSync(DATA_FILE));
} else {
  fs.writeFileSync(DATA_FILE, JSON.stringify([]));
}

// GET all stories
app.get('/api/stories', (req, res) => {
  res.json(stories);
});

// POST new or updated stories
app.post('/api/stories', (req, res) => {
  stories = req.body;
  fs.writeFileSync(DATA_FILE, JSON.stringify(stories, null, 2));
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
