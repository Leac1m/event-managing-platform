# Base stage for shared dependencies and configuration
FROM node:22-bookworm-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV npm_config_nodedir="/usr/local/include/node"
RUN corepack enable
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends python3 make g++ && rm -rf /var/lib/apt/lists/*
COPY . .

# Build stage
FROM base AS build
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm run build

# Production stage
FROM node:22-bookworm-slim AS prod
WORKDIR /app
ENV npm_config_nodedir="/usr/local/include/node"
RUN apt-get update && apt-get install -y --no-install-recommends python3 make g++ && rm -rf /var/lib/apt/lists/*

# Copy necessary files for pnpm install
COPY --from=build /app/package.json /app/pnpm-workspace.yaml /app/pnpm-lock.yaml ./
COPY --from=build /app/packages/backend/package.json ./packages/backend/
COPY --from=build /app/packages/frontend/package.json ./packages/frontend/

# Enable corepack and install prod deps
RUN corepack enable
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod --frozen-lockfile

# Copy built artifacts
COPY --from=build /app/packages/backend/dist ./packages/backend/dist
COPY --from=build /app/packages/frontend/dist ./packages/frontend/dist

EXPOSE 3001
ENV PORT=3001
CMD ["node", "packages/backend/dist/index.js"]
