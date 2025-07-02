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
https://eventapp-backend-c8xe.onrender.com/api/
```

Default `PORT` for the local Base URL is **10000** if not set in `.env`.

---

## 📂 Project Structure

```pgsql
eventApp-backend/
├── controllers/
│   └── user.controller.js       # Controller for user actions
├── data/
│   ├── events.json              # Sample event data
│   └── seed.js                  # Seeder script
├── images/                      # Local images served by server (event photos)
├── models/
│   ├── event.js                 # Event schema
│   ├── favorite.js              # Favorite events schema
│   └── user.js                  # User schema
├── routes/
│   ├── events.js                # Event API routes
│   ├── favorites.js             # Favorites API routes
│   ├── recoms.js                # Recommendations API routes
│   └── users.js                 # User API routes
├── .env                         # Environment variables (not committed)
├── .env.example                 # Example env file
├── .gitignore
├── LICENSE
├── package.json
├── package-lock.json
├── README.md
└── server.js                    # Main server entry point
```

---

## 🗺️ Routes Overview

    | Method | Endpoint                          | Description                            |
    |--------|-----------------------------------|----------------------------------------|
    | GET    | /healthz                          | Health check                           |


### Events Routes

    | Method | Endpoint                          | Description                            |
    |--------|-----------------------------------|----------------------------------------|
    | GET    | /events                           | List events (with filters/pagination)  |
    | POST   | /events                           | Create new event                       |
    | GET    | /events/:eventId                  | Get single event by ID                 |
    | PUT    | /events/:eventId                  | Replace entire event                   |
    | DELETE | /events/:eventId                  | Delete event by ID                     |
    | PATCH  | /events/:eventId/ticketTypes/:i   | Update ticket type (by index)          |
    | PATCH  | /events/:eventId/schedule/:i      | Update schedule entry (by index)       |


### Favorites Routes

    | Method | Endpoint                          | Description                            |
    |--------|-----------------------------------|----------------------------------------|
    | GET    | /favorites                        | List favorited events                  |
    | POST   | /favorites                        | Add event to favorites                 |
    | DELETE | /favorites                        | Remove event from favorites            |


### Recommendations Routes

    | Method | Endpoint                          | Description                            |
    |--------|-----------------------------------|----------------------------------------|
    | POST   | /recoms                           | Get events by categories               |


### Users Routes

    | Method | Endpoint                          | Description                            |
    |--------|-----------------------------------|----------------------------------------|
    | POST   | /users                            | Register new user                      |
    | POST   | /users/login                      | Login user                             |
    | GET    | /users                            | Get all users                          |
    | GET    | /users/:id                        | Get user by ID                         |
    | PUT    | /users/:id                        | Update user                            |
    | DELETE | /users/:id                        | Delete user                            |


+ **Note:** ```The Users API is currently a simple dummy setup without authentication. ```


---


## 🔌 API Endpoints

> **Note:** All endpoints return JSON payloads.

### 1. Health Check

| Method | Path         | Description              | Response Example   |
| ------ | ------------ | ------------------------ | ------------------ |
| GET    | `/healthz`   | Verify server is running | `"Hello Tickest"`  |

---

### 2. Events

> **Note:** Every event document now has both a MongoDB `_id` (ObjectId) and a numeric `eventId` (sequential).  
> - **`_id`** is for internal MongoDB use.  
> - **`eventId`** is an integer that starts at 1 and increments by 1 for each new event.  
> - When you **CREATE** a new event via `POST`, you do **not** supply `eventId`—it’s assigned automatically.

> **Note:** Each event in the response includes a dynamic `favorited` field (Boolean).  
> It indicates whether the event is favorited by the current user (default: false).  
> This field is **not stored** in the MongoDB document but computed during response.

#### 2.a. List Events

```
GET /api/events
```

**Query Parameters** (all optional):

| Parameter               | Description                                                                                       |
| ----------------------- | ------------------------------------------------------------------------------------------------- |
| `search`                | Full-text search on `title`, `description`, or `tags`.                                            |
| `city`                  | Case-insensitive match on any `schedule.location`.                                                |
| `category`              | One of: `concert`, `theater`, `sports`, `festival`, `conference`, `comedy`, `workshop`, etc.     |
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
      "image": "https://eventapp-backend-c8xe.onrender.com/images/event1.jpg",
      "schedule": [
        { "date": "2025-06-15", "location": "Athens", "lat": 37.9838, "lng": 23.7275 },
        { "date": "2025-06-20", "location": "Thessaloniki", "lat": 37.9838, "lng": 23.7275 }
      ],
      "ticketTypes": [
        { "type": "General Admission", "price": 25, "availableTickets": 500 },
        { "type": "VIP", "price": 50, "availableTickets": 100 }
      ],
      "favorited": false,
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
  "image": "https://eventapp-backend-c8xe.onrender.com/images/sample.jpg",
  "schedule": [
    { "date": "2025-09-01", "location": "Volos", "lat": 37.9838, "lng": 23.7275 }
  ],
  "ticketTypes": [
    { "type": "General", "price": 20, "availableTickets": 100 }
  ],
  "organizer": "Some Organizer Name",
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
  "image": "https://eventapp-backend-c8xe.onrender.com/images/sample.webp",
  "schedule": [
    { "date": "2025-09-01", "location": "Volos", "lat": 37.9838, "lng": 23.7275 }
  ],
  "ticketTypes": [
    { "type": "General", "price": 20, "availableTickets": 100 }
  ],
  "favorited": false,
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
  "image": "https://eventapp-backend-c8xe.onrender.com/images/event1.jpg",
  "schedule": [
    { "date": "2025-06-15", "location": "Athens", "lat": 37.9838, "lng": 23.7275 },
    { "date": "2025-06-20", "location": "Thessaloniki", "lat": 37.9838, "lng": 23.7275 }
  ],
  "ticketTypes": [
    { "type": "General Admission", "price": 25, "availableTickets": 500 },
    { "type": "VIP", "price": 50, "availableTickets": 100 }
  ],
  "favorited": false,
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
  "image": "https://eventapp-backend-c8xe.onrender.com/images/event1.jpg",
  "schedule": [
    { "date": "2025-06-15", "location": "Athens", "lat": 37.9838, "lng": 23.7275 },
    { "date": "2025-06-21", "location": "Thessaloniki", "lat": 37.9838, "lng": 23.7275 }
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
  "image": "https://eventapp-backend-c8xe.onrender.com/images/event1.jpg",
  "schedule": [
    { "date": "2025-06-15", "location": "Athens", "lat": 37.9838, "lng": 23.7275 },
    { "date": "2025-06-21", "location": "Thessaloniki", "lat": 37.9838, "lng": 23.7275 }
  ],
  "ticketTypes": [
    { "type": "General Admission", "price": 30, "availableTickets": 400 },
    { "type": "VIP", "price": 60, "availableTickets": 50 }
  ],
  "favorited": false,
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
    { "date": "2025-06-15", "location": "Athens", "lat": 37.9838, "lng": 23.7275 },
    { "date": "2025-06-20", "location": "Thessaloniki", "lat": 37.9838, "lng": 23.7275 }
  ],
  "ticketTypes": [
    { "type": "General Admission", "price": 35, "availableTickets": 400 },
    { "type": "VIP", "price": 60, "availableTickets": 50 }
  ],
  "favorited": false,
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
+ Body can include any of the following fields:
+ - `date` (ISO string)
+ - `location` (String)
+ - `lat` (Number)
+ - `lng` (Number)

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
    { "date": "2025-06-15", "location": "Athens", "lat": 37.9838, "lng": 23.7275 },
    { "date": "2025-06-20", "location": "Volos", "lat": 37.9838, "lng": 23.7275 }
  ],
  "ticketTypes": [
    { "type": "General Admission", "price": 25, "availableTickets": 500 },
    { "type": "VIP", "price": 50, "availableTickets": 100 }
  ],
  "favorited": false,
  "organizer": "223 Events ΙΚΕ",
  "tags": ["popular", "traditional", "live"],
  "createdAt": "2025-05-20T12:00:00.000Z",
  "updatedAt": "2025-05-31T12:30:00.000Z",
  "__v": 0
}
```

