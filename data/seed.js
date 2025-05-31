require('dotenv').config();
const mongoose = require('mongoose');
const Event = require('../models/event');
const sampleEvents = require('./events.json');

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);

  // Remove any old data
  await Event.deleteMany({});

  // Add eventId sequentially
  sampleEvents.forEach((ev, idx) => {
    ev.eventId = idx + 1; // starts at 1
  });
  
  await Event.insertMany(sampleEvents);
  console.log(`Inserted ${sampleEvents.length} events`);
  mongoose.disconnect();
}

seed();
