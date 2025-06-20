const express = require('express');
const router  = express.Router();
const Event   = require('../models/event');

const DUMMY_USER_ID = 'guest123'; 

router.post('/', async (req, res) => {
  try {

    const categories = req.body;
    const events = await Event.find({ category: { $in: categories }}).lean();

    // Get favorite eventIds for the user
    const favorites = await Favorite.find({ userId: DUMMY_USER_ID });
    const favoriteEventIds = new Set(favorites.map(f => f.eventId));

    // Mark each event as favorited: true if in favorites
    const enrichedEvents = events.map(event => ({
      ...event,
      favorited: favoriteEventIds.has(event.eventId),
    }));

    res.send(enrichedEvents);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
})

module.exports = router;