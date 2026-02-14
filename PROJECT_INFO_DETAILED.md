# CS Playground - Detailed Project Dossier

This document is a deep technical snapshot of the current repository state in `d:\Documents\CS Playground`. It is written as a source-of-truth project record that can later be converted into role-specific resume points without re-reading the whole codebase.

## Repository Snapshot

| Field | Current Value |
| --- | --- |
| Project name | CS Playground |
| Repository type | Monorepo-style single project with static frontend plus Node/MySQL backend |
| Primary objective | Teach CS concepts through consequence-driven interactive demos with real database behavior |
| Frontend architecture | Plain HTML/CSS/JavaScript ES modules, no bundler |
| Backend architecture | Express API server with MySQL connection pool |
| Database | MySQL 8+ |
| Total concepts defined | 45 |
| Live concepts | 2 (`db-indexing`, `query-optimization`) |
| Locked concepts | 43 |
| Root package manager | npm |
| Root Node target | Node 18+ (`.nvmrc` = `18`) |
| API base path from frontend | `/api` (same-origin expectation) |
| Working tree state at capture | Clean (`git status --short` returned no changes) |

## Codebase Size Profile

This section excludes `server/package-lock.json` when discussing source size because that file is generated metadata.

| Metric | Value |
| --- | --- |
| Approximate source lines (code + markup + styles, no lockfile/docs/json) | 6,920 |
| JavaScript files | 21 files, 3,175 lines |
| CSS files | 7 files, 2,878 lines |
| HTML files | 3 files, 819 lines |

The largest implementation files by line count are `concepts/db-indexing/style.css` (791 lines), `js/interactions.js` (715 lines), and `concepts/query-optimization/style.css` (665 lines).

## Proven Metrics (Evidence-Backed)

The following are hard metrics that are directly verifiable from repository code or deterministic local file scans done for this dossier on February 13, 2026.

| Metric | Proven Value | Evidence Source |
| --- | --- | --- |
| Total concepts defined | 45 | `concepts.js` (`CONCEPTS` length) |
| Live concepts | 2 | `concepts.js` (`status: "live"`) |
| Locked concepts | 43 | `concepts.js` (`status: "locked"`) |
| Live ratio | 4.44% | Derived from 2/45 from `concepts.js` |
| Category count | 11 | `concepts.js` (`CATEGORIES` keys) |
| Backend API endpoints | 8 | `server/server.js` (`app.get/post("/api/...")` declarations) |
| DB indexing seed size | 100,000 users | `server/server.js` (`/api/setup`, `ROW_COUNT = 100_000`) |
| Query optimization seed size | 100,000 users + 200,000 orders | `server/server.js` (`/api/qo/setup`, `USER_COUNT`, `ORDER_COUNT`) |
| Write benchmark batch size | 5,000 rows | `server/server.js` (`/api/write-test`, `WRITE_COUNT = 5000`) |
| Allowed user index columns via API | 3 (`city`, `name`, `created_at`) | `server/server.js` (`/api/index/create` + `/api/index/drop` allowlist) |
| Landing rules rendered | 10 | `index.html` (`.rule-item` count) |
| DB indexing page stages | 11 | `concepts/db-indexing/index.html` (`<section class="stage">` count) |
| Query optimization page stages | 19 | `concepts/query-optimization/index.html` (`<section class="stage">` count) |
| Source LOC (no lockfile/json/docs) | 6,920 | Repo scan (`rg --files` + line counts) |
| JS source footprint | 21 files / 3,175 lines | Repo scan (excluding lockfile) |
| CSS source footprint | 7 files / 2,878 lines | Repo scan (excluding lockfile) |
| HTML source footprint | 3 files / 819 lines | Repo scan (excluding lockfile) |

Metrics intentionally not included here: runtime latency claims (for example exact ms speedups), because those depend on machine, MySQL configuration, and data/cache state, and are not statically provable from source alone.

## Product Intent and Learning Model

The product is designed as an "interactive consequence engine" rather than a passive tutorial. The core philosophy implemented in UI copy and behavior is that users should trigger outcomes first and only then read explanations. The landing page repeatedly reinforces this through language, staged reveals, and reactive status messages.

The project currently implements two fully wired concept pages backed by real MySQL query execution. The design direction is dark, terminal-inspired, and deliberately dramatic with visible system-like feedback, reaction to user behavior, and micro-narrative progression.

## High-Level Architecture

The runtime architecture has two layers.

