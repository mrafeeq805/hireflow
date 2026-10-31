# Multi-stage Production Dockerfile for HireFlow
FROM node:20-alpine AS builder

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache python3 make g++

# Copy package manifests
COPY package.json package-lock.json ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/

# Install all monorepo dependencies
RUN npm ci

# Copy full source tree
COPY . .

# 1. Build shared library
RUN npm run build:shared

# 2. Build web frontend
RUN npm run build:web

# 3. Switch Prisma to PostgreSQL and generate client
WORKDIR /app/apps/api
RUN node scripts/use-db.js postgres
RUN npx prisma generate

# 4. Build API TypeScript
RUN npm run build

# ==========================================
# Runner Stage
# ==========================================
FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=5000

# Install runtime dependencies
RUN apk add --no-cache openssl

# Copy package manifests for production install
COPY package.json package-lock.json ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/

# Install production dependencies only
RUN npm ci --omit=dev

# Copy built artifacts from builder
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/prisma ./apps/api/prisma
COPY --from=builder /app/apps/api/scripts ./apps/api/scripts
COPY --from=builder /app/apps/web/dist ./apps/web/dist

# Generate production Prisma Client
WORKDIR /app/apps/api
RUN npx prisma generate

# Create directory for file uploads
RUN mkdir -p /app/apps/api/uploads

WORKDIR /app

EXPOSE 5000

# Entrypoint runs migrations, optional seed, and starts server
CMD ["sh", "-c", "cd apps/api && npx prisma db push && node dist/server.js"]

