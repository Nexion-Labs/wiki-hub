# Production Deployment - Unified Image

Complete guide for building and deploying the Wiki-Bun application as a single unified Docker image.

## 📋 Overview

This deployment strategy combines frontend and backend into **one Docker image** for simplified production deployment:

- **Frontend**: Built with Vite and bundled as static files
- **Backend**: Bun + Elysia serving both API and static frontend files
- **Single Port**: Application runs on port 3000 (configurable)
- **Simplified Deployment**: Only 2 containers (app + database)

---

## 🏗️ Architecture

### Unified Container Architecture

```
┌─────────────────────────────────────────────────────┐
│                  Docker Host                         │
│                                                       │
│  ┌──────────────────────────────────────────────┐  │
│  │         Unified App Container                 │  │
│  │         Port: 3000                            │  │
│  │                                                │  │
│  │  ┌──────────────────────────────────────┐   │  │
│  │  │      Bun Runtime (Alpine)            │   │  │
│  │  │                                        │   │  │
│  │  │  ┌─────────────┐  ┌────────────────┐ │   │  │
│  │  │  │ Static Files│  │  Elysia API    │ │   │  │
│  │  │  │ (Frontend)  │  │  (Backend)     │ │   │  │
│  │  │  │             │  │                │ │   │  │
│  │  │  │ React Build │◄─┤ /api/* routes │ │   │  │
│  │  │  │ index.html  │  │ /health        │ │   │  │
│  │  │  │ assets/*    │  │                │ │   │  │
│  │  │  └─────────────┘  └────────────────┘ │   │  │
│  │  │                                        │   │  │
│  │  │  SPA Routing: /* → index.html        │   │  │
│  │  └────────────────────────────────────────┘   │  │
│  │                                                │  │
│  │  Size: ~220 MB                                │  │
│  └────────────────┬───────────────────────────────┘  │
│                   │ PostgreSQL                        │
│                   ▼                                   │
│  ┌──────────────────────────────────────────────┐  │
│  │    PostgreSQL 16 (Alpine)                    │  │
│  │    Port: 5432                                 │  │
│  │    Volume: Persistent                        │  │
│  │    Size: ~250 MB                             │  │
│  └──────────────────────────────────────────────┘  │
│                                                       │
│  Total: 2 containers, ~470 MB                       │
└─────────────────────────────────────────────────────┘
```

### Request Flow

```
Client Request
     │
     ▼
Port 3000 (Unified App)
     │
     ├─→ /api/* ──────→ Elysia Backend ──→ Database
     │
     ├─→ /health ─────→ Health Check Endpoint
     │
     └─→ /* ──────────→ Static Files (Frontend)
                        └─→ SPA Routing (index.html)
```

---

## 🚀 Quick Start

### One-Command Production Build & Run

```bash
# 1. Build production image
make prod-build

# 2. Start production environment
make prod-up
```

**Access your app:** http://localhost:3000

### Manual Steps

```bash
# 1. Create production environment file
cp .env.prod.example .env.prod
nano .env.prod  # Update with your settings

# 2. Build the unified image
./scripts/build-prod.sh

# 3. Start production environment
./scripts/run-prod.sh

# 4. Check status
docker compose -f docker-compose.prod.yml ps
```

---

## ⚙️ Configuration

### Environment Variables (.env.prod)

```bash
# Database
DB_NAME=wikidb
DB_USER=postgres
DB_PASSWORD=your-secure-password-here  # ⚠️ CHANGE THIS!
DB_PORT=5432

# Application
APP_PORT=3000  # Single port for frontend + backend

# Backend
JWT_SECRET=your-long-random-secret-here  # ⚠️ CHANGE THIS!
JWT_EXPIRES_IN=7d

# CORS (use * for development, specific domain for production)
CORS_ORIGIN=*
# Production example:
# CORS_ORIGIN=https://yourdomain.com

# Frontend API URL (relative since same container)
VITE_API_URL=/api
```

### Generate Secure Secrets

```bash
# JWT Secret (minimum 32 characters)
openssl rand -base64 32

# Database Password
openssl rand -base64 24
```

---

## 🔨 Building the Image

### Build with Script

