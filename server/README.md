# CS Playground Server

Backend for the CS Playground concept pages. Provides MySQL-backed endpoints used by the frontend.

## Prerequisites

- Node.js 18+
- MySQL 8.0+

## Setup

1. Create the database:

```sql
CREATE DATABASE cs_playground;
```

2. Configure credentials in `server/.env`:

```
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password_here
DB_NAME=cs_playground
```

## Run

```bash
cd server
npm install
npm run start
```

Server output should include:

```
{CS} Playground Server
http://127.0.0.1:3001
```

## Frontend

Recommended (same-origin):

- `http://127.0.0.1:3001/index.html`
- `http://127.0.0.1:3001/concepts/db-indexing/`
- `http://127.0.0.1:3001/concepts/query-optimization/`

Optional separate static server on `:3000`:

From the project root:

```bash
npx serve .
```

Then open:

- `http://localhost:3000/concepts/db-indexing/`
- `http://localhost:3000/concepts/query-optimization/`

When frontend runs on `:3000`, concept scripts auto-target `http://localhost:3001/api`.

## API Endpoints

| Endpoint            | Method | Purpose                                      |
| ------------------- | ------ | -------------------------------------------- |
| `/api/health`       | GET    | MySQL connectivity check                     |
| `/api/setup`        | POST   | Create table + seed 100K users               |
| `/api/query`        | POST   | Execute SELECT query (returns timing + plan) |
| `/api/index/create` | POST   | Create index on a column                     |
| `/api/index/drop`   | POST   | Drop index                                   |
| `/api/reset`        | POST   | Drop all indexes                             |
| `/api/write-test`   | POST   | Insert rows with/without indexes             |
| `/api/qo/setup`     | POST   | Setup tables for query optimization page     |
