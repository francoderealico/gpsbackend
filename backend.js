const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
const corsOptions = {
  origin: 'http://localhost:3001', // Your frontend URL
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// MongoDB Connection
// para docker mongoose.connect('mongodb://mongodb:27017/gps_tracker');
mongoose.connect('mongodb://localhost:27017/gps_tracker', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Define Schema and Model
const locationSchema = new mongoose.Schema({
  lat: Number,
  lon: Number,
  timestamp: { type: Date, default: Date.now },
  track: String,
});

const Location = mongoose.model('Location', locationSchema);

// API Endpoint to Receive Data
app.post('/api/location', async (req, res) => {
  const { lat,lon,track} = req.body;
  const location = new Location({ lat, lon ,track});
  await location.save();
  res.status(200).send('Location saved');
});
// Add this to your backend server.js
app.get('/api/location', async (req, res) => {
  try {
    const locations = await Location.find().sort({ timestamp: -1 });
    res.json(locations);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// Start Server
const PORT = 3000;
app.listen(PORT,'0.0.0.0', () => {
  console.log(`Server running on http://nosedonde: ${PORT}`);
});