```bash
./scripts/build-prod.sh
```

### Build with Make

```bash
make prod-build
```

### Manual Build

```bash
docker build \
  --build-arg VITE_API_URL=/api \
  -t wiki-app:latest \
  -t wiki-app:$(date +%Y%m%d_%H%M%S) \
  -f Dockerfile \
  .
```

### Build Process

The Dockerfile uses multi-stage build:

1. **Stage 1: Frontend Builder**
   - Uses `oven/bun:1.1.34-alpine`
   - Installs frontend dependencies
   - Builds React app with Vite
   - Output: `dist/` directory

2. **Stage 2: Backend Dependencies**
   - Uses `oven/bun:1.1.34-alpine`
   - Installs production dependencies only
   - No dev dependencies in final image

3. **Stage 3: Final Production Image**
   - Combines backend code + dependencies
   - Copies built frontend to `public/` directory
   - Configures non-root user
   - Sets up health checks
   - Final size: ~220 MB

---

## 🏃 Running in Production

### Start with Script

```bash
./scripts/run-prod.sh
```

### Start with Make

```bash
make prod-up
```

### Manual Start

```bash
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d
docker compose -f docker-compose.prod.yml --env-file .env.prod exec app bun run db:migrate
```

### Access Points

- **Application**: http://localhost:3000
- **API**: http://localhost:3000/api
- **Health Check**: http://localhost:3000/health

---

## 📊 Operations

### View Logs

```bash
# All logs
make prod-logs

# Or manually
docker compose -f docker-compose.prod.yml --env-file .env.prod logs -f

# App logs only
docker compose -f docker-compose.prod.yml --env-file .env.prod logs -f app

# Last 100 lines
docker compose -f docker-compose.prod.yml --env-file .env.prod logs --tail=100
```

### Check Status

```bash
# Container status
make prod-ps

# Health check
curl http://localhost:3000/health

# Resource usage
docker stats wiki-app-prod wiki-database-prod
```

### Shell Access

```bash
# Access app container
make prod-shell

# Or manually
docker compose -f docker-compose.prod.yml --env-file .env.prod exec app sh

# Access database
docker compose -f docker-compose.prod.yml --env-file .env.prod exec database psql -U postgres -d wikidb
```

### Database Operations

```bash
# Run migrations
make prod-migrate

# Seed database
make prod-seed

# Backup database
make prod-backup

# Restore database
cat backups/prod_backup_20260127_120000.sql | \
  docker compose -f docker-compose.prod.yml --env-file .env.prod exec -T database \
  psql -U postgres -d wikidb
```

### Restart Services

```bash
# Restart all
make prod-restart

# Restart app only
docker compose -f docker-compose.prod.yml --env-file .env.prod restart app

# Restart database only
docker compose -f docker-compose.prod.yml --env-file .env.prod restart database
```

### Stop Services

```bash
# Stop with script
./scripts/stop-prod.sh

# Stop with make
make prod-down

# Stop and remove volumes (⚠️ deletes data)
docker compose -f docker-compose.prod.yml --env-file .env.prod down -v
```

---

## 🚢 Deployment to Server

### Option 1: Direct Deployment

```bash
# 1. Copy files to server
scp -r . user@server:/path/to/app

# 2. SSH to server
ssh user@server

# 3. Build and run
cd /path/to/app
./scripts/build-prod.sh
./scripts/run-prod.sh
```

### Option 2: Docker Registry

```bash
# 1. Tag for registry
docker tag wiki-app:latest registry.example.com/wiki-app:1.0.0

# 2. Push to registry
docker login registry.example.com
docker push registry.example.com/wiki-app:1.0.0

# 3. On server, update docker-compose.prod.yml
services:
  app:
    image: registry.example.com/wiki-app:1.0.0
    # ... rest of config

# 4. Pull and run on server
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d
```

### Option 3: CI/CD Pipeline

Example GitHub Actions workflow:

```yaml
name: Deploy Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Build image
        run: |
          docker build -t wiki-app:latest .

      - name: Push to registry
        run: |
          docker tag wiki-app:latest ${{ secrets.REGISTRY }}/wiki-app:${{ github.sha }}
          docker push ${{ secrets.REGISTRY }}/wiki-app:${{ github.sha }}

      - name: Deploy to server
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.HOST }}
          username: ${{ secrets.USERNAME }}
          key: ${{ secrets.SSH_KEY }}
          script: |
            cd /app
            docker compose pull
            docker compose up -d
            docker compose exec app bun run db:migrate
```

---

## 🔐 Production Security

### Container Security

✅ **Non-root User**
```dockerfile
USER bunuser  # UID 1001
```

✅ **Minimal Base Image**
```dockerfile
FROM oven/bun:1.1.34-alpine  # ~40 MB base
```

✅ **No Dev Dependencies**
```dockerfile
RUN bun install --frozen-lockfile --production
```

✅ **Health Checks**
```yaml
healthcheck:
  test: ["CMD", "bun", "run", "healthcheck"]
  interval: 30s
```

### Application Security

1. **Strong Secrets**
   ```bash
   # Use 32+ character secrets
   JWT_SECRET=$(openssl rand -base64 32)
   DB_PASSWORD=$(openssl rand -base64 24)
   ```

2. **CORS Configuration**
   ```bash
   # Development
   CORS_ORIGIN=*

   # Production
   CORS_ORIGIN=https://yourdomain.com
   ```

3. **Environment Variables**
   - Never commit `.env.prod`
   - Use secrets management (Docker secrets, Vault, etc.)
   - Rotate secrets regularly

4. **Database Security**
   - Change default passwords
   - Use strong passwords
   - Limit network exposure
   - Regular backups

### Network Security

```yaml
# Internal network isolation
networks:
  wiki-network-prod:
    driver: bridge
```

Only expose necessary ports:
- App: 3000 (can be behind reverse proxy)
- Database: 5432 (only for direct access, can be removed)

---

## 🔧 Reverse Proxy Setup

### Nginx Configuration

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # Proxy to application
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Caddy Configuration

```caddy
yourdomain.com {
    reverse_proxy localhost:3000
}
```

### SSL with Let's Encrypt

```bash
# Install certbot
sudo apt-get install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d yourdomain.com

# Auto-renewal (already configured by certbot)
sudo systemctl status certbot.timer
```

---

## 📈 Monitoring & Performance

### Health Monitoring

```bash
# Check application health
curl http://localhost:3000/health

# Expected response:
# {"success":true,"data":{"status":"ok","timestamp":"2026-01-27T..."}}

# Check database health
docker compose -f docker-compose.prod.yml exec database pg_isready -U postgres
```

### Performance Metrics

```bash
# Container resource usage
docker stats wiki-app-prod

# Disk usage
docker system df

# Image sizes
docker images | grep wiki
```

### Log Management

```bash
# View logs with timestamps
docker compose -f docker-compose.prod.yml logs -t

# Save logs to file
docker compose -f docker-compose.prod.yml logs > app-logs-$(date +%Y%m%d).log

# Rotate logs (configure in Docker daemon)
# /etc/docker/daemon.json
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
```

---

## 🔄 Updates & Rollback

### Update Application

```bash
# 1. Build new image
./scripts/build-prod.sh

# 2. Tag with version
docker tag wiki-app:latest wiki-app:v1.1.0

# 3. Stop current version
./scripts/stop-prod.sh

# 4. Start new version
./scripts/run-prod.sh

# 5. Run migrations if needed
make prod-migrate
```

### Rollback

```bash
# 1. Stop current version
./scripts/stop-prod.sh

# 2. Update docker-compose to use old version
services:
  app:
    image: wiki-app:v1.0.0  # Previous version

# 3. Start old version
./scripts/run-prod.sh
```

---

## 💾 Backup & Recovery

### Automated Backups

```bash
# Create backup script
cat > /usr/local/bin/backup-wiki.sh << 'EOF'
#!/bin/bash
cd /path/to/app
make prod-backup
# Upload to S3, rsync to backup server, etc.
EOF

chmod +x /usr/local/bin/backup-wiki.sh

# Add to cron (daily at 2 AM)
crontab -e
0 2 * * * /usr/local/bin/backup-wiki.sh
```

### Manual Backup

