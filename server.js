// server.js

require('dotenv').config();           // Load .env variables

const express  = require('express');
const mongoose = require('mongoose');
const cors     = require('cors');     // CORS middleware
const path = require('path');
const eventRoutes = require('./routes/events');
const recomsRoutes = require('./routes/recoms');
const favoriteRoutes = require('./routes/favorites');

const usersRoutes = require('./routes/users');

const app       = express();
const PORT      = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;


// --- Middleware ---
app.use(cors());           // Enable CORS for all origins (customize in production)
app.use(express.json());   // Parse JSON bodies

// --- Health Check or Root Route ---
app.get('/healthz', (req, res) => {
  res.send('Hello Tickest');
});

// --- Event Routes ---
app.use('/api/events', eventRoutes);

// --- Recommendations Routes ---
app.use('/api/recoms', recomsRoutes);

// --- User Routes ---
app.use('/api/users', usersRoutes);

// --- Favorite Route ---
app.use('/api/favorites', favoriteRoutes);

// --- Images Route ---
app.use('/images', express.static(path.join(__dirname, 'images')));

// --- MongoDB Connection & Server Startup ---
mongoose.set('strictQuery', false);
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });
