# eventApp-backend

This repo is created for the purpose of the SKG.Code Bootcamp to develop and store the back-end code of an event booking app.

> **Public Repo Notice:**  
> This repository is public. **Do NOT** commit your real database URIs, API keys, or other secrets.  
> Make sure your `.env` file (containing `MONGO_URI`, etc.) is listed in `.gitignore`.

---

## 📦 Installation

1. **Clone** the repository:
   ```bash
   git clone https://github.com/EfstratiaGe/eventApp-backend.git
   cd eventApp-backend
   ```

2. **Install** dependencies:
   ```bash
   npm install
   ```

3. **Create** a `.env` file in the project root (and **do not** commit it):
   ```text
   # .env (example - keep this file secret!)
   MONGO_URI=<your-mongodb-connection-string>
   PORT=10000
   ```

4. **Seed** the database with sample data:
   ```bash
   npm run seed
   ```
   **Note:** Add this to your `package.json` scripts if not already present:
   ```json
   "scripts": {
     "seed": "node data/seed.js",
     "dev": "nodemon server.js"
   }
   ```

5. **Start** the development server (auto-restarts on changes):
   ```bash
   npm run dev
   ```

---

## 🌐 Base URL

```
http://localhost:<PORT>/
```

Default `PORT` is **10000** if not set in `.env`.

---

## 🔌 API Endpoints

### 1. Health Check

| Method | Path         | Description              | Response Example           |
| ------ | ------------ | ------------------------ | -------------------------- |
| GET    | `/healthz`   | Verify server is running | `"Hello Eve / Socialive"`  |

---

### 2. Events

> **Note:** Every event document now has both a MongoDB `_id` (ObjectId) and a numeric `eventId` (sequential).  
> - **`_id`** is for internal MongoDB use.  
> - **`eventId`** is an integer that starts at 1 and increments by 1 for each new event.  
> - When you **CREATE** a new event via `POST`, you do **not** supply `eventId`—it’s assigned automatically.

#### 2.a. List Events

```
GET /api/events
```

**Query Parameters** (all optional):

| Parameter               | Description                                                                                       |
| ----------------------- | ------------------------------------------------------------------------------------------------- |
| `search`                | Full-text search on `title`, `description`, or `tags`.                                            |
| `city`                  | Case-insensitive match on any `schedule.location`.                                                |
| `category`              | One of: `concert`, `theatre`, `sports`, `festival`, `conference`, `comedy`, `workshop`, etc.     |
| `dateFrom`              | ISO date; include events with at least one `schedule.date >= dateFrom`.                           |
| `dateTo`                | ISO date; include events with at least one `schedule.date <= dateTo`.                             |
| `availableOnly`         | `true`/`false`; if `true`, only events having any `ticketType.availableTickets > 0`.             |
| `upcoming`              | `true`/`false`; if `true` (default), only events that have a `schedule.date >= today`.           |
| `minPrice`, `maxPrice`  | Numeric range applied to any `ticketTypes.price`.                                                 |
| `sortBy`                | Field to sort by (e.g. `title`, `schedule.date`, `ticketTypes.price`, `eventId`).                 |
| `sortOrder`             | `asc` (default) or `desc`.                                                                        |
| `page`                  | Page number (1-based; default `1`).                                                               |
| `limit`                 | Items per page (default `20`).                                                                     |

**Success Response** _(200 OK)_:

```json
{
  "events": [
    {
      "_id": "64a9e2c1f9b2f63320fa1e7d",
      "eventId": 1,
      "title": "Giannis Haroulis Tour 2025",
      "description": "Giannis Haroulis presents his summer tour entitled 'Come to the Dance'.",
      "category": "concert",
      "image": "https://cdn.pixabay.com/photo/2023/01/07/21/02/concert-7705720_640.webp",
      "schedule": [
        { "date": "2025-06-15", "location": "Athens" },
        { "date": "2025-06-20", "location": "Thessaloniki" }
      ],
      "ticketTypes": [
        { "type": "General Admission", "price": 25, "availableTickets": 500 },
        { "type": "VIP", "price": 50, "availableTickets": 100 }
      ],
      "organizer": "223 Events ΙΚΕ",
      "tags": ["popular", "traditional", "live"],
      "createdAt": "2025-05-20T12:00:00.000Z",
      "updatedAt": "2025-05-20T12:00:00.000Z",
      "__v": 0
    }
    /* …more events… */
  ]
}
```

---

#### 2.b. Create Event

```
POST /api/events
```

- **Do NOT** include `eventId` or `_id` in your request body.  
- The server assigns `eventId = (current max eventId) + 1`.

**Request Body** _(application/json)_:

```json
{
  "title": "Sample Event",
  "description": "An example event created via API",
  "category": "other",
  "image": "https://example.com/sample.jpg",
  "schedule": [
    { "date": "2025-09-01", "location": "Volos" }
  ],
  "ticketTypes": [
    { "type": "General", "price": 20, "availableTickets": 100 }
  ],
  "tags": ["test", "api"]
}
```

**Success Response** _(201 Created)_:

```json
{
  "_id": "64b0f6a9f3c8f19933d7e1a2",
  "eventId": 11,
  "title": "Sample Event",
  "description": "An example event created via API",
  "category": "other",
  "image": "https://example.com/sample.webp",
  "schedule": [
    { "date": "2025-09-01", "location": "Volos" }
  ],
  "ticketTypes": [
    { "type": "General", "price": 20, "availableTickets": 100 }
  ],
  "organizer": "Some Organizer Name",
  "tags": ["test", "api"],
  "createdAt": "2025-05-31T11:00:00.000Z",
  "updatedAt": "2025-05-31T11:00:00.000Z",
  "__v": 0
}
```

---

#### 2.c. Get Single Event

```
GET /api/events/:eventId
```

- `:eventId` — Numeric `eventId` (not Mongo `_id`).

**Example URL**:
```
GET https://eventapp-backend-c8xe.onrender.com/api/events/1
```

**Success Response** _(200 OK)_:

```json
{
  "_id": "64a9e2c1f9b2f63320fa1e7d",
  "eventId": 1,
  "title": "Giannis Haroulis Tour 2025",
  "description": "Giannis Haroulis presents his summer tour entitled 'Come to the Dance'.",
  "category": "concert",
  "image": "https://cdn.pixabay.com/photo/2023/01/07/21/02/concert-7705720_640.webp",
  "schedule": [
    { "date": "2025-06-15", "location": "Athens" },
    { "date": "2025-06-20", "location": "Thessaloniki" }
  ],
  "ticketTypes": [
    { "type": "General Admission", "price": 25, "availableTickets": 500 },
    { "type": "VIP", "price": 50, "availableTickets": 100 }
  ],
  "organizer": "223 Events ΙΚΕ",
  "tags": ["popular", "traditional", "live"],
  "createdAt": "2025-05-20T12:00:00.000Z",
  "updatedAt": "2025-05-20T12:00:00.000Z",
  "__v": 0
}
```

---

#### 2.d. Update Entire Event

```
PUT /api/events/:eventId
```

- Replace the entire event document (except for `_id`, `eventId`).  
- You must send a full valid event body (including `schedule`, `ticketTypes`, etc.).  

**Example URL**:
```
PUT https://eventapp-backend-c8xe.onrender.com/api/events/1
```

**Request Body** _(application/json)_ (full event object):
```json
{
  "title": "Giannis Haroulis Tour 2025 - Updated",
  "description": "Updated description…",
  "category": "concert",
  "image": "https://example.com/newimage.jpg",
  "schedule": [
    { "date": "2025-06-15", "location": "Athens" },
    { "date": "2025-06-21", "location": "Thessaloniki" }
  ],
  "ticketTypes": [
    { "type": "General Admission", "price": 30, "availableTickets": 400 },
    { "type": "VIP", "price": 60, "availableTickets": 50 }
  ],
  "organizer": "223 Events ΙΚΕ",
  "tags": ["updated", "concert"]
}
```

**Success Response** _(200 OK)_:

```json
{
  "_id": "64a9e2c1f9b2f63320fa1e7d",
  "eventId": 1,
  "title": "Giannis Haroulis Tour 2025 - Updated",
  "description": "Updated description…",
  "category": "concert",
  "image": "https://example.com/newimage.webp",
  "schedule": [
    { "date": "2025-06-15", "location": "Athens" },
    { "date": "2025-06-21", "location": "Thessaloniki" }
  ],
  "ticketTypes": [
    { "type": "General Admission", "price": 30, "availableTickets": 400 },
    { "type": "VIP", "price": 60, "availableTickets": 50 }
  ],
  "organizer": "223 Events ΙΚΕ",
  "tags": ["updated", "concert"],
  "createdAt": "2025-05-20T12:00:00.000Z",
  "updatedAt": "2025-05-31T12:00:00.000Z",
  "__v": 0
}
```

---

#### 2.e. Delete Event

```
DELETE /api/events/:eventId
```

- Deletes the event with the given numeric `eventId`.

**Example URL**:
```
DELETE https://eventapp-backend-c8xe.onrender.com/api/events/1
```

**Success Response** _(200 OK)_:
```json
{ "message": "Event deleted successfully" }
```

---

## 🔄 Partial Updates (PATCH)

#### 3.a. Update a Ticket Type by Index

```
PATCH /api/events/:eventId/ticketTypes/:index
```

- `:eventId` — Numeric `eventId` of the event.  
- `:index` — zero-based index within the `ticketTypes` array.  
- Body can include any of the `type`, `price`, or `availableTickets` fields to update just that subdocument.

**Example URL**:
```
PATCH https://eventapp-backend-c8xe.onrender.com/api/events/1/ticketTypes/0
```

**Request Body** _(application/json)_:
```json
{ "price": 35 }
```

This only updates `ticketTypes[0].price` to `35`.

**Success Response** _(200 OK)_:
```json
{
  "_id": "64a9e2c1f9b2f63320fa1e7d",
  "eventId": 1,
  "title": "Giannis Haroulis Tour 2025",
  "schedule": [
    { "date": "2025-06-15", "location": "Athens" },
    { "date": "2025-06-20", "location": "Thessaloniki" }
  ],
  "ticketTypes": [
    { "type": "General Admission", "price": 35, "availableTickets": 400 },
    { "type": "VIP", "price": 60, "availableTickets": 50 }
  ],
  "organizer": "223 Events ΙΚΕ",
  "tags": ["popular", "traditional", "live"],
  "createdAt": "2025-05-20T12:00:00.000Z",
  "updatedAt": "2025-05-31T12:30:00.000Z",
  "__v": 0
}
```

---

#### 3.b. Update a Schedule Entry by Index

```
PATCH /api/events/:eventId/schedule/:index
```

- `:eventId` — Numeric `eventId` of the event.  
- `:index` — zero-based index within the `schedule` array.  
- Body can include either `date` (ISO string) or `location`, or both.

**Example URL**:
```
PATCH https://eventapp-backend-c8xe.onrender.com/api/events/1/schedule/1
```

**Request Body** _(application/json)_:
```json
{ "location": "Volos" }
```

This only updates `schedule[1].location` to `"Volos"`.

**Success Response** _(200 OK)_:
```json
{
  "_id": "64a9e2c1f9b2f63320fa1e7d",
  "eventId": 1,
  "title": "Giannis Haroulis Tour 2025",
  "schedule": [
    { "date": "2025-06-15", "location": "Athens" },
    { "date": "2025-06-20", "location": "Volos" }
  ],
  "ticketTypes": [
    { "type": "General Admission", "price": 25, "availableTickets": 500 },
    { "type": "VIP", "price": 50, "availableTickets": 100 }
  ],
  "organizer": "223 Events ΙΚΕ",
  "tags": ["popular", "traditional", "live"],
  "createdAt": "2025-05-20T12:00:00.000Z",
  "updatedAt": "2025-05-31T12:30:00.000Z",
  "__v": 0
}
```

---

## 🔐 Environment & Security

- **Never** commit your real `.env` file.  
- Ensure `.env` is listed in `.gitignore`.  
- Use environment variables for **all** secrets (database URIs, API keys).

---

## 📑 Data Model (Event)

Below is the Mongoose schema structure. When reading or writing events:

- **`_id`** is MongoDB’s default ObjectId (always present).  
- **`eventId`** is a required, unique Number, auto‐incremented (1, 2, 3, …).

```js
const eventSchema = new mongoose.Schema({
  eventId: {
    type: Number,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ""
  },
  category: {
    type: String,
    required: true,
    enum: [
      "concert", "theatre", "sports", "festival",
      "conference", "comedy", "workshop", "exhibition",
      "movie", "other"
    ]
  },
  image: {
    type: String,
    default: "",
    required: false
  },
  schedule: {
    type: [
      {
        date: {
          type: Date,
          required: true
        },
        location: {
          type: String,
          required: true,
          trim: true
        }
      }
    ],
    required: true,
    validate: (v) => v.length > 0
  },
  ticketTypes: {
    type: [
      {
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
      }
    ],
    required: true,
    validate: (v) => v.length > 0
  },
  tags: {
    type: [String],
    default: []
  },
  organizer: {
    type: String,
    required: true,
    trim: true
  }
}, { timestamps: true });

// For text‐search on title/description/tags:
eventSchema.index({ title: "text", description: "text", tags: "text" });
```

---

## 🚀 Next Steps

**Frontend Integration**: Make sure your Android app’s base URL is set to  
   ```
   https://eventapp-backend-c8xe.onrender.com/api/
   ```

---

