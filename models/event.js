const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  date: {
    type: Date,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: [
    'concert',
    'theatre',
    'sports',
    'festival',
    'conference',
    'comedy',
    'workshop',
    'exhibition',
    'movie',
    'other'
  ]
  },
  location: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  price: {
    type: Number,
    required: true
  },
  availableTickets: {
    type: Number,
    required: true
  },
  image: {
    type: String,
    required: false,
  }
}, { timestamps: true });

const Event = mongoose.model('Event', eventSchema);
module.exports = Event;
