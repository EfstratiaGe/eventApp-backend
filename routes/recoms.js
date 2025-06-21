const express = require('express');
const router  = express.Router();
const Event   = require('../models/event');
const Favorite = require('../models/favorite');

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

    // map over events array
    const formattedEvents = enrichedEvents.map(event => {
      // map over schedule array inside each event
      const formattedSchedule = event.schedule.map(s => ({
        date: new Date(s.date).toISOString().slice(0, 10),
        location: s.location
      }));

      // return new event object with formatted schedule
      return {
        ...event,   // convert mongoose doc to plain object
        schedule: formattedSchedule
      };
    });

    res.send(formattedEvents);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
})

module.exports = router;