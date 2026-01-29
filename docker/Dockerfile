# Wiki Hub - TanStack Start Full-Stack Application
# Multi-stage build with Bun

# Stage 1: Dependencies
FROM oven/bun:1.1.34-alpine AS deps

WORKDIR /app

# Copy package files
COPY package.json bun.lock ./

# Install dependencies
RUN bun install --frozen-lockfile

# Stage 2: Builder
FROM oven/bun:1.1.34-alpine AS builder

WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy source code
COPY . .

# Build the application
RUN bun run build

# Stage 3: Production runner
FROM oven/bun:1.1.34-alpine AS runner

WORKDIR /app

# Copy built output
COPY --from=builder /app/.output ./.output
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Set environment
ENV NODE_ENV=production
ENV PORT=3000

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:3000/ || exit 1

# Expose port
EXPOSE 3000

# Start the application
CMD ["bun", ".output/server/index.mjs"]
