require('dotenv').config();
const mongoose = require('mongoose');
const Event = require('../models/event');
const sampleEvents = require('./events.json');

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  await Event.deleteMany({});
  await Event.insertMany(sampleEvents);
  console.log(`Inserted ${sampleEvents.length} events`);
  mongoose.disconnect();
}

seed();
