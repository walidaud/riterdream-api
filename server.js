const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ Connected to MongoDB Atlas'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// --- SCHEMAS ---
const ChapterSchema = new mongoose.Schema({
  title: String,
  content: String
});

const CharacterSchema = new mongoose.Schema({
  name: String,
  description: String
});

const PlotPointSchema = new mongoose.Schema({
  title: String,
  description: String
});

const NoteSchema = new mongoose.Schema({
  title: String,
  content: String
});

const StorySchema = new mongoose.Schema({
  title: String,
  chapters: [ChapterSchema],
  characters: [CharacterSchema],
  plotPoints: [PlotPointSchema],
  notes: [NoteSchema],
  themes: [String]
});

const Story = mongoose.model('Story', StorySchema);

// --- ROUTES ---

// Get all stories
app.get('/api/stories', async (req, res) => {
  const stories = await Story.find();
  res.json(stories);
});

// Get one story by ID
app.get('/api/stories/:id', async (req, res) => {
  const story = await Story.findById(req.params.id);
  res.json(story);
});

// Create a new story
app.post('/api/stories', async (req, res) => {
  const story = new Story(req.body);
  await story.save();
  res.status(201).json(story);
});

// Update a story by ID
app.put('/api/stories/:id', async (req, res) => {
  const updated = await Story.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updated);
});

// Delete a story by ID
app.delete('/api/stories/:id', async (req, res) => {
  await Story.findByIdAndDelete(req.params.id);
  res.json({ message: 'Story deleted' });
});

// Emotion Detection Route
app.post('/api/analyze-emotion', async (req, res) => {
  const { text } = req.body;

  try {
    const response = await fetch('https://api-inference.huggingface.co/models/j-hartmann/emotion-english-distilroberta-base', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY}`  // ✅ SAFER
      },
      body: JSON.stringify({ inputs: text })
    });

    const result = await response.json();
    const topEmotion = result[0]?.[0]?.label?.toLowerCase();
    console.log('Detected Emotion:', topEmotion);
    res.json({ emotion: topEmotion || 'hopeful' });

  } catch (err) {
    console.error('Emotion detection failed:', err);
    res.status(500).json({ emotion: 'hopeful' });
  }
});

// --- START SERVER ---
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});