```bash
# Backup database
make prod-backup

# Backup volumes
docker run --rm \
  -v wiki-bun_postgres_data_prod:/data \
  -v $(pwd)/backups:/backup \
  alpine tar czf /backup/volume-backup-$(date +%Y%m%d).tar.gz /data
```

### Restore

```bash
# Restore database
cat backups/prod_backup_20260127_120000.sql | \
  docker compose -f docker-compose.prod.yml exec -T database \
  psql -U postgres -d wikidb

# Restore volume
docker run --rm \
  -v wiki-bun_postgres_data_prod:/data \
  -v $(pwd)/backups:/backup \
  alpine tar xzf /backup/volume-backup-20260127.tar.gz -C /
```

---

## 🐛 Troubleshooting

### Container Won't Start

```bash
# Check logs
make prod-logs

# Check container status
docker compose -f docker-compose.prod.yml ps

# Inspect container
docker inspect wiki-app-prod

# Try starting without detached mode
docker compose -f docker-compose.prod.yml up
```

### Database Connection Issues

```bash
# Check database is running
docker compose -f docker-compose.prod.yml ps database

# Check connection from app
docker compose -f docker-compose.prod.yml exec app sh
> env | grep DATABASE_URL
> ping database

# Check database logs
docker compose -f docker-compose.prod.yml logs database
```

### Static Files Not Serving

```bash
# Check if files exist in container
docker compose -f docker-compose.prod.yml exec app ls -la /app/public

# Check if index.html exists
docker compose -f docker-compose.prod.yml exec app cat /app/public/index.html

# Rebuild image if files missing
make prod-build
docker compose -f docker-compose.prod.yml up -d --force-recreate
```

### Port Already in Use

```bash
# Find what's using the port
sudo lsof -i :3000

# Change port in .env.prod
APP_PORT=3001

# Restart services
make prod-down
make prod-up
```

---

## ✅ Production Checklist

Before going live:

### Security
- [ ] Strong JWT_SECRET (32+ characters)
- [ ] Strong DB_PASSWORD
- [ ] CORS_ORIGIN set to specific domain
- [ ] SSL/TLS configured
- [ ] Firewall rules configured
- [ ] Regular security updates scheduled

### Performance
- [ ] Health checks enabled
- [ ] Log rotation configured
- [ ] Resource limits set (if needed)
- [ ] CDN configured for static assets (optional)

### Reliability
- [ ] Automated backups configured
- [ ] Backup restoration tested
- [ ] Monitoring setup
- [ ] Alerting configured
- [ ] Rollback plan documented

### Operations
- [ ] Documentation updated
- [ ] Team trained on deployment
- [ ] CI/CD pipeline configured (optional)
- [ ] Runbook created for common issues

---

## 📊 Performance Metrics

### Image Sizes
- Unified App: ~220 MB
- Database: ~250 MB
- **Total**: ~470 MB

### Build Times
- Initial build: ~2-3 minutes
- Rebuild (with cache): ~30-60 seconds

### Startup Times
- Database: ~5-10 seconds
- Application: ~5-10 seconds
- **Total**: ~15-20 seconds

### Memory Usage
- Application: ~150-200 MB
- Database: ~50-100 MB
- **Total**: ~200-300 MB

---

## 🎯 Summary

### Benefits of Unified Image

✅ **Simpler Deployment**: Single image to manage
✅ **Reduced Complexity**: No separate frontend container
✅ **Single Port**: Easier to configure reverse proxy
✅ **Faster Builds**: Shared caching between stages
✅ **Lower Memory**: Fewer containers running
✅ **SPA Routing**: Handled automatically by backend

### When to Use

Use this approach when:
- You want simplified deployment
- You don't need to scale frontend/backend separately
- You want to reduce infrastructure complexity
- You prefer single-port configuration

### Alternative Approach

If you need separate frontend/backend scaling, use:
- `docker-compose.yml` (separate containers)
- Frontend: Nginx serving static files
- Backend: Bun API server
- See `DOCKER_DEPLOYMENT.md` for details

---

**Created**: January 2026
**Last Updated**: January 27, 2026
**Version**: 1.0.0
**Status**: ✅ Production Ready