The frontend is static and file-based. The entry file `script.js` imports `js/app.js`, which initializes all interaction modules for the landing page. Concept pages use their own module entry points in `concepts/db-indexing/script.js` and `concepts/query-optimization/script.js`.

The backend is in `server/server.js`. It serves both static files from the project root and JSON endpoints under `/api`. It also manages MySQL setup, deterministic test data generation, index management, query execution diagnostics, and write-performance experiments.

A practical implication is that concept pages expect same-origin API access (`/api`). If frontend is served from a different origin/port than backend, API calls fail unless a proxy is configured.

## Directory and Responsibility Map

```text
.
|-- index.html                     Landing page UI shell
|-- script.js                      Landing page module entry (imports js/app.js)
|-- style.css                      Landing page CSS aggregator via @import
|-- concepts.js                    Master concept registry and category metadata
|-- content/site.js                Landing-page message pools and text constants
|-- js/
|   |-- app.js                     Startup orchestration for landing page
|   |-- state.js                   Shared mutable UI state model
|   |-- dom.js                     Selector helpers and cached DOM refs
|   |-- effects.js                 Reactions, glitches, boot animation, staged reveals
|   |-- interactions.js            Event wiring and behavior logic
|   |-- rendering.js               Category tabs and concept card rendering
|-- styles/
|   |-- base.css                   Tokens, reset, base typography
|   |-- layout.css                 Structural layout, sections, responsive layout
|   |-- components.css             Cards, buttons, overlays, demos, reactions
|   |-- animations.css             Keyframes, reduced-motion handling, utility classes
|-- concepts/
|   |-- shared/
|   |   |-- api.js                GET/POST API helpers for concept pages
|   |   |-- dom.js                byId/qs helpers
|   |   |-- timing.js             sleep + number animation helper
|   |-- content/
|   |   |-- db-indexing.js        SQL presets and reaction pools
|   |   |-- query-optimization.js Round SQL pairs and reaction pools
|   |-- db-indexing/
|   |   |-- index.html            Concept page markup
|   |   |-- script.js             Full guided experience logic
|   |   |-- style.css             Concept-specific styling
|   |-- query-optimization/
|   |   |-- index.html            Concept page markup
|   |   |-- script.js             Guided rounds and playground logic
|   |   |-- style.css             Concept-specific styling
|-- server/
|   |-- server.js                  Express + MySQL backend and static host
|   |-- package.json               Backend scripts/dependencies
|   |-- README.md                  Backend setup notes
|   |-- tests/smoke.test.js        Lightweight API smoke check
|-- tests/ui-smoke.test.js         Static HTML ID contract smoke test
```

## Concept Registry and Taxonomy

The concept inventory is centralized in `concepts.js`. Each concept has id, title, hook, icon, category, status, and optional path.

Category distribution in the current registry is shown below.

| Category ID | Label | Count |
| --- | --- | --- |
| databases | Databases | 4 |
| concurrency | Concurrency | 4 |
| security | Security | 5 |
| reliability | Reliability | 4 |
| performance | Performance | 4 |
| networking | Networking | 4 |
| os | OS and Systems | 4 |
| data-structures | Data Structures | 4 |
| architecture | Architecture | 5 |
| devops | DevOps | 3 |
| algorithms | Algorithms | 4 |

Only two concepts have `status: "live"` and navigable paths. All others are intentionally locked and used for teaser cards and interaction behavior.

## Landing Page Behavior Model

Landing page behavior is heavily stateful and event-driven. The state object in `js/state.js` tracks boot status, hero interaction counts, interaction totals, emotional phase, category exploration, rule-view counts, return-visitor state, screen tracking, and timers.

The boot sequence starts via `startBoot()` in `js/interactions.js`, then `runBootSequence()` in `js/effects.js` prints staged boot lines before revealing hero content. The hero section includes a prominent destructive-leaning CTA (`Break something`) that intentionally triggers a fake "broken" sequence followed by recovery messaging and auto-scroll to concepts.

The concepts section is rendered dynamically by `js/rendering.js`. `renderCategoryTabs()` builds category chips from registry metadata, and `renderConceptCards()` groups cards by category when `all` is selected. Available cards navigate by `data-href`; locked cards trigger rejection animations and escalating reaction text.

The philosophy section contains 10 explicit rules with interactive demo widgets. Rule items support hover reactions, expandable depth text, and demo-specific actions. Demo actions include click reaction chains, toggle switch behavior, forced glitch effects, and reset of demo state.

