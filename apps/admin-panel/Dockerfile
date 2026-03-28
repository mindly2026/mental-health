# syntax=docker/dockerfile:1
FROM node:22-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@10.6.5 --activate

WORKDIR /app

# ── Install stage ──────────────────────────────────────────────────────────────
FROM base AS deps
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml .npmrc ./
COPY apps/admin-panel/package.json           ./apps/admin-panel/
COPY apps/backend/package.json               ./apps/backend/
COPY apps/client/package.json                ./apps/client/
COPY packages/contract/package.json          ./packages/contract/
COPY packages/auth/package.json              ./packages/auth/
COPY packages/db/package.json                ./packages/db/
COPY packages/domain/package.json            ./packages/domain/
COPY packages/design-system/package.json     ./packages/design-system/
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
    pnpm install --frozen-lockfile

# ── Dev stage ──────────────────────────────────────────────────────────────────
FROM deps AS dev
COPY . .
EXPOSE 1337
CMD ["pnpm", "--filter", "@mental-health/admin-panel", "dev"]
