const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const mqtt = require('mqtt');

const app = express();
//app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
const corsOptions = {
  origin: 'http://localhost:3001', // Your frontend URL
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
const client = mqtt.connect('tcp://test.mosquitto.org:1883');

// MongoDB Connection
// para docker mongoose.connect('mongodb://mongodb:27017/gps_tracker');
//mongoose.connect('mongodb://localhost:27017/gps_tracker', {
 // useNewUrlParser: true,
  //useUnifiedTopology: true,
//});
const uri = "mongodb+srv://francoderealico:AKUWaaP01VPOyxr7@cluster0.ynqojo9.mongodb.net/gps_tracker?retryWrites=true&w=majority&appName=Cluster0";
const clientOptions = { serverApi: { version: '1', strict: true, deprecationErrors: true } };
mongoose.connect(uri,clientOptions)
.then(()=>{
  console.log("conectado perfecto")
})
.catch(error =>{
  console.error(error)
})

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
// Add this to your backend server.js
app.get('/api/location', async (req, res) => {
  try {
    const locations = await Location.find().sort({ timestamp: -1 });
    res.json(locations);
  } catch (err) {
    res.status(500).send('Server error');
  }
});
app.get('/api/borrartodo', async (req, res) => {
  try {
    const db = mongoose.connection.db;
    await db.dropDatabase();

    console.log(`Base de datos gps_tracker eliminada exitosamente.`);
    
  } catch (err) {
    res.status(500).send('Server error');
  }
});
        

// Start Server
const PORT = 3000;
app.listen(PORT,'0.0.0.0', () => {
  console.log(`Server running on http://nosedonde: ${PORT}`);
});

client.on('connect', () => {
  console.log('Connection established');
  client.subscribe('gpslatlon/mobile');
});

client.on('message', async (topic, message) => {
  console.log(`Message received on ${topic}: ${message.toString()}`);
  const pirucho =JSON.parse(message);
  const location = new Location(pirucho);
  await location.save();
  console.log(pirucho.lat);
  console.log(pirucho.lon);
  console.log(pirucho.track);
});