# Base stage for shared dependencies and configuration
FROM node:20-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
WORKDIR /app
COPY . .

# Build stage
FROM base AS build
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm --filter backend exec tsc
RUN pnpm --filter frontend run build

# Production stage
FROM node:20-alpine AS prod
WORKDIR /app

# Copy necessary files for pnpm install
COPY --from=build /app/package.json /app/pnpm-workspace.yaml /app/pnpm-lock.yaml ./
COPY --from=build /app/packages/backend/package.json ./packages/backend/

# Enable corepack and install prod deps
RUN corepack enable
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod --frozen-lockfile

# Copy built artifacts
COPY --from=build /app/packages/backend/dist ./packages/backend/dist
COPY --from=build /app/packages/frontend/dist ./packages/frontend/dist

EXPOSE 3001
ENV PORT=3001
CMD ["node", "packages/backend/dist/index.js"]
