# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Farm Management System for Sharadha Reddy's Blueberry Farm — a full-stack dashboard with operations monitoring (zones, workers, tasks, inventory, finance, harvests).

## Tech Stack

- **Client:** React 19 + TypeScript, Vite, TailwindCSS 4, React Router, TanStack Query & Table, Recharts, React Hook Form + Zod, Axios
- **Server:** Express + TypeScript, Knex (query builder/migrations), better-sqlite3, Pino logger
- **Shared:** TypeScript types and constants in `Source/shared/`

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
```

### Server (`Source/server/`)
```bash
npm run dev              # tsx watch mode on :3001
npm run build            # tsc → dist/
npm run migrate          # knex migrate:latest
npm run migrate:rollback # knex migrate:rollback
npm run seed             # knex seed:run
```

### Docker (`Source/`)
```bash
docker-compose up   # PostgreSQL on :5433 (not wired into app yet)
```

## Architecture

**Monorepo** with three packages under `Source/`: `client`, `server`, `shared`.

**Backend layers:** Routes → Controllers → Services → Knex/DB. All routes are mounted under `/api` in `src/app.ts`. Zod validators in `src/validators/` are applied via `validate()` middleware which only validates `req.body`. Response helpers in `src/utils/apiResponse.ts` (`success()`, `paginated()`, `error()`) enforce the standard response envelope.

**Frontend patterns:** Pages in `src/pages/`, shared UI in `src/components/shared/`. All pages render inside `MainLayout` (sidebar + topbar). React Query manages server state (configured in `src/store/queryClient.ts`). Each API entity has its own file in `src/api/` using the shared Axios client (`src/api/axiosClient.ts`).

**Path aliases:** Both client and server use `@shared/*` → `../shared/` and `@/*` → `src/`.

**API format:** All responses follow `{ success, data, error? }` or paginated `{ success, data[], total, page, limit }`. API routes: `/api/zones`, `/api/workers`, `/api/tasks`, `/api/inventory`, `/api/transactions`, `/api/harvests`, `/api/dashboard`.

**Database:** SQLite via better-sqlite3 for local dev. DB file at `Source/server/data/sharadha_farm.db`. Both `knexfile.ts` and `src/config/db.ts` hardcode the SQLite client — PostgreSQL support (docker-compose exists) is not wired up yet. 6 tables: zones, workers, tasks, inventory_items, transactions, harvests. Migrations are numbered `001`–`007` in `src/migrations/` (007 adds indexes on foreign keys).

**Shared types:** `Source/shared/types.ts` defines all entity interfaces, API response wrappers, and union string literal types. `Source/shared/constants.ts` provides matching `as const` arrays for enum-like values. Both client and server import from here — keep them in sync when adding fields.

## Environment Variables

### Server (`Source/server/.env`)
```
PORT=3001                              # Express port
CORS_ORIGIN=http://localhost:5173      # Allowed CORS origin
```

### Client (Vite env)
```
VITE_API_BASE_URL=http://localhost:3001/api   # defaults to this if unset
```

## Key Conventions

- Full TypeScript strict mode in both client and server
- Shared types/constants imported via `@shared/*` alias — keep interfaces in sync
- Knex migrations are TypeScript files using `Knex.Migration` exports
- Controllers return 404 for missing resources on `getById`/`update` endpoints
- Axios response interceptor in `axiosClient.ts` normalizes error messages from the API
- All CRUD pages include `isError` UI state and disabled submit buttons during mutations
- Date fields in validators use Zod `.date()` for YYYY-MM-DD format enforcement
- No auth layer currently exists
- No test framework is set up yet