---

## ⭐ Favorite Events

> **Note:** Every event document has both a MongoDB `_id` (ObjectId) and a numeric `eventId` (sequential).  
> - **`_id`** is for internal MongoDB use.  
> - **`eventId`** is an integer that starts at 1 and increments by 1 for each new event.  
> - When you **CREATE** a new event via `POST`, you do **not** supply `eventId`—it’s assigned automatically.

> **Note:** Each event in the response includes a dynamic `favorited` field (Boolean).  
> It indicates whether the event is favorited by the current user (default: false).  
> This field is **not stored** in the MongoDB document but computed during response.
> - You can **CHANGE** the default state of `favorited` via the `POST` API of this section.


### 4.a. List Favorited Events

```
GET /api/favorites
```

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
      "image": "https://eventapp-backend-c8xe.onrender.com/images/event1.jpg",
      "schedule": [
        { "date": "2025-06-15", "location": "Athens", "lat": 37.9838, "lng": 23.7275 },
        { "date": "2025-06-20", "location": "Thessaloniki", "lat": 37.9838, "lng": 23.7275 }
      ],
      "ticketTypes": [
        { "type": "General Admission", "price": 25, "availableTickets": 500 },
        { "type": "VIP", "price": 50, "availableTickets": 100 }
      ],
      "favorited": true,
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
### 4.b. Add Event to Favorited

