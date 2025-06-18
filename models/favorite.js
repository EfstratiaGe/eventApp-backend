const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema({
  userId: {
    type: String, // or ObjectId if you use a real User model
    required: true
  },
  eventId: {
    type: Number,
    required: true
  }
}, { timestamps: true });

// Ensure each user can favorite an event only once
favoriteSchema.index({ userId: 1, eventId: 1 }, { unique: true });

module.exports = mongoose.model('Favorite', favoriteSchema);
