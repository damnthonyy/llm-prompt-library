# LLM Prompt Library

A mini **"Pinterest-for-prompts"** — save, search, tag-filter, and share your
favorite LLM prompts. Authenticated users get full CRUD over prompts plus
case-insensitive full-text search and one-click copy-to-clipboard.

## Stack

| Layer | Tech |
| --- | --- |
| Monorepo | pnpm workspaces + Turborepo |
| Language | TypeScript everywhere |
| Frontend | React + Vite + TailwindCSS + React Router |
| Backend | Express (REST) |
| Database | SQLite + Prisma |
| Auth | Email + password, bcrypt + JWT (httpOnly cookie) |
| Validation | zod schemas shared between client & server |
| Tests | Vitest + supertest |

## Repo layout

```
apps/
  api/      Express + Prisma REST API
  web/      React + Vite + Tailwind client
packages/
  shared/   zod schemas + types shared by api + web (single source of truth)
```

## Quick start

Requires **Node ≥ 20** and **pnpm 10** (`corepack enable`).

```bash
pnpm install
pnpm bootstrap   # creates .env files, applies migrations, seeds demo data
pnpm dev         # api → http://localhost:4000   web → http://localhost:5173
```

Then open http://localhost:5173 and log in with the seeded account:

> **demo@example.com** / **password123**

### Or with Docker

```bash
docker compose up --build      # web :5173, api :4000 (migrates + seeds on boot)
```

## Scripts

| Command | What |
| --- | --- |
| `pnpm dev` | Run api + web together (Turborepo) |
| `pnpm build` | Build all packages |
| `pnpm test` | Run the API test suite |
| `pnpm lint` / `pnpm typecheck` | Lint / type-check all workspaces |
| `pnpm format` | Prettier write |
| `pnpm db:migrate` / `db:seed` / `db:reset` | Prisma DB tasks |

## API

Base URL `http://localhost:4000`. Auth is a JWT in an httpOnly cookie.

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| POST | `/auth/register` | – | Create account, sets cookie |
| POST | `/auth/login` | – | Log in, sets cookie |
| POST | `/auth/logout` | – | Clear cookie |
| GET | `/auth/me` | ✓ | Current user |
| GET | `/prompts?q=&tag=&page=&limit=` | – | List (search, tag filter, pagination) |
| GET | `/prompts/:id` | – | One prompt |
| POST | `/prompts` | ✓ | Create (owned by caller) |
| PATCH | `/prompts/:id` | owner | Update |
| DELETE | `/prompts/:id` | owner | Delete |
| GET | `/tags` | – | Distinct tag list |

`GET /prompts` returns `{ data: Prompt[], meta: { page, limit, total, totalPages, hasNextPage } }`.

## Data model

```
User   { id, email, passwordHash, createdAt }
Prompt { id, title, body, tags[], authorId, createdAt, updatedAt }
```

## Design decisions & trade-offs

- **SQLite + Prisma** for zero-setup local dev; the schema is one line away from
  Postgres (tags would become a native `String[]`).
- **Tags as a JSON string** to stay within scope — search uses a quoted-substring
  match for exact tags; a relational `Tag`/`PromptTag` model is the first thing
  I'd add next.
- **JWT-in-cookie over magic-link** to avoid an email-provider dependency while
  keeping the token out of JS (httpOnly).
- **Shared zod package** so the API validates and the web infers types from one
  definition — the wire format can't drift.
- Browsing (list/detail) is **public**; create/update/delete require auth and
  ownership.

### With more time

Relational tags, optimistic UI + a data-fetching lib (React Query), rate
limiting, refresh tokens, social login, dark mode, and a deploy preview per PR.

## Workflow

Built issue-by-issue (see GitHub issues #1–#11, easy→hard). Each issue is a
`feat/<id>-…` branch → PR using `.github/pull_request_template.md` → review →
merge. The original brief is in `.claude/resume.md`.
