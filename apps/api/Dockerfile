# Build context is the repo root: docker build -f apps/api/Dockerfile .
FROM node:20-slim

# openssl is required by Prisma's query engine on Debian.
RUN apt-get update && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/*
RUN corepack enable

WORKDIR /app
COPY . .

# Install only the API and its workspace deps (skips the web app).
RUN pnpm install --frozen-lockfile --filter "@repo/api..."
RUN pnpm --filter @repo/api build

EXPOSE 4000

# Apply migrations + seed against the mounted volume, then start the server.
CMD ["sh", "-c", "pnpm --filter @repo/api db:deploy && pnpm --filter @repo/api db:seed && node apps/api/dist/index.js"]
