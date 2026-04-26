# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Farm Management System for Sharadha Reddy's Blueberry Farm — a full-stack dashboard with operations monitoring (zones, workers, tasks, inventory, finance, harvests). Hosted at `sharadha.neviai.ai`.

## Tech Stack

- **Client:** React 19 + TypeScript, Vite 8, TailwindCSS 4, React Router, TanStack Query & Table, Recharts, React Hook Form + Zod 3, Axios, react-i18next (EN + KN)
- **Server:** Express + TypeScript, Knex (query builder/migrations), better-sqlite3 (local) / PostgreSQL 16 (production via Neon), JWT auth + Google OAuth (`google-auth-library`), Pino logger
- **Testing:** Vitest for both client and server
- **Shared:** TypeScript types and constants in `Source/shared/`
- **PWA:** Manual implementation — `manifest.webmanifest` + `sw.js` + sharp-generated icons (no `vite-plugin-pwa`, incompatible with Vite 8)
- **Hosting:** Cloudflare Pages (client), Render (server Docker), Neon PostgreSQL (database)

## Commands

### Initial Setup
```bash
cd Source/server && npm install && npm run migrate && npm run seed
cd Source/client && npm install
```

### Client (`Source/client/`)
```bash
npm run dev        # Vite dev server on :5173
npm run build      # tsc + vite build
npm run lint       # ESLint (flat config v9)
npm run test       # Vitest (run once)
npm run test:watch # Vitest (watch mode)
```

### Server (`Source/server/`)
```bash
npm run dev              # tsx watch mode on :3001
npm run build            # tsc → dist/server/src/ (note: rootDir is "..")
npm run start            # node dist/server/src/index.js
npm run migrate          # knex migrate:latest
npm run migrate:rollback # knex migrate:rollback
npm run seed             # knex seed:run
npm run test             # Vitest (run once)
npm run test:watch       # Vitest (watch mode)
```

### Running a single test
```bash
# By file
npx vitest run src/__tests__/zones.test.ts

# By test name pattern
npx vitest run -t "creates a zone"
```

### Running migrations against Neon (production)
```bash
cd Source/server && DATABASE_URL="<neon-pooled-connection-string>" npx knex migrate:latest --knexfile knexfile.ts
```

### Docker (`Source/`)
```bash
docker-compose up   # PostgreSQL on :5433
```

## Architecture

**Monorepo** with three packages under `Source/`: `client`, `server`, `shared`.

**Backend layers:** Routes → Controllers → Services → Knex/DB. All routes are mounted under `/api` in `src/app.ts`. Zod validators in `src/validators/` are applied via `validate()` middleware which only validates `req.body`. Response helpers in `src/utils/apiResponse.ts` (`success()`, `paginated()`, `error()`) enforce the standard response envelope.

**Frontend patterns:** Pages in `src/pages/`, shared UI in `src/components/shared/`. All pages render inside `MainLayout` (sidebar + topbar), which is wrapped in `ProtectedRoute`. React Query manages server state (configured in `src/store/queryClient.ts`). Each API entity has its own file in `src/api/` using the shared Axios client (`src/api/axiosClient.ts`).

**Path aliases:** Both client and server use `@shared/*` → `../shared/` and `@/*` → `src/`.

**Auth:** JWT-based authentication enforced on all data routes. Flow:
- Server: `authenticate` middleware in `src/middleware/auth.ts` is applied to all routes in `src/routes/index.ts` except `/api/auth`.
- Client: `AuthContext` stores user/token state, `ProtectedRoute` in `App.tsx` redirects to `/login` if unauthenticated. Axios request interceptor attaches `Bearer` token; 401 responses auto-redirect to `/login`.
- **Public registration is disabled.** `POST /api/auth/register` requires JWT + admin role. Pre-provisioned admins: `sharadha` (password) and `sudhaanil` (Google). New users must be created by an admin or inserted directly into the `users` table.
- **Google Sign-In:** `POST /api/auth/google` verifies an ID token via `google-auth-library`. The user must already exist (no auto-create); first sign-in links `google_id`/`avatar_url`. Enabled when `VITE_GOOGLE_CLIENT_ID` (client) and `GOOGLE_CLIENT_ID` (server) are both set.
- Rate limiting: 100 req/15min for API, 20 req/15min for auth.
- CORS accepts comma-separated origins in `CORS_ORIGIN` env var.

**API format:** All responses follow `{ success, data, error? }` or paginated `{ success, data[], total, page, limit }`. API routes: `/api/auth`, `/api/zones`, `/api/workers`, `/api/tasks`, `/api/inventory`, `/api/transactions`, `/api/harvests`, `/api/dashboard`, `/api/subsidy-applications`.

