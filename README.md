# IDX Property Search Application

A full-stack property search app built with React, Node.js/Express, and MySQL.

## Features

- Property search with filters (city, ZIP code, price, beds, baths)
- Paginated property results
- Property detail view
- Open house schedule endpoint
- Favorites flow in frontend UI

## Prerequisites

- Node.js 18+
- npm 9+
- Docker Desktop
- Git

## Setup Instructions

### 1. Clone Repository

```bash
git clone <repository-url>
cd idx-project-search
```

### 2. Start Database

```bash
docker run --name idx-mysql-local -p 3306:3306 -e MYSQL_ROOT_PASSWORD=rootpass -e MYSQL_DATABASE=rets -d mysql:8.0
```

Import seed data (replace file names/paths as needed):

```bash
docker exec -i idx-mysql-local mysql -uroot -prootpass rets < rets_property.sql
docker exec -i idx-mysql-local mysql -uroot -prootpass rets < rets_openhouse.sql
```

### 3. Backend Setup

```bash
cd backend
npm install
# create .env with DB connection values
npm run dev
```

Backend default URL: http://localhost:5000

### 4. Frontend Setup

```bash
cd frontend
npm install
npm start
```

Frontend default URL: http://localhost:3000

## Running Tests

Backend tests:

```bash
cd backend
npm test
npm run test:coverage
```

Frontend tests:

```bash
cd frontend
npm test -- --watchAll=false
npm test -- --coverage --watchAll=false
```

## Project Structure

```text
idx-project-search/
├── backend/
│   ├── src/
│   │   ├── db/
│   │   │   └── mysql.js
│   │   ├── routes/
│   │   │   ├── properties.js
│   │   │   └── properties.test.js
│   │   └── index.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── hooks/
│   │   └── pages/
│   └── package.json
├── tasks/
└── README.md
```

## API Documentation

### GET /api/health

Checks API and database connectivity.

Example response:

```json
{ "status": "ok", "database": "connected" }
```

### GET /api/properties

Returns paginated properties with optional filters.

Query parameters:

- `limit` (default: 20, max: 100)
- `offset` (default: 0)
- `city`
- `zipcode`
- `minPrice`
- `maxPrice`
- `beds`
- `baths`

Example:

```text
GET /api/properties?city=Portland&minPrice=300000&beds=3
```

### GET /api/properties/:id

Returns a single property by listing ID.

### GET /api/properties/:id/openhouses

Returns open house schedule entries for a listing ID.

## Architecture Decisions

### Why Docker for MySQL?

- Reproducible local setup
- Isolates DB dependencies from host system
- Easy environment reset and data reimport

### Why Pagination?

- Prevents large result payloads
- Improves frontend load and scroll performance
- Reduces backend and DB load per request

### Why React Router?

- Enables deep links to property details
- Preserves browser navigation behavior
- Supports stateful navigation between listings and detail pages

### Why Route-Level Validation?

- Rejects invalid input early
- Protects DB query layer from malformed parameters
- Makes API behavior predictable for frontend clients

## Troubleshooting

### Backend does not start

- Verify MySQL container is running: `docker ps`
- Verify DB credentials in backend environment variables
- Check for port conflicts on `5000`

### Frontend API calls fail with CORS or network errors

- Ensure backend is running on `http://localhost:5000`
- Confirm `proxy` is set in `frontend/package.json`
- Restart frontend dev server after config changes

### Tests fail unexpectedly

- Remove lockfile/node_modules and reinstall dependencies
- Confirm Node version is 18+
- Run tests in CI mode for deterministic output:
  - Backend: `npm run test:coverage`
  - Frontend: `npm test -- --coverage --watchAll=false`

## Engineering Notes

- Database access uses parameterized SQL values to reduce injection risk
- API routes use explicit validation and error responses for robustness
- Route files and components are split by concern for maintainability

## What Is Test Coverage?

Test coverage measures how much of your code is exercised by automated tests.

Coverage metrics usually include:

- Statements: executed code statements
- Branches: conditional paths (`if/else`, ternaries)
- Functions: functions invoked by tests
- Lines: lines executed at runtime

### Why 70%?

70% is a practical baseline that balances speed and confidence:

- High enough to catch many regressions in critical paths
- Low enough to avoid writing brittle tests for trivial code
- Encourages focus on meaningful behavior, not metric gaming

For core flows (search, detail, open houses, and key UI interactions), aiming above the baseline is preferred.

## What Makes a Good README?

A good README is:

- Actionable: a new developer can run the project quickly
- Accurate: commands and endpoints reflect the current code
- Architectural: explains key decisions and trade-offs
- Supportive: includes troubleshooting for common failures
- Maintainable: concise sections that are easy to update
