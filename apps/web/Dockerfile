# Build context is the repo root: docker build -f apps/web/Dockerfile .
FROM node:20-slim

RUN corepack enable
WORKDIR /app
COPY . .

# Install only the web app and its workspace deps (skips the API/Prisma).
RUN pnpm install --frozen-lockfile --filter "@repo/web..."

# VITE_API_URL is inlined at build time; the browser calls the API on the host.
ARG VITE_API_URL=http://localhost:4000
ENV VITE_API_URL=$VITE_API_URL
RUN pnpm --filter @repo/web build

EXPOSE 5173
CMD ["pnpm", "--filter", "@repo/web", "preview", "--host", "0.0.0.0", "--port", "5173"]
