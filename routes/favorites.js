const express = require('express');
const router = express.Router();
const Event = require('../models/event');
const Favorite = require('../models/favorite');

// TEMP DUMMY USER (until login system is built)
const DUMMY_USER_ID = 'guest123';


// GET /api/favorites — Get all favorite events for the dummy user
router.get('/', async (req, res) => {
  try {
    const favs = await Favorite.find({ userId: DUMMY_USER_ID });
    const eventIds = favs.map(f => f.eventId);

    const events = await Event.find({ eventId: { $in: eventIds } }).lean();

    // Tag them as favorited = true (frontend expects this)
    events.forEach(e => {
      e.favorited = true;
    });

    res.json(events);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching favorites.' });
  }
});


// POST /api/favorites — Add a favorite
router.post('/', async (req, res) => {
  try {
    const { eventId } = req.body;
    if (!eventId) {
      return res.status(400).json({ message: 'Missing eventId' });
    }

    const existing = await Favorite.findOne({ userId: DUMMY_USER_ID, eventId });
    if (existing) {
      return res.status(409).json({ message: 'Already favorited' });
    }

    const favorite = new Favorite({ userId: DUMMY_USER_ID, eventId });
    await favorite.save();

    res.status(201).json({ message: 'Event favorited' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error saving favorite.' });
  }
});


// DELETE /api/favorites — Remove a favorite
router.delete('/', async (req, res) => {
  try {
    const { eventId } = req.body;
    if (!eventId) {
      return res.status(400).json({ message: 'Missing eventId' });
    }

    const deleted = await Favorite.findOneAndDelete({ userId: DUMMY_USER_ID, eventId });
    if (!deleted) {
      return res.status(404).json({ message: 'Favorite not found' });
    }

    res.json({ message: 'Favorite removed' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error deleting favorite.' });
  }
});

module.exports = router;