Global behavior includes cursor glow tracking, idle detection, random ambient whispers, visibility-change handling, rapid-scroll interrupts, right-click reactions, and a nav-logo easter egg that toggles speedrun mode after triple click.

## Landing Page State and Message Systems

The project separates copy pools from behavior logic. `content/site.js` contains boot messages, presence pools, momentum milestones, interruptions, hero responses, locked-card responses, rule reactions, and return greetings. This allows behavioral logic in `js/interactions.js` and `js/effects.js` to remain mostly generic while still producing high-variation text output.

Reaction rendering is centralized in `showReaction()`. It deduplicates repeated messages, applies mood class variants, animates visibility, and auto-dismisses after a timer.

## DB Indexing Concept: Runtime Flow

The DB indexing concept (`concepts/db-indexing/`) is a complete staged journey tied to real SQL execution. The page initially boots a terminal panel, verifies DB connectivity through `/api/health`, then seeds the `users` table via `/api/setup` with 100,000 rows.

The user journey then reveals stage-by-stage sections in this order: `stageChallenge`, `stageSlow`, `stageFix`, `stageRerun`, `stageFast`, `stageCompare`, `stageExplain`, `stagePlayground`, `stageWrite`, and `stageTakeaway`.

The first guided query runs `SELECT * FROM users WHERE city = 'Mumbai'` before any index is present. The API returns measured time, plan summary, rows examined, and result sample data. UI then visualizes timing, plan metadata, table sample, and user-facing reaction text.

The index creation stage triggers `/api/index/create` with `column = city`. The rerun stage executes the same query and compares performance against the initial run, including bar visualizations and computed speedup ratio.

The playground stage allows toggling indexes for `city`, `name`, and `created_at`, selecting query presets, running query experiments, and recording local history for up to eight recent runs with indexed-state context.

The write-overhead stage calls `/api/write-test`, comparing insert performance with and without three secondary indexes to make read-vs-write trade-offs explicit.

## Query Optimization Concept: Intended Design

The query optimization concept (`concepts/query-optimization/`) is designed around three anti-pattern rounds followed by a free playground.

Round 1 contrasts `YEAR(created_at) = 2025` against a sargable date range.

Round 2 contrasts a leading wildcard (`LIKE '%Aarav%'`) against prefix search (`LIKE 'Aarav%'`).

Round 3 contrasts unbounded sort query against `LIMIT 20`.

The backend setup endpoint `/api/qo/setup` creates and seeds both `users` and `orders` tables and builds five indexes used for this concept.

The script implements `runRound()` logic for bad and good queries, displays timing/plan data, computes speedup, then reveals subsequent rounds after both sides complete.

## Backend API: Contract and Side Effects

`server/server.js` is the single backend service and exports no modules; it starts directly with `app.listen()`.

| Endpoint | Method | Request Body | Key Validation | Primary Side Effects | Response Shape |
| --- | --- | --- | --- | --- | --- |
| `/api/health` | GET | none | none | Executes `SELECT 1` | `{ status: "ok", db: "connected" }` or error |
| `/api/setup` | POST | none | none | Drops/recreates `users`, inserts 100k rows deterministically | `{ status, totalRows, mumbaiRows }` |
| `/api/query` | POST | `{ sql }` | SQL must start with `SELECT` | Runs `EXPLAIN`, optional `EXPLAIN ANALYZE`, executes query | `{ time, plan, columns, rows, rowCount, rowsExamined }` |
| `/api/index/create` | POST | `{ column }` | Column in `city,name,created_at` | Creates index `idx_<column>` on `users` | `{ status, time }` or duplicate note |
| `/api/index/drop` | POST | `{ column }` | Column in `city,name,created_at` | Drops index `idx_<column>` if exists | `{ status }` or note |
| `/api/reset` | POST | none | none | Attempts to drop all three known user indexes | `{ status }` |
| `/api/write-test` | POST | none | none | Inserts 5000 rows without indexes, deletes, repeats with indexes, restores prior indexes | `{ timeWithout, timeWith, rowCount }` |
| `/api/qo/setup` | POST | none | none | Drops/recreates `users` and `orders`, seeds 100k + 200k rows, creates 5 indexes | `{ status, users, orders, indexes }` |

## Query Diagnostics Strategy in API

