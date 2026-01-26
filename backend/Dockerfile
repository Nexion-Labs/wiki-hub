# Backend Dockerfile - Bun + Elysia API
# Multi-stage build for optimized production image

# Stage 1: Dependencies
FROM oven/bun:1.1.34-alpine AS deps

WORKDIR /app

# Copy package files
COPY package.json bun.lockb ./

# Install production dependencies only
RUN bun install --frozen-lockfile --production

# Stage 2: Builder
FROM oven/bun:1.1.34-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json bun.lockb ./

# Install all dependencies (including dev)
RUN bun install --frozen-lockfile

# Copy source code
COPY . .

# Build the application (if there's a build step)
# For Elysia/Bun, typically no build needed, but including for completeness
# RUN bun run build

# Stage 3: Runner
FROM oven/bun:1.1.34-alpine AS runner

# Set working directory
WORKDIR /app

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 bunuser

# Copy production dependencies from deps stage
COPY --from=deps --chown=bunuser:nodejs /app/node_modules ./node_modules

# Copy application code from builder
COPY --from=builder --chown=bunuser:nodejs /app/src ./src
COPY --from=builder --chown=bunuser:nodejs /app/package.json ./

# Set environment to production
ENV NODE_ENV=production

# Expose the port the app runs on
EXPOSE 3000

# Switch to non-root user
USER bunuser

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD bun run healthcheck || exit 1

# Start the application
CMD ["bun", "run", "src/index.ts"]
