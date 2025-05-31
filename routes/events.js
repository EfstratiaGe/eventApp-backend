// routes/events.js
const express = require('express');
const router = express.Router();
const Event = require('../models/event');

const ALLOWED_CATEGORIES = [
  'concert','theatre','sports','festival',
  'conference','comedy','workshop',
  'exhibition','movie','other'
];

// POST /api/events — CREATE a new event
router.post('/', async (req, res) => {
  try {
    // 1. Find current maximum eventId
    //    Sort by eventId descending, limit 1 to get the highest
    const latestEvent = await Event.findOne({})
      .sort('-eventId')
      .select('eventId')
      .lean();

    // 2. Compute the next eventId
    const maxId = latestEvent ? latestEvent.eventId : 0;
    const nextId = maxId + 1;

    // 3. Merge eventId into the request body
    const newData = {
      ...req.body,
      eventId: nextId
    };

    // 4. Create & save the new Event
    const event = new Event(newData);
    await event.save();

    res.status(201).json(event);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// GET /api/events — List with filters, sorting & pagination
router.get('/', async (req, res) => {
  try {
    const {
      search,
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

    // 1. Full-text on title/description/tags
    if (search) {
      filter.$text = { $search: search };
    }

    // 2. City filter on any schedule entry
    if (city) {
      filter.schedule = {
        $elemMatch: { location: { $regex: new RegExp(city, 'i') } }
      };
    }

    // 3. Category filter
    if (category && ALLOWED_CATEGORIES.includes(category)) {
      filter.category = category;
    }

    // 4. Date range: match any schedule date in range
    if (dateFrom || dateTo || upcoming !== 'false') {
      filter.schedule = filter.schedule || {};
      filter.schedule.$elemMatch = filter.schedule.$elemMatch || {};
      if (upcoming !== 'false') {
        filter.schedule.$elemMatch.date = { $gte: new Date() };
      }
      if (dateFrom) {
        filter.schedule.$elemMatch.date = filter.schedule.$elemMatch.date || {};
        filter.schedule.$elemMatch.date.$gte = new Date(dateFrom);
      }
      if (dateTo) {
        filter.schedule.$elemMatch.date = filter.schedule.$elemMatch.date || {};
        filter.schedule.$elemMatch.date.$lte = new Date(dateTo);
      }
    }

    // 5. Price range on ticketTypes
    if (minPrice || maxPrice) {
      filter.ticketTypes = {
        $elemMatch: {}
      };
      if (minPrice) filter.ticketTypes.$elemMatch.price = { $gte: parseFloat(minPrice) };
      if (maxPrice) {
        filter.ticketTypes.$elemMatch.price = filter.ticketTypes.$elemMatch.price || {};
        filter.ticketTypes.$elemMatch.price.$lte = parseFloat(maxPrice);
      }
    }

    // 6. Availability: any ticketType with availableTickets>0
    if (availableOnly === 'true') {
      filter.ticketTypes = filter.ticketTypes || { $elemMatch: {} };
      filter.ticketTypes.$elemMatch.availableTickets = { $gt: 0 };
    }

    // Build the Mongoose query
    let query = Event.find(filter);

    // Sorting
    if (sortBy) {
      const order = sortOrder === 'desc' ? -1 : 1;
      query = query.sort({ [sortBy]: order });
    }

    // Pagination
    const skip = (page - 1) * limit;
    query = query.skip(skip).limit(parseInt(limit));

    // Execute query + count total for metadata
    const [events, total] = await Promise.all([
      query.exec(),
      Event.countDocuments(filter)
    ]);

    // Respond with data + pagination info
    res.json({
      page:         parseInt(page),
      totalPages:   Math.ceil(total / limit),
      totalResults: total,
      events
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching events.' });
  }
});

// GET /api/events/:id — Single event by ID
router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid eventId' });
    }

    const event = await Event.findOne({ eventId: id }).lean();
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json(event);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/events/:id — UPDATE an event
router.put('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid eventId' });
    }

    const updates = req.body;
    const updatedEvent = await Event.findOneAndUpdate(
      { eventId: id },
      updates,
      { new: true, runValidators: true }
    ).lean();

    if (!updatedEvent) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json(updatedEvent);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message });
  }
});

// DELETE /api/events/:id — Remove event
router.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid eventId' });
    }

    const deletedEvent = await Event.findOneAndDelete({ eventId: id });
    if (!deletedEvent) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json({ message: 'Event deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/events/:id/ticketTypes/:index — Update one ticket type
router.patch('/:id/ticketTypes/:index', async (req, res) => {
  try {
    const id    = parseInt(req.params.id, 10);
    const index = parseInt(req.params.index, 10);

    if (isNaN(id) || isNaN(index)) {
      return res.status(400).json({ message: 'Invalid eventId or index' });
    }

    // 1. Find the event by eventId
    const event = await Event.findOne({ eventId: id });
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // 2. Validate index boundaries
    if (index < 0 || index >= event.ticketTypes.length) {
      return res.status(400).json({ message: 'Invalid ticket type index' });
    }

    // 3. Apply updates to the specific ticket subdocument
    Object.assign(event.ticketTypes[index], req.body);

    // 4. Save the parent document
    await event.save();

    res.json(event);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message });
  }
});

// PATCH /api/events/:id/schedule/:index — Update one schedule entry
router.patch('/:id/schedule/:index', async (req, res) => {
  try {
    const id    = parseInt(req.params.id, 10);
    const index = parseInt(req.params.index, 10);

    if (isNaN(id) || isNaN(index)) {
      return res.status(400).json({ message: 'Invalid eventId or index' });
    }

    // 1. Find the event by eventId
    const event = await Event.findOne({ eventId: id });
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // 2. Validate index boundaries
    if (index < 0 || index >= event.schedule.length) {
      return res.status(400).json({ message: 'Invalid schedule index' });
    }

    // 3. If the client provided a date, convert it to a Date object
    if (req.body.date) {
      req.body.date = new Date(req.body.date);
    }

    // 4. Apply updates to the specific schedule subdocument
    Object.assign(event.schedule[index], req.body);

    // 5. Save the parent document
    await event.save();

    res.json(event);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