The query endpoint uses a layered timing strategy. It first attempts `EXPLAIN` to infer access type, key usage, and estimated rows examined. It then attempts `EXPLAIN ANALYZE` and parses "actual time=..." from returned text to approximate MySQL execution time. If analyze parsing is unavailable, it falls back to wall-clock timing around `pool.query(sql)`.

Plan strings are normalized into user-readable categories like full table scan, full index scan, index range scan, and index lookup. Result rows are truncated to the first 100 for payload size control while keeping full `rowCount`.

## Database Schema and Data Generation

`/api/setup` creates table `users` with columns `id`, `name`, `email`, `city`, and `created_at`. IDs are deterministic from 1 to 100000.

Data generation for setup and `/api/qo/setup` uses a deterministic linear congruential generator (`seed = 42`, multiplier 16807, modulus 2147483647). This guarantees reproducible seeded distributions across runs for first names, last names, cities, and dates.

`/api/qo/setup` additionally creates table `orders` with columns `id`, `user_id`, `amount`, `product`, and `order_date`, inserting 200000 rows.

Indexes created in query optimization setup are `idx_city`, `idx_created_at`, `idx_name`, `idx_user_id`, and `idx_order_date`.

## Frontend-Backend Integration Pattern

Concept scripts use lightweight wrappers in `concepts/shared/api.js` with `fetch` calls against relative path `/api`. This keeps browser code simple and server-agnostic, but it assumes frontend and backend are behind the same origin.

Because `server/server.js` also serves static files from repo root, the simplest production-like local run is to open pages through backend origin on port 3001.

## Styling System and Visual Direction

Landing page CSS is split into token/base/layout/component/animation files and imported via root `style.css`. Tokenization uses CSS variables for surface, text, accents, radii, spacing, and easing curves. Motion design relies on layered keyframes for glitch overlays, pulse effects, reveals, hover states, and fail-safe fade-in.

DB indexing page has an amber-red visual system with strong contrast between slow and fast states. Query optimization page has a purple base with cyan for fast states and red for slow states, plus grid background texture.

Both concept pages include dedicated responsive breakpoints and maintain no-JS fallback readability for static content blocks.

## Tooling and Configuration

Root `package.json` provides formatting, lint, test, and check scripts. Lint uses ESLint plus Stylelint. UI smoke test uses JSDOM to verify critical IDs in static HTML files.

Backend `server/package.json` provides run, lint, test, and check scripts specific to API service.

Formatting is controlled by `.prettierrc` (`printWidth: 100`, semicolons on, trailing commas all). Cross-editor text normalization is enforced by `.editorconfig` and `.gitattributes` with LF endings.

## Test Coverage and Current Test Scope

The current tests are intentionally light and mostly contract-level.

`tests/ui-smoke.test.js` parses static HTML and checks presence of required element IDs for landing page and concept pages.

`server/tests/smoke.test.js` checks `/api/health` and optionally `/api/setup` when `RUN_DB_TESTS=1` is set.

These tests do not currently validate interactive runtime behavior, staged reveal sequencing, data correctness beyond endpoint success status, or visual regressions.

## Local Verification Notes from This Snapshot

In the captured environment, running `npm run test` at root failed due missing local dependency installation (`Cannot find module 'jsdom'`). Running `npm run lint` at root failed because ESLint binary was not installed locally (`eslint is not recognized`).

This indicates the repository itself defines required tooling correctly, but dependencies were not installed in the current local machine state at the moment of capture.

## Known Issues and Integrity Gaps (Current Repo State)

### 1) Stray shell text inside landing page markup

`index.html` currently contains literal text `net start MySQL80` directly in the body after `#cursorGlow`. This appears accidental and will render as visible page text.

### 2) Query optimization page has script-to-markup ID contract drift

`concepts/query-optimization/script.js` references IDs like `stageR1`, `R1BadTime`, `R1BadWrap`, and container `playgroundList`, while `concepts/query-optimization/index.html` uses lowercase id forms like `r1BadTime` and a different playground structure (`pgSelect`, `pgBadSql`, `pgGoodSql`, etc.).

This mismatch likely causes runtime failures or non-functional interactions, including potential null dereference in `buildPlayground()` because `playgroundList` does not exist.

### 3) UI smoke test contract is out of sync with query optimization HTML

`tests/ui-smoke.test.js` expects `playgroundList` in query optimization markup, but current HTML does not define that id. After dependencies are installed, this test is expected to fail unless files are synchronized.

### 4) Frontend run instructions in README can conflict with same-origin API expectation

