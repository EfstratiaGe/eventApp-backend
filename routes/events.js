// routes/events.js
const express = require('express');
const router  = express.Router();
const Event   = require('../models/event');

const ALLOWED_CATEGORIES = [
  'concert','theatre','sports','festival',
  'conference','comedy','workshop',
  'exhibition','movie','other'
];

// POST /api/events — CREATE a new event (auto‐increment eventId)
router.post('/', async (req, res) => {
  try {
    // 1. Find current max eventId
    const latestEvent = await Event.findOne({})
      .sort('-eventId')
      .select('eventId')
      .lean();

    // 2. Compute nextId
    const maxId  = latestEvent ? latestEvent.eventId : 0;
    const nextId = maxId + 1;

    // 3. Merge eventId into request body
    const newData = { ...req.body, eventId: nextId };

    // 4. Create & save
    const eventDoc = new Event(newData);
    await eventDoc.save();

    // 5. Convert to plain object
    const event = eventDoc.toObject();

    // 6. Re‐format every schedule.date → "YYYY-MM-DD"
    event.schedule = event.schedule.map(s => ({
      date: s.date.toISOString().slice(0, 10),
      location: s.location
    }));

    // 7. Send back the formatted event
    return res.status(201).json(event);
  } catch (error) {
    return res.status(400).json({ message: error.message });
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
      if (minPrice) {
        filter.ticketTypes.$elemMatch.price = { $gte: parseFloat(minPrice) };
      }
      if (maxPrice) {
        filter.ticketTypes.$elemMatch.price = filter.ticketTypes.$elemMatch.price || {};
        filter.ticketTypes.$elemMatch.price.$lte = parseFloat(maxPrice);
      }
    }

    // 6. Availability: any ticketType with availableTickets > 0
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
    const [eventsRaw, total] = await Promise.all([
      query.exec(),
      Event.countDocuments(filter)
    ]);

    // Format each schedule.date to YYYY-MM-DD, leave organizer/text as is
    const events = eventsRaw.map(evt => {
      const e = evt.toObject();

      e.schedule = e.schedule.map(s => ({
        date: s.date.toISOString().slice(0, 10),
        location: s.location
      }));

      return e;
    });

    // Return only { events }
    res.send({ events });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error fetching events.' });
  }
});

// GET /api/events/:id — Single event by eventId
router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid eventId' });
    }

    const e = await Event.findOne({ eventId: id }).lean();
    if (!e) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Format schedule dates to YYYY-MM-DD
    e.schedule = e.schedule.map(s => ({
      date: s.date.toISOString().slice(0, 10),
      location: s.location
    }));

    return res.json(e);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message });
  }
});

// PUT /api/events/:id — UPDATE an event by eventId
router.put('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid eventId' });
    }

    // Perform the update and return the new document (as a plain JS object)
    const updated = await Event.findOneAndUpdate(
      { eventId: id },
      req.body,
      { new: true, runValidators: true }
    ).lean();

    if (!updated) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Re‐format schedule dates before sending
    updated.schedule = updated.schedule.map(s => ({
      date: s.date.toISOString().slice(0, 10),
      location: s.location
    }));

    return res.json(updated);
  } catch (err) {
    console.error(err);
    return res.status(400).json({ message: err.message });
  }
});


// DELETE /api/events/:id — Remove event by eventId
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

    return res.json({ message: 'Event deleted successfully' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message });
  }
});

// PATCH /api/events/:id/ticketTypes/:index — Update one ticket type by eventId
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

    // 2. Validate ticketTypes index
    if (index < 0 || index >= event.ticketTypes.length) {
      return res.status(400).json({ message: 'Invalid ticket type index' });
    }

    // 3. Apply updates to that ticketTypes subdocument
    Object.assign(event.ticketTypes[index], req.body);

    // 4. Save the parent document
    await event.save();

    // 5. Convert to plain JS object for formatting
    const e = event.toObject();

    // 6. Re‐format schedule dates
    e.schedule = e.schedule.map(s => ({
      date: s.date.toISOString().slice(0, 10),
      location: s.location
    }));

    // 7. Return the full event with formatted dates
    return res.json(e);
  } catch (err) {
    console.error(err);
    return res.status(400).json({ message: err.message });
  }
});


// PATCH /api/events/:id/schedule/:index — Update one schedule entry by eventId
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

    // 2. Validate schedule index
    if (index < 0 || index >= event.schedule.length) {
      return res.status(400).json({ message: 'Invalid schedule index' });
    }

    // 3. If a new date is provided, convert it to a Date object
    if (req.body.date) {
      req.body.date = new Date(req.body.date);
    }

    // 4. Apply updates to the specific schedule subdocument
    Object.assign(event.schedule[index], req.body);

    // 5. Save the parent document
    await event.save();

    // 6. Convert to plain JS object
    const e = event.toObject();

    // 7. Re‐format every schedule.date to "YYYY-MM-DD"
    e.schedule = e.schedule.map(s => ({
      date: s.date.toISOString().slice(0, 10),
      location: s.location
    }));

    // 8. Return the full event with formatted dates
    return res.json(e);
  } catch (err) {
    console.error(err);
    return res.status(400).json({ message: err.message });
  }
});


module.exports = router;
