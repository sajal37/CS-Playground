# CS Playground

Interactive front-end with two MySQL-backed concept pages. The UI is static HTML/CSS/JS served from the project root. The backend lives under `server/`.

## Structure

- `index.html` and `style.css` are the landing page entry points.
- `script.js` boots the landing page app (module entry).
- `js/` contains landing page modules.
- `content/` contains landing page copy and message pools.
- `concepts/` contains concept pages and shared concept helpers.
- `server/` is the Node + MySQL API.

## Run

### Backend

```bash
cd server
npm install
npm run start
```

### Frontend

```bash
npx serve .
```

Open:

- `http://localhost:3000/index.html`
- `http://localhost:3000/concepts/db-indexing/`
- `http://localhost:3000/concepts/query-optimization/`

## Tooling

From the project root:

```bash
npm run format
npm run lint
npm run test
npm run check
```

Notes:

- `npm run test` executes `tests/ui-smoke.test.js` (DOM smoke checks).
- API smoke tests live in `server/tests/smoke.test.js` and expect a running server and MySQL.
