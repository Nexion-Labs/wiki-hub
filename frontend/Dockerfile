# Frontend Dockerfile - React + Vite + Bun
# Multi-stage build: Build with Bun, Serve with Nginx

# Stage 1: Dependencies
FROM oven/bun:1.1.34-alpine AS deps

WORKDIR /app

# Copy package files
COPY package.json bun.lockb ./

# Install dependencies
RUN bun install --frozen-lockfile

# Stage 2: Builder
FROM oven/bun:1.1.34-alpine AS builder

WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy source code
COPY . .

# Build arguments for environment variables
ARG VITE_API_URL=http://localhost:3000/api
ENV VITE_API_URL=$VITE_API_URL

# Build the application
RUN bun run build

# Stage 3: Production runner with Nginx
FROM nginx:alpine AS runner

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:80/health || exit 1

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
