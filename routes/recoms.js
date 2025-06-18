const express = require('express');
const router  = express.Router();
const Event   = require('../models/event');

router.post('/', async (req, res) => {
  try {

    const categories = req.body;
    const events = await Event.find({ category: { $in: categories }});

    res.send(events);

  } catch (error) {
    res.status(500).json({ message: err.message });
  }
})

module.exports = router;