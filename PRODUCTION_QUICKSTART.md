# Production Quick Start - Unified Image

Get your Wiki-Bun application running in production with a single Docker image in 5 minutes.

## 🚀 Quick Start (3 Commands)

```bash
# 1. Configure environment
cp .env.prod.example .env.prod
nano .env.prod  # Update passwords and secrets

# 2. Build production image
make prod-build

# 3. Start production
make prod-up
```

**Access:** http://localhost:3000

---

## 📝 Before You Start

### Update .env.prod

```bash
# ⚠️ MUST CHANGE THESE:
DB_PASSWORD=your-secure-password-here
JWT_SECRET=your-long-random-secret-here

# Generate secure values:
openssl rand -base64 32  # For JWT_SECRET
openssl rand -base64 24  # For DB_PASSWORD
```

---

## 🎯 Commands

### Production Operations

```bash
# Build
make prod-build          # Build unified image

# Start/Stop
make prod-up             # Start production
make prod-down           # Stop production
make prod-restart        # Restart all services

# Monitoring
make prod-logs           # View logs
make prod-ps             # List containers

# Database
make prod-migrate        # Run migrations
make prod-seed           # Seed database
make prod-backup         # Backup database

# Access
make prod-shell          # Access app shell
```

---

## 🏗️ What You Get

### Single Unified Container

```
┌─────────────────────────────┐
│    wiki-app-prod            │
│    Port: 3000               │
│                             │
│  ┌────────────────────────┐│
│  │ Frontend (React)       ││
│  │ /*, /login, /admin, etc││
│  └────────────────────────┘│
│  ┌────────────────────────┐│
│  │ Backend (Bun + Elysia) ││
│  │ /api/*, /health        ││
│  └────────────────────────┘│
│                             │
│  Size: ~220 MB              │
└──────────┬──────────────────┘
           │
           ▼
┌─────────────────────────────┐
│    wiki-database-prod       │
│    Port: 5432               │
│    Size: ~250 MB            │
└─────────────────────────────┘
```

### Benefits

✅ Single image to deploy
✅ Single port to configure (3000)
✅ Simpler reverse proxy setup
✅ Frontend + Backend in one container
✅ SPA routing handled automatically

---

## 📊 Access Points

```
http://localhost:3000/          → Frontend (React app)
http://localhost:3000/api       → Backend API
http://localhost:3000/health    → Health check
```

---

## 🔧 Configuration

### Essential Settings (.env.prod)

```bash
# Application
APP_PORT=3000

# Database
DB_NAME=wikidb
DB_USER=postgres
DB_PASSWORD=change-me  # ⚠️ CHANGE THIS

# Security
JWT_SECRET=change-me   # ⚠️ CHANGE THIS (32+ chars)
JWT_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=*          # Use specific domain in production

# API URL (relative path)
VITE_API_URL=/api
```

---

## 🚢 Production Deployment

### Local Testing

```bash
# 1. Build and run locally
make prod-build
make prod-up

# 2. Test
curl http://localhost:3000/health
curl http://localhost:3000/api

# 3. Stop when done
make prod-down
```

### Deploy to Server

```bash
# Option 1: Direct deployment
scp -r . user@server:/app
ssh user@server "cd /app && ./scripts/build-prod.sh && ./scripts/run-prod.sh"

# Option 2: Docker Registry
docker tag wiki-app:latest registry.io/wiki-app:1.0.0
docker push registry.io/wiki-app:1.0.0
# On server:
docker pull registry.io/wiki-app:1.0.0
docker compose -f docker-compose.prod.yml up -d
```

---

## 🔐 Reverse Proxy

### Nginx

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### Caddy

```caddy
yourdomain.com {
    reverse_proxy localhost:3000
}
```

### SSL with Let's Encrypt

```bash
sudo certbot --nginx -d yourdomain.com
```

---

## 📈 Monitoring

### Check Health

```bash
# Application health
curl http://localhost:3000/health

# Container status
make prod-ps

# Resource usage
docker stats wiki-app-prod
```

### View Logs

```bash
# All logs
make prod-logs

# Last 50 lines
docker compose -f docker-compose.prod.yml logs --tail=50

# Follow logs
docker compose -f docker-compose.prod.yml logs -f app
```

---

## 💾 Backup

### Create Backup

```bash
# Backup database
make prod-backup

# Output: backups/prod_backup_YYYYMMDD_HHMMSS.sql
```

### Restore Backup

```bash
cat backups/prod_backup_20260127_120000.sql | \
  docker compose -f docker-compose.prod.yml exec -T database \
  psql -U postgres -d wikidb
```

---

## 🔄 Updates

### Update Application

```bash
# 1. Pull latest code
git pull

# 2. Rebuild image
make prod-build

# 3. Restart
make prod-down
make prod-up

# 4. Run migrations
make prod-migrate
```

---

## 🐛 Troubleshooting

### Services Won't Start

```bash
# Check logs
make prod-logs

# Check what's using port
sudo lsof -i :3000

# Try clean start
make prod-down
make prod-up
```

### Database Issues

```bash
# Check database logs
docker compose -f docker-compose.prod.yml logs database

# Access database
docker compose -f docker-compose.prod.yml exec database psql -U postgres -d wikidb

# Reset database (⚠️ deletes data)
make prod-down
docker volume rm wiki-bun_postgres_data_prod
make prod-up
make prod-migrate
```

### Frontend Not Loading

```bash
# Check if static files exist
docker compose -f docker-compose.prod.yml exec app ls -la /app/public

# Rebuild if missing
make prod-build
docker compose -f docker-compose.prod.yml up -d --force-recreate
```

---

## ✅ Production Checklist

Before going live:

- [ ] Updated `.env.prod` with secure values
- [ ] Changed DB_PASSWORD (use `openssl rand -base64 24`)
- [ ] Changed JWT_SECRET (use `openssl rand -base64 32`)
- [ ] Set CORS_ORIGIN to your domain
- [ ] Configured reverse proxy with SSL
- [ ] Tested backup and restore
- [ ] Set up monitoring/alerting
- [ ] Documented deployment process

---

## 📚 More Information

- **Full Guide**: `PRODUCTION_DEPLOYMENT.md`
- **Docker Guide**: `DOCKER_DEPLOYMENT.md`
- **Quick Reference**: `README_DOCKER.md`

---

## 🎯 Common Workflows

### Daily Operations

```bash
# Check health
curl http://localhost:3000/health

# View logs
make prod-logs

# Backup database
make prod-backup
```

### Maintenance

```bash
# Update application
git pull
make prod-build
make prod-restart
make prod-migrate

# View resource usage
docker stats wiki-app-prod
```

### Emergency

```bash
# Restart everything
make prod-restart

# Check logs for errors
make prod-logs

# Restore from backup
cat backups/latest.sql | docker compose -f docker-compose.prod.yml exec -T database psql -U postgres -d wikidb
```

---

**Status**: ✅ Production Ready
**Version**: 1.0.0
**Build Time**: ~2-3 minutes
**Image Size**: ~220 MB (app) + ~250 MB (database)
**Startup Time**: ~15-20 seconds
