import express from 'express';
import cors from 'cors';
import multer from 'multer';

const app = express();
const port = 8000;
const upload = multer();

app.use(cors());
app.use(express.json());

app.post('/initialize', (req, res) => {
  console.log('Received initialize request');
  res.json({ message: "Tracker initialized successfully" });
});

app.post('/capture-gaze', upload.single('image'), (req, res) => {
  console.log('Received capture-gaze request');
  res.json({ x: Math.random(), y: Math.random() });
});

app.post('/translate-gaze', (req, res) => {
  console.log('Received translate-gaze request');
  const keys = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  res.json({ key: keys[Math.floor(Math.random() * keys.length)] });
});

app.post('/calibrate', (req, res) => {
  console.log('Received calibrate request');
  res.json({ message: "Calibration completed successfully" });
});

app.post('/update-model', (req, res) => {
  console.log('Received update-model request');
  res.json({ message: "Model updated successfully" });
});

app.post('/categorize-image', upload.single('image'), (req, res) => {
  console.log('Received categorize-image request');
  const categories = ['happy', 'sad', 'question'];
  const randomCategory = categories[Math.floor(Math.random() * categories.length)];
  res.json({ category: randomCategory });
});

app.listen(port, () => {
  console.log(`Mock API server running at http://localhost:${port}`);
});