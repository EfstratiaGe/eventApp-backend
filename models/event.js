const mongoose = require('mongoose');

// Allowed event categories
const ALLOWED_CATEGORIES = [
  'concert', 'theatre', 'sports', 'festival',
  'conference', 'comedy', 'workshop',
  'exhibition', 'movie', 'other'
];

// Schema for individual event dates and locations
const scheduleSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true
  },
  location: {
    type: String,
    required: true,
    trim: true
  }
}, { _id: false });

// Schema for ticket types (e.g., General, VIP)
const ticketTypeSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  availableTickets: {
    type: Number,
    required: true,
    min: 0
  }
}, { _id: false });

// Main Event schema
const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  category: {
    type: String,
    required: true,
    enum: ALLOWED_CATEGORIES
  },
  image: {
    type: String,
    default: '',
    required: false
  },

  // Event dates and locations
  schedule: {
    type: [scheduleSchema],
    required: true,
    validate: v => v.length > 0           //returns true if there’s at least one element in the v array value
  },

  // Ticket options for this event
  ticketTypes: {
    type: [ticketTypeSchema],
    required: true,
    validate: v => v.length > 0           //returns true if there’s at least one element in the v array value
  },

  // Organizer reference for future use
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  // User-defined tags for search and categorization
  tags: {
    type: [String],
    default: []
  }
}, { timestamps: true });

// Text index on title, description, and tags for optimized search
eventSchema.index({ title: 'text', description: 'text', tags: 'text' });

const Event = mongoose.model('Event', eventSchema);
module.exports = Event;
