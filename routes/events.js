// routes/events.js
const express = require('express');
const router = express.Router();
const Event = require('../models/event');

const ALLOWED_CATEGORIES = [
  'concert','theatre','sports','festival',
  'conference','comedy','workshop',
  'exhibition','movie','other'
];

// CREATE a new event
router.post('/', async (req, res) => {
  try {
    const event = new Event(req.body);
    await event.save();
    res.status(201).json(event);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// GET all events with filtering, sorting, and pagination
router.get('/', async (req, res) => {
  try {
    const {
      search,
      title,
      city,
      category,
      dateFrom,
      dateTo,
      minPrice,
      maxPrice,
      availableOnly,
      upcoming,
      sortBy,
      sortOrder = 'asc',
      page = 1,
      limit = 20
    } = req.query;

    const filter = {};

    // 1. Free-text search (title OR description)
    if (search) {
      const regex = new RegExp(search, 'i');
      filter.$or = [
        { title:       { $regex: regex } },
        { description: { $regex: regex } }
      ];
    }

    // 2. Title-only filter
    if (title) {
      filter.title = { $regex: new RegExp(title, 'i') };
    }

    // 3. City/Location filter
    if (city) {
      filter.location = { $regex: new RegExp(city, 'i') };
    }

    // 4. Category filter
    if (category && ALLOWED_CATEGORIES.includes(category)) {
      filter.category = category;
    }

    // 5. Custom date range
    if (dateFrom || dateTo) {
      filter.date = {};
      if (dateFrom) filter.date.$gte = new Date(dateFrom);
      if (dateTo)   filter.date.$lte = new Date(dateTo);
    }

    // 6. Default “upcoming” filter (only future events)
    if (upcoming === undefined || upcoming === 'true') {
      filter.date = filter.date || {};
      filter.date.$gte = filter.date.$gte || new Date();
    }

    // 7. Price range filter
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }

    // 8. Availability filter
    if (availableOnly === 'true') {
      filter.availableTickets = { $gt: 0 };
    }

    // Build the query
    let query = Event.find(filter);

    // 9. Sorting
    if (sortBy) {
      const order = sortOrder === 'desc' ? -1 : 1;
      query = query.sort({ [sortBy]: order });
    }

    // 10. Pagination
    const pageNum  = parseInt(page);
    const pageSize = parseInt(limit);
    query = query.skip((pageNum - 1) * pageSize).limit(pageSize);

    // Execute query + count total for metadata
    const [events, total] = await Promise.all([
      query.exec(),
      Event.countDocuments(filter)
    ]);

    // Respond with data + pagination info
    res.json({
      page:         pageNum,
      totalPages:   Math.ceil(total / pageSize),
      totalResults: total,
      events
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching events.' });
  }
});

// GET a single event by ID
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// UPDATE an event
router.put('/:id', async (req, res) => {
  try {
    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updatedEvent);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE an event
router.delete('/:id', async (req, res) => {
  try {
    await Event.findByIdAndDelete(req.params.id);
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
