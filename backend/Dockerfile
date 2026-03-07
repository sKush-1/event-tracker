# ── Stage 1: build ──────────────────────────────────────────────────
FROM node:22-alpine AS builder

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy manifests and install ALL deps (including dev for tsc)
COPY package.json pnpm-lock.yaml ./
RUN pnpm install

# Copy source and Prisma config
COPY tsconfig.json nodemon.json prisma.config.ts ./
COPY prisma ./prisma
COPY src ./src

# Generate Prisma client
RUN pnpm db:generate

# Compile TypeScript
RUN pnpm build

# ── Stage 2: production image ────────────────────────────────────────
FROM node:22-alpine AS runner

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy manifests and install PRODUCTION deps only
COPY package.json pnpm-lock.yaml ./
# Allow prisma build scripts so the engines are available at runtime
RUN pnpm install --prod --config.onlyBuiltDependencies="@prisma/engines,prisma"

# Copy compiled output and generated Prisma client from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src/generated ./src/generated

# Copy Prisma schema + config so migrations can run
COPY prisma.config.ts ./
COPY prisma ./prisma

# Non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

EXPOSE 5000

CMD ["node", "dist/index.js"]