**Database:** SQLite via better-sqlite3 for local dev (default when `DATABASE_URL` is not set). PostgreSQL when `DATABASE_URL` is set — both `knexfile.ts` and `src/config/db.ts` auto-detect. DB file at `Source/server/data/sharadha_farm.db`. 11 tables: zones, workers, tasks, inventory_items, transactions, harvests, users, subsidy_applications, subsidy_documents, subsidy_stage_events, plus FK indexes. Migrations numbered `001`–`010` in `src/migrations/`. **Migration `010` (NHB subsidy tables) has not yet been run on Neon — run it before exposing the subsidy UI.** Dashboard SQL uses helper functions (`monthExpr`, `dateAgo12Months`) that emit the correct SQL for both SQLite and PostgreSQL.

**i18n:** `react-i18next` configured in `src/i18n/index.ts` with two locales: English (`en`) and Kannada (`kn`). Language preference persists in `localStorage`. **Translation policy (Option C):** translate UI chrome only — never wrap dynamic data fields (`zone.name`, `worker.full_name`, etc.) in `t()`. DB schemas should NOT have `*_kn` columns. When adding new pages, add keys to both `locales/en.json` and `locales/kn.json` (KN with TODO markers is acceptable; user wants consultant-verified terminology).

**Mobile responsive:** `Sidebar` accepts `open`/`onClose` props and slides in as a drawer below `lg:` breakpoint; `MainLayout` owns the `sidebarOpen` state; `TopBar` shows a hamburger button on mobile.

**NHB Subsidy backend (mid-implementation):** Three tables track a 7-stage National Horticulture Board subsidy workflow. Routes at `/api/subsidy-applications` are wired and JWT-protected, but **no client UI exists yet**. Server-side load-bearing rule in `subsidy.service.ts`: cannot set `first_term_loan_release_date` without `goc_date`, and `advanceStage(5+)` requires `goc_date` — do NOT relax this, it's a real-world money rule. Deadline math is in TypeScript (`computeDeadlines`), not SQL, so it works on both SQLite and Postgres. Documents are auto-seeded (16 rows from `SUBSIDY_DOC_KEYS`) on application create and idempotently backfilled on `getById`.

**Shared types:** `Source/shared/types.ts` defines all entity interfaces, API response wrappers, and union string literal types. `Source/shared/constants.ts` provides matching `as const` arrays for enum-like values. Both client and server import from here — keep them in sync when adding fields.

**Build output:** Server `tsc` outputs to `dist/server/src/` (not `dist/`) because `tsconfig.json` has `rootDir: ".."` to include shared types. Entry point is `dist/server/src/index.js`.

## Deployment

- **Client:** Cloudflare Pages — build command `cd Source/client && npm install && npm run build`, output `Source/client/dist`
- **Server:** Render Docker — Dockerfile at `Source/server/Dockerfile`, root directory `Source`, runs migrations on startup
- **Database:** Neon PostgreSQL (free tier) — connection via `DATABASE_URL`
- **DNS:** `sharadha.neviai.ai` → Cloudflare Pages CNAME
- **Config:** `render.yaml` (Render Blueprint), `DEPLOY.md` (step-by-step guide)

## Environment Variables

### Server (`Source/server/.env`)
```
# DATABASE_URL=postgresql://...       # Uncomment for PostgreSQL; leave commented for SQLite
PORT=3001                              # Express port
CORS_ORIGIN=http://localhost:5173      # Comma-separated allowed origins
JWT_SECRET=dev-secret-change-in-production
```

### Client (Vite env)
```
VITE_API_BASE_URL=http://localhost:3001/api   # defaults to this if unset
VITE_GOOGLE_CLIENT_ID=...                     # optional; enables Google Sign-In button
```

### Server (additional, optional)
```
GOOGLE_CLIENT_ID=...   # must match VITE_GOOGLE_CLIENT_ID; enables /api/auth/google endpoint
```

## Key Conventions

- Full TypeScript strict mode in both client and server
- Zod v3 on client (required for `@hookform/resolvers` v3 compatibility) — do NOT upgrade to Zod v4
- Shared types/constants imported via `@shared/*` alias — keep interfaces in sync
- Knex migrations are TypeScript files using `Knex.Migration` exports
- Controllers return 404 for missing resources on `getById`/`update` endpoints
- Axios request interceptor attaches JWT token; response interceptor normalizes errors and redirects on 401
- All CRUD pages include `isError` UI state and disabled submit buttons during mutations
- Date fields in validators use Zod `.date()` for YYYY-MM-DD format enforcement
- DataTable generic constraint is `T extends { id: string }` — do NOT use `Record<string, unknown> & { id: string }` (TS interfaces lack implicit index signatures)
- `vite.config.ts` uses `defineConfig` from `vitest/config` (not `vite`) to support `test` property
- Tests in `src/__tests__/` (server) and `src/test/` (client) — run with `npm test`
- Service worker (`public/sw.js`): network-first for HTML, cache-first for hashed assets, **never cache `/api`** — bumping `CACHE_VERSION` invalidates old caches on deploy
