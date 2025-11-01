# Multi-stage build for Helium-Manus Integration Platform
# Author: Jonathan Sherman

# Stage 1: Dependencies
FROM node:22-alpine AS deps
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm@latest
RUN pnpm install --frozen-lockfile

# Stage 2: Builder
FROM node:22-alpine AS builder
WORKDIR /app

# Copy dependencies
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build client and server
ENV NODE_ENV=production
RUN npm install -g pnpm@latest
RUN pnpm build:client

# Stage 3: Runner
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 helium

# Copy built application
COPY --from=builder --chown=helium:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=helium:nodejs /app/package.json ./package.json
COPY --from=builder --chown=helium:nodejs /app/client/dist ./client/dist
COPY --from=builder --chown=helium:nodejs /app/server ./server
COPY --from=builder --chown=helium:nodejs /app/drizzle ./drizzle
COPY --from=builder --chown=helium:nodejs /app/shared ./shared
COPY --from=builder --chown=helium:nodejs /app/storage ./storage

# Switch to non-root user
USER helium

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start application
CMD ["node", "server/_core/index.js"]
