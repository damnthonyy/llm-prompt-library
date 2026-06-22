# LLM Prompt Library

A mini **"Pinterest-for-prompts"** — save, search, tag-filter, and share your
favorite LLM prompts. Authenticated users get full CRUD over prompts plus
case-insensitive full-text search and one-click copy-to-clipboard.

> Status: in active development. See the [build plan](#roadmap) below.

## Stack

| Layer | Tech |
| --- | --- |
| Monorepo | pnpm workspaces + Turborepo |
| Language | TypeScript everywhere |
| Frontend | React + Vite + TailwindCSS |
| Backend | Express (REST) |
| Database | SQLite + Prisma |
| Auth | Email + password, bcrypt + JWT (httpOnly cookie) |

## Repo layout

```
apps/
  api/     Express + Prisma REST API
  web/     React + Vite + Tailwind client
packages/
  shared/  Types/DTOs shared by api + web
```

## Getting started

```bash
pnpm install
pnpm dev      # runs api + web together via Turborepo
```

## Roadmap

Built issue-by-issue via feature branches → PRs into `main`. See
`.claude/resume.md` for the original challenge brief.

## Contributing workflow

Each issue is implemented on a `feat/<id>-short-description` branch, opened as a
PR against `main` using the PR template, and merged after review.
