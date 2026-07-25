# node-task-api

A minimal Node.js/Express REST API for managing tasks — built to demonstrate
production patterns (auth, validation, error handling, testing, containerization,
CI) rather than to be a large application.

## Stack

- **Express** — HTTP framework
- **nedb-promises** — embedded, file-backed datastore (real persistence, no external DB server required)
- **Jest + Supertest** — automated API tests
- **Docker** — containerized deployment
- **GitHub Actions** — CI running tests + Docker build on every PR

## Endpoints

All `/tasks` endpoints require an `x-api-key` header (see Auth below).

| Method | Path         | Description                          |
|--------|--------------|---------------------------------------|
| GET    | `/health`    | Unauthenticated health check          |
| GET    | `/tasks`     | List tasks (optional `?status=` filter) |
| GET    | `/tasks/:id` | Fetch a single task                   |
| POST   | `/tasks`     | Create a task (`title` required)      |
| PUT    | `/tasks/:id` | Update a task's `title` and/or `status` |
| DELETE | `/tasks/:id` | Delete a task                         |

Valid `status` values: `todo`, `in_progress`, `done`.

## Auth

Simple API-key middleware for demonstration purposes — send the header:

```
x-api-key: dev-key
```

(Override the expected key via the `API_KEY` environment variable. Swap this
middleware for JWT/OAuth in a real deployment.)

## Running locally

```bash
npm install
npm start        # listens on PORT (default 3000)
```

Example request:

```bash
curl -X POST http://localhost:3000/tasks \
  -H "x-api-key: dev-key" \
  -H "Content-Type: application/json" \
  -d '{"title": "Buy milk"}'
```

## Running tests

```bash
npm test
```

Tests run against an in-memory datastore (`NODE_ENV=test`), so they don't
touch the real `data/tasks.db` file and can run in CI without setup.

## Docker

```bash
docker build -t node-task-api .
docker run -p 3000:3000 -e API_KEY=dev-key node-task-api
```

## CI

`.github/workflows/ci.yml` runs the test suite and builds the Docker image on
every push/PR to `main`.

## Project structure

```
src/
  app.js               # Express app factory (middleware + route wiring)
  server.js            # boots the app
  db.js                # embedded datastore
  middleware/
    auth.js            # API-key check
    validate.js        # request body validation
    errorHandler.js     # centralized error + 404 handling
  routes/
    tasks.js           # task CRUD routes
tests/
  tasks.test.js        # Jest + Supertest suite
```