```
POST /api/favorites
```

**Request Body** _(application/json)_:

```json
{
  "eventId": 11
}
```

**Success Response** _(201 Created)_:

```json
{
	"message": "Event favorited"
}
```

**Fail Response** _(409 Conflict)_:

```json
{
	"message": "Already favorited"
}
```
---
### 4.c. Delete Event from Favorited

```
DELETE /api/favorites
```

**Request Body** _(application/json)_:

```json
{
  "eventId": 11
}
```

**Success Response** _(200 OK)_:

```json
{
	"message": "Favorite removed"
}
```

**Fail Response** _(404 Not Found)_:

```json
{
	"message": "Favorite not found"
}
```

---

## 👤 Users


### 5.a. User Login

```
POST /api/users/login
```

- Authenticate user with credentials (e.g. email/password).

- Currently no authentication tokens implemented.


**Request Body** _(application/json)_:

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Success Response** _(200 OK)_:

```json
{
  "message": "Login successful",
  "user": {
    "_id": "64bbf2f47acb8e2c843ab123",
    "name": "John Doe",
    "email": "user@example.com"
  }
}
```


### 5.b. Create User (Registration)

```
POST /api/users
```

- Create a new user.


**Request Body** _(application/json)_:

```json
{
  "name": "John Doe",
  "email": "user@example.com",
  "password": "password123"
}
```

### 5.c. Get All Users

```
GET /api/users
```

- Retrieves a list of all users.


### 5.d. Get Single User by ID

```
GET /api/users/:id
```

- Retrieves user information by MongoDB ObjectId.


### 5.e. Update User by ID

```
PUT /api/users/:id
```

- Update all user fields by ID.


### 5.f. Delete User by ID

```
DELETE /api/users/:id
```

- Deletes user from database.

---

## 🎯 Recommended Events (by Categories)

This route accepts a list of categories (e.g. `concert`, `sports`, etc.) and returns all events that match any of those.

```
POST /api/recoms
```

**Request Body** _(application/json)_:

```json
["concert", "theater"]
```

**Success Response** _(200 OK)_:

```json
[
  {
    "eventId": 1,
    "title": "Giannis Haroulis Tour 2025",
    "category": "concert",
    "schedule": [...],
    "ticketTypes": [...],
    "favorited": false,
    ...
  },
  {
    "eventId": 3,
    "title": "Sophocles' Antigone",
    "category": "theater",
    "schedule": [...],
    "ticketTypes": [...],
    "favorited": false,
    ...
  }
]
```

> ℹ️ **Note:**  This endpoint is used by the frontend to load home screen events based on user-selected categories in the onboarding screen.

---

## 🔐 Environment & Security

- **Never** commit your real `.env` file.  
- Ensure `.env` is listed in `.gitignore`.  
- Use environment variables for **all** secrets (database URIs, API keys).

---

## 🧪 Testing

Currently, no automated tests are implemented. You can test routes via:

- Postman / Insomnia
- Android App frontend
- CURL or browser for GET requests

