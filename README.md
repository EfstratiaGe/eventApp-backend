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

2. **Install** dependencies:

    ```bash
    npm install

3. **Create** a .env file in the project root (and do not commit it):

    ```text
    # .env (example - keep this file secret!)
    MONGO_URI=<your-mongodb-connection-string>
    PORT=<your-port>

4. **Seed** the database with sample data:

    ```bash
    npm run seed

    **Note:** Add this to your **package.json** scripts if not already present:
    ```json

            "scripts": {
            "seed": "node data/seed.js",
            "dev": "nodemon server.js"
            }

5. **Start** the development server (auto-restarts on changes):

    ```bash
    npm run dev


## 🌐 Base URL

    ```arduino
        <http://localhost:<PORT>/>


## 🔌 API Endpoints

1. **Health Check**

    | Method | Path | Description              | Response Example          |
    | ------ | ---- | ------------------------ | ------------------------- |
    | GET    | `/`  | Verify server is running | `"Hello Eve / Socialive"` |

2. **Events**

    2.a. **List Events**

            ```bash
            GET /api/events

        **Query Parameters (all optional):**

            | Parameter              | Description                                                                                  |
            | ---------------------- | -------------------------------------------------------------------------------------------- |
            | `search`               | Full-text search on title, description, tags                                                 |
            | `city`                 | Case-insensitive match on any `schedule.location`                                            |
            | `category`             | One of: `concert`, `theatre`, `sports`, `festival`, `conference`, `comedy`, `workshop`, etc. |
            | `dateFrom`             | ISO date string; include events with `schedule.date >= dateFrom`                             |
            | `dateTo`               | ISO date string; include events with `schedule.date <= dateTo`                               |
            | `availableOnly`        | `true` / `false`; if `true`, only events with tickets available                              |
            | `upcoming`             | `true` / `false`; if `true` (default), only future events                                    |
            | `minPrice`, `maxPrice` | Numeric bounds applied to any `ticketTypes.price`                                            |
            | `sortBy`               | Field to sort by (e.g. `title`, `schedule.date`, `ticketTypes.price`, etc.)                  |
            | `sortOrder`            | `asc` (default) or `desc`                                                                    |
            | `page`                 | Page number (1-based; default `1`)                                                           |
            | `limit`                | Items per page (default `20`)                                                                |

        **Success Response (200 OK):**

            ```json
            {
            "page": 1,
            "totalPages": 2,
            "totalResults": 35,
            "events": [ /* array of event objects */ ]
            }

    2.b. **Create Event**

            ```bash
            POST /api/events

        **Body (application/json):**

            ```json
            {
            "title": "Sample Event",
            "description": "Optional description.",
            "category": "concert",
            "image": "https://example.com/img.jpg",
            "schedule": [
                { "date": "2025-07-01", "location": "Athens" }
            ],
            "ticketTypes": [
                { "type": "General", "price": 25, "availableTickets": 100 }
            ],
            "tags": ["music","summer"]
            }
        
        **Success Response (201 Created):**

            ```json
            { /* the created event object */ }

    2.c. **Get Single Event**

            ```bash
            GET /api/events/:id

            #:id — Event _id
        
        **Success Response (200 OK):**

            ```json
            { /* the event object */ }
    
    2.d. **Update Entire Event**

            ```bash
            PUT /api/events/:id

            #Requires full event JSON (same shape as POST).

        **Success Response (200 OK):**

            ```json
            { /* the updated event object */ }

    2.e. **Delete Event**

            ```bash
            DELETE /api/events/:id

            #Deletes the event.

        **Success Response (200 OK):**

            ```json
            { "message": "Event deleted successfully" }

    2.f. **Update Ticket Type by Index**

            ```ruby
            PATCH /api/events/:id/ticketTypes/:index

            #:id — event _id
            #:index — zero-based index in ticketTypes array

        **Body (application/json):**

            ```json
            { "price": 30 }
            // or
            { "type": "VIP" }
            // or
            { "availableTickets": 150 }
        
        **Success Response (200 OK):**

            ```json
            { /* the full event object with updated ticketTypes */ }

    2.g. **Update Schedule Entry by Index**

            ```ruby
            PATCH /api/events/:id/schedule/:index

            #:id — event _id
            #:index — zero-based index in schedule array

        **Body (application/json):**

            ```json
            { "location": "Volos" }
            // or
            { "date": "2025-08-01" }

        
        **Success Response (200 OK):**

            ```json
            { /* the full event object with updated schedule */ }


## 🔐 Environment & Security

    - Never commit your real .env file.

    - Ensure .env is listed in .gitignore.

    - Use environment variables for all secrets (database URIs, API keys).

## 📑 Data Model (Event)

    ```js
    {
    title: String,
    description: String,
    category: String,       // among ALLOWED_CATEGORIES
    image: String,
    schedule: [             // at least one
        { date: Date, location: String }
    ],
    ticketTypes: [          // at least one
        { type: String, price: Number, availableTickets: Number }
    ],
    tags: [ String ],
    organizer: ObjectId     // ref: User (future use)
    }
