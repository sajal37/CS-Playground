# CS Playground

CS Playground is a static frontend with two real MySQL-backed concept pages. The UI is plain HTML/CSS/JS served from the project root. The backend lives under `server/` and exposes JSON endpoints.

## What’s Included

- Landing page with interactive UI states and concept cards.
- **DB Indexing** concept: runs real SQL against MySQL.
- **Query Optimization** concept: runs real SQL against MySQL.
- Shared concept helpers and content modules.
- Lightweight UI and API smoke tests.

## Requirements

- Node.js 18+ (see `.nvmrc`)
- MySQL 8.0+

## Quick Start

### 1. Start the backend

```bash
cd server
npm install
npm run start
```

The server listens on `http://127.0.0.1:3001` by default and also serves the frontend files.

### 2. Open the frontend (recommended)

Open:

- `http://127.0.0.1:3001/index.html`
- `http://127.0.0.1:3001/concepts/db-indexing/`
- `http://127.0.0.1:3001/concepts/query-optimization/`

### 3. Optional: serve frontend separately on 3000

From the project root:

```bash
npx serve .
```

Open:

- `http://localhost:3000/index.html`
- `http://localhost:3000/concepts/db-indexing/`
- `http://localhost:3000/concepts/query-optimization/`

When running on `:3000`, concept API calls automatically target `http://localhost:3001/api`.

## Database Setup

Create the database once:

```sql
CREATE DATABASE cs_playground;
```

Configure credentials in `server/.env`:

```
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password_here
DB_NAME=cs_playground
```

The backend creates tables and seeds data automatically.

## Project Structure

- `index.html` and `style.css` are the landing page entry points.
- `script.js` is the landing page module entry.
- `js/` landing page modules.
- `content/` landing page copy and message pools.
- `concepts/` concept pages + shared helpers and content.
- `styles/` split CSS files for the landing page.
- `server/` Node + MySQL API.

## Frontend Scripts

Landing page entry:

- `script.js` imports `js/app.js`.

Concept pages:

- `concepts/db-indexing/script.js`
- `concepts/query-optimization/script.js`

These are ES modules and use shared helpers from `concepts/shared/`.

## API (Server)

| Endpoint            | Method | Purpose |
| ------------------- | ------ | ------- |
| `/api/health`       | GET    | MySQL connectivity check |
| `/api/setup`        | POST   | Create table + seed 100K users |
| `/api/query`        | POST   | Execute SELECT query (timing + plan) |
| `/api/index/create` | POST   | Create index on a column |
| `/api/index/drop`   | POST   | Drop index |
| `/api/reset`        | POST   | Drop all indexes |
| `/api/write-test`   | POST   | Insert rows with/without indexes |
| `/api/qo/setup`     | POST   | Setup tables for query optimization page |

## Tooling

From the project root:

```bash
npm install
npm run format
npm run lint
npm run test
npm run check
```

From `server/`:

```bash
npm install
npm run lint
npm run test
```

## Tests

- `tests/ui-smoke.test.js` loads HTML and verifies required IDs.
- `server/tests/smoke.test.js` performs a minimal health check.

API tests expect the server and MySQL to be running. Optionally run DB setup during tests:

```bash
RUN_DB_TESTS=1 node server/tests/smoke.test.js
```

## Troubleshooting

### Missing modules

If you see `Cannot find module 'dotenv'` or similar, reinstall server dependencies:

```bash
cd server
npm install
```

### MySQL connection errors

- Confirm MySQL is running.
- Verify `server/.env` settings.
- Check that the database `cs_playground` exists.
