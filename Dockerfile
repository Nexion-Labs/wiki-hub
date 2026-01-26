# Unified Production Dockerfile
# Builds both Frontend and Backend into a single image
# Backend serves the frontend static files

# ============================================
# Stage 1: Build Frontend
# ============================================
FROM oven/bun:1.1.34-alpine AS frontend-builder

WORKDIR /app/frontend

# Copy frontend package files
COPY frontend/package.json frontend/bun.lockb* ./

# Install frontend dependencies
RUN bun install --frozen-lockfile

# Copy frontend source
COPY frontend/ ./

# Build arguments for frontend
ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL

# Build frontend
RUN bun run build

# ============================================
# Stage 2: Build Backend Dependencies
# ============================================
FROM oven/bun:1.1.34-alpine AS backend-deps

WORKDIR /app/backend

# Copy backend package files
COPY backend/package.json backend/bun.lockb* ./

# Install production dependencies only
RUN bun install --frozen-lockfile --production

# ============================================
# Stage 3: Final Production Image
# ============================================
FROM oven/bun:1.1.34-alpine AS production

WORKDIR /app

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 bunuser && \
    mkdir -p /app/public && \
    chown -R bunuser:nodejs /app

# Copy backend production dependencies
COPY --from=backend-deps --chown=bunuser:nodejs /app/backend/node_modules ./node_modules

# Copy backend source code
COPY --chown=bunuser:nodejs backend/src ./src
COPY --chown=bunuser:nodejs backend/package.json ./
COPY --chown=bunuser:nodejs backend/healthcheck.ts ./

# Copy built frontend to public directory
COPY --from=frontend-builder --chown=bunuser:nodejs /app/frontend/dist ./public

# Set environment
ENV NODE_ENV=production
ENV PORT=3000

# Expose port
EXPOSE 3000

# Switch to non-root user
USER bunuser

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD bun run healthcheck || exit 1

# Start application
CMD ["bun", "run", "src/index.ts"]