---

## 🔐 Authentication & Future Improvements

+ Currently, `Tickest backend does not implement authentication ` or authorization.
+ The Users API exists as a simple CRUD for now.


---

## 📑 Data Model (Event)

Below is the Mongoose schema structure. When reading or writing events:

- **`_id`** is MongoDB’s default ObjectId (always present).  
- **`eventId`** is a required, unique Number, auto‐incremented (1, 2, 3, …).
- `lat`, `lng` (optional): Geographic coordinates for each schedule entry (used in Google Maps view).

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
      "concert", "theater", "sports", "festival",
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
        },
        lat: {
          type: Number,
          required: false,
        },
        lng: {
          type: Number,
          required: false,
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


## 📱 Frontend Repository

The frontend code for **Tickest** is hosted separately at:

[https://github.com/kostasmr/Frontend-Events.git](https://github.com/kostasmr/Frontend-Events.git)

---

## 🎨 UI Design & Mockups

The UI mockup that inspired this app’s design can be viewed on Figma:

[Event Booking App UI Kit — Community](https://www.figma.com/design/G0YAXUaPiufBUIwHtjuXM4/Event-Booking-App-UI-Kit---Community--Community-?node-id=2400-6373&t=Z6nSfdmlUjqkUrCw-0)

---

## 📝 Project Management & Methodology

We followed **SCRUM methodology** and defined user stories using Figma Boards, available here:

[SCRUM & User Stories Board](https://www.figma.com/board/29jOPVUcDpDFfoYWw1SwVb/Event-Booking---Socialive?node-id=0-1&t=MmXTuyYjM010hU6k-0)

---

## 📊 Sprint Presentations

The sprint PowerPoint presentations documenting progress and planning are available in the `Sprints/` folder in this repository.

### Sprint 1

- [1st Sprint CODE Presentation](./Sprints/Sprint1/1st_Sprint_CODE_Presentation.pptx)  
- [Events Demo Video](./Sprints/Sprint1/EventsDemo.mp4)

### Sprint 2

- [2nd Sprint CODE Presentation](./Sprints/Sprint2/2nd_Sprint_CODE_Presentation.pptx)  
- [TICKEST Demo Video](./Sprints/Sprint2/TICKEST_DEMO_FINAL.mp4)

---

## 🚀 Next Steps

### Feature Development

+ **Organizer Profile & Management**
    - Create dedicated organizer profiles linked to the `users` collection in MongoDB.
    - Allow organizers to manage and publish their own events with role-based access control.
+ **Popular Events Feature**
    - Track event popularity by clicks or user interactions.
    - Implement backend analytics or counters to rank and serve popular events dynamically.
+ **Booked Tickets & User Connections**
    - Build a `bookings` or `tickets` collection linking booked tickets to specific users.
    - Enable users to view and manage their bookings in their profile.
+ **User Profile Enhancements**
    - Support profile photos and event galleries per user to personalize their accounts.
    - Allow users to upload images and manage media associated with their profiles.
+ **Event Chat / Messaging**
    - Implement or enhance event-specific chat rooms for inter-user communication.
    - Consider real-time messaging using WebSockets or libraries like Socket.io.
+ **Notifications & Alerts**
    - Add push or email notifications for users about low ticket availability on their favorited events.
    - Implement scheduling and background jobs to monitor ticket counts and trigger alerts.


### Technical & Infrastructure Improvements

+ **User Authentication & Authorization**
    - Implement JWT-based authentication for secure login and protected routes.
    - Manage user roles (e.g., organizer, attendee) with access control.
+ **API Documentation**
    - Generate Swagger/OpenAPI docs for all backend routes to simplify frontend development and onboarding.
+ **Automated Testing**
    - Write unit and integration tests for backend APIs to ensure stability and facilitate future development.
+ **CI/CD Pipeline**
    - Automate deployment processes for backend and frontend with continuous integration and delivery.
+ **Performance & Scalability**
    - Optimize database queries and indexing for faster response times.
    - Consider caching frequently requested data (e.g., popular events).
+ **Security Enhancements**
    - Validate and sanitize all inputs to prevent injection attacks.
    - Use HTTPS, secure headers, and environment variable management best practices.

---
