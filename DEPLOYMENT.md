# Deployment Guide

## Quick Start (Development)

### Option 1: Docker Compose (Recommended)

```bash
# 1. Start all services with Docker
cd docker
docker-compose up -d

# 2. Wait for services to start (about 30 seconds)
# Check logs
docker-compose logs -f

# 3. Run database migrations
docker exec -it wiki-backend bun run db:migrate

# 4. Seed the database
docker exec -it wiki-backend bun run db:seed
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000
- PostgreSQL: localhost:5432

### Option 2: Local Development

```bash
# 1. Start PostgreSQL
# Make sure PostgreSQL 16 is running on port 5432

# 2. Backend setup
cd backend
bun install
bun run db:migrate
bun run db:seed
bun run dev

# 3. Frontend setup (in a new terminal)
cd frontend
bun install
bun run dev
```

## Default Credentials

After seeding, use these credentials to login:
- **Email:** admin@wiki-app.com
- **Password:** admin123

**⚠️ IMPORTANT:** Change the password immediately after first login!

## Environment Variables

### Backend (.env.development)
```env
DATABASE_URL=postgresql://wiki_user:wiki_password@localhost:5432/wiki_dev
JWT_SECRET=dev_jwt_secret_min_32_characters_long_change_in_production
JWT_REFRESH_SECRET=dev_refresh_secret_min_32_characters_long_change_in_production
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
NODE_ENV=development
PORT=3000
CORS_ORIGIN=http://localhost:5173
```

### Frontend (.env.development)
```env
VITE_API_URL=http://localhost:3000/api
```

## Database Management

### Migrations

Generate new migration:
```bash
cd backend
bun run db:generate
```

Run migrations:
```bash
bun run db:migrate
```

### Seeding

Seed roles and admin user:
```bash
cd backend
bun run db:seed
```

### Database Studio

View database with Drizzle Studio:
```bash
cd backend
bun run db:studio
# Opens at http://localhost:4983
```

## Production Deployment

### Prerequisites
- Docker & Docker Compose
- Domain with SSL certificate (for HTTPS)
- PostgreSQL database (can use Docker)

### Steps

1. **Configure production environment**

Create `.env.production`:
```env
DATABASE_URL=postgresql://user:password@production-db:5432/wiki_prod
JWT_SECRET=your_production_jwt_secret_min_32_characters
JWT_REFRESH_SECRET=your_production_refresh_secret_min_32_characters
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
NODE_ENV=production
PORT=3000
CORS_ORIGIN=https://yourdomain.com
```

2. **Build and deploy**

```bash
cd docker
docker-compose -f docker-compose.prod.yml up -d
```

3. **Run migrations**

```bash
docker exec -it wiki-backend-prod bun run db:migrate
docker exec -it wiki-backend-prod bun run db:seed
```

4. **Set up Nginx/reverse proxy**

Example Nginx configuration:
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name yourdomain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    # Frontend
    location / {
        proxy_pass http://localhost:5173;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Backup & Restore

### Backup Database

```bash
docker exec wiki-postgres pg_dump -U wiki_user wiki_dev > backup.sql
```

### Restore Database

```bash
docker exec -i wiki-postgres psql -U wiki_user wiki_dev < backup.sql
```

## Monitoring

### Check Service Health

```bash
# Backend health check
curl http://localhost:3000/health

# Check logs
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
```

### Database Connection

```bash
# Connect to PostgreSQL
docker exec -it wiki-postgres psql -U wiki_user -d wiki_dev
```

## Troubleshooting

### Services won't start

```bash
# Check Docker logs
docker-compose logs

# Restart services
docker-compose restart

# Clean rebuild
docker-compose down
docker-compose up --build
```

### Database migrations fail

```bash
# Check database connection
docker exec -it wiki-postgres psql -U wiki_user -d wiki_dev -c "SELECT 1;"

# Reset database (⚠️ WARNING: Deletes all data)
docker exec -it wiki-postgres psql -U wiki_user -d wiki_dev -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
docker exec -it wiki-backend bun run db:migrate
docker exec -it wiki-backend bun run db:seed
```

### Cannot login

1. Verify admin user exists:
```bash
docker exec -it wiki-postgres psql -U wiki_user -d wiki_dev -c "SELECT * FROM users WHERE email='admin@wiki-app.com';"
```

2. Re-run seed if needed:
```bash
docker exec -it wiki-backend bun run db:seed
```

### CORS errors

Check backend CORS_ORIGIN matches frontend URL in .env files.

## Security Checklist

- [ ] Change default admin password
- [ ] Use strong JWT secrets (32+ random characters)
- [ ] Enable HTTPS in production
- [ ] Set secure cookie flags (httpOnly, secure, sameSite)
- [ ] Configure firewall rules
- [ ] Regular database backups
- [ ] Update dependencies regularly
- [ ] Use environment-specific secrets
- [ ] Enable database SSL in production
- [ ] Implement rate limiting
- [ ] Monitor logs for suspicious activity

## Scaling

### Horizontal Scaling

1. Run multiple backend instances behind a load balancer
2. Use Redis for session storage (currently in database)
3. Separate database server for production
4. CDN for static assets
5. Database read replicas for scaling reads

### Performance Optimization

1. Enable PostgreSQL connection pooling
2. Add caching layer (Redis)
3. Optimize database indexes
4. Implement pagination for large datasets
5. Use database query optimization

## Support

For issues and questions:
- GitHub Issues: [Repository URL]
- Documentation: README.md
- API Docs: /api endpoint