Frontend scripts call `/api` relative to current origin. README currently suggests serving frontend on port 3000 with backend on 3001 without proxy instructions. That split-origin setup does not satisfy `/api` routing by default.

### 5) Optional technical debt signal from Node module mode warning

Running direct ESM import of `concepts.js` in Node emits a warning that package type is not declared. Browser runtime is unaffected, but mixed CJS/ESM tool scripts may incur overhead unless `type` handling is clarified.

## Security and Operational Considerations

The server uses open CORS (`app.use(cors())`) and accepts raw SELECT SQL from clients in `/api/query`. It blocks non-SELECT statements by prefix check, which prevents direct writes through this endpoint, but it does not parameterize or sandbox expensive reads. In public deployment, rate limiting, query timeout controls, allowlisted query patterns, and tighter CORS policy would be needed.

The data seeding and write-test logic builds SQL by string concatenation. Current seeded vocab avoids quote-breaking values, but this pattern is generally fragile for arbitrary user input.

## Resume Evidence Map by Role Direction

### For backend-focused roles

This project demonstrates practical API design around measurable database behavior rather than mock data. Strong proof points include deterministic data seeding at 100k and 200k scale, index lifecycle endpoints, real EXPLAIN-based diagnostics, and comparative write-path benchmarking with and without indexes. The service also handles setup/reset workflows that make demos reproducible.

### For frontend-focused roles

This project demonstrates advanced vanilla JavaScript UI orchestration without framework abstraction. The landing page has a modular architecture for state, DOM refs, rendering, effects, and interaction wiring. It includes behavior-driven micro-interactions, staged reveals, keyboard easter eggs, idle detection, reduced-motion support, and responsive design across multiple pages.

### For full-stack roles

This project demonstrates end-to-end ownership of UX narrative, API contracts, data generation, and measured backend performance surfaced directly in UI. The strongest full-stack signal is the closed feedback loop where user actions trigger server-side SQL execution and the resulting timing/plan telemetry updates interface visuals and learning prompts in real time.

### For performance/databases roles

This project demonstrates hands-on performance education patterns grounded in real index usage, query anti-pattern remediation, and trade-off framing. The code captures and visualizes differences between full scans and index-assisted access, and includes controlled experiments for read-optimization vs write overhead.

## Practical Runbook (Current Architecture)

Use this sequence for reliable local operation with same-origin API behavior.

First, install backend dependencies in `server/` and start backend on `http://localhost:3001`.

Second, either open pages through backend-served static files (`http://localhost:3001/index.html` and concept paths) or configure a dev proxy if serving frontend from a different port.

Third, ensure MySQL database `cs_playground` exists and `.env` values in `server/` match local credentials.

## Configuration Reference

Environment variables consumed by backend are `PORT`, `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, and `DB_NAME`. Default fallback values are provided in code for host, port, user, and database name.

Connection pooling uses `mysql2/promise` with `waitForConnections: true`, `connectionLimit: 10`, and `multipleStatements: true`.

## File-by-File Technical Notes

`js/interactions.js` is the central coordinator for most landing page behavior and currently the densest logic file. It handles hero behavior transitions, concept card binding, section visibility detection, interrupt heuristics, keyboard and visibility events, and rule demo behavior.

`js/effects.js` contains most visual-state side effects including reaction display, glitch trigger gating, boot message reveal sequence, and staged reveal helpers for concepts/philosophy sections.

`concepts/db-indexing/script.js` is a complete guided tutorial engine with terminal output simulation, asynchronous stage progression, API integration, and secondary playground/history subsystems.

`server/server.js` acts as both static host and API server and contains all backend business logic in a single file. It is easy to run but currently monolithic; service decomposition could improve maintainability later.

## Suggested Next Documentation Additions (If Expanded Later)

A future version of this dossier could include sequence diagrams for each concept flow, JSON schema contracts for each endpoint, and benchmark logs captured across multiple machines to quantify expected timing bands.

It could also include a strict test matrix that maps every interactive stage id to script handlers to prevent future HTML/JS drift.

## Closing Summary

CS Playground is a high-signal portfolio project with unusually strong practical framing around real database behavior. Its strongest assets are the consequence-driven UX, deterministic backend data generation, and visible query-performance instrumentation. The current repository state also contains concrete synchronization issues between query optimization markup, script, and smoke tests, which should be resolved before public resume distribution so that all demonstrated claims are verifiable during review.
