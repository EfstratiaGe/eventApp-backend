const express = require('express');
const router = express.Router();
const Favorite = require('../models/favorite');
const Event = require('../models/event');

// TEMP DUMMY USER (until login system is built)
const DUMMY_USER_ID = 'guest123';

// GET /api/favorites/:userId — all favorite events for a user
router.get('/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const favs = await Favorite.find({ userId });
    const eventIds = favs.map(f => f.eventId);

    const events = await Event.find({ eventId: { $in: eventIds } }).lean();

    events.forEach(e => {
      e.favorited = true;
    });

    res.json(events);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching favorites.' });
  }
});

// POST /api/favorites — add to favorites
router.post('/', async (req, res) => {
  try {
    const { userId, eventId } = req.body;

    const fav = new Favorite({ userId, eventId });
    await fav.save();
    res.status(201).json(fav);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Already favorited' });
    }
    res.status(500).json({ message: 'Error saving favorite.' });
  }
});

// DELETE /api/favorites — remove from favorites
router.delete('/', async (req, res) => {
  try {
    const { userId, eventId } = req.body;
    await Favorite.deleteOne({ userId, eventId });
    res.json({ message: 'Favorite removed' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting favorite.' });
  }
});

module.exports = router;
