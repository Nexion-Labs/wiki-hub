import { db } from '../client';
import { wikiPages, wikiPageCategories, wikiPageTags, users, categories, tags, eolProducts } from '../schema';
import { eq } from 'drizzle-orm';

export const seedWikiPages = async () => {
  console.log('🌱 Seeding wiki pages...');

  try {
    // Get admin user
    const [adminUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, 'admin@wiki-app.com'))
      .limit(1);

    if (!adminUser) {
      throw new Error('Admin user not found');
    }

    // Get categories
    const [gettingStartedCat] = await db.select().from(categories).where(eq(categories.slug, 'getting-started')).limit(1);
    const [developmentCat] = await db.select().from(categories).where(eq(categories.slug, 'development')).limit(1);
    const [devopsCat] = await db.select().from(categories).where(eq(categories.slug, 'devops')).limit(1);

    // Get tags
    const allTags = await db.select().from(tags);
    const getTagBySlug = (slug: string) => allTags.find(t => t.slug === slug);

    // Get EOL products for linking
    const [nodejsProduct] = await db.select().from(eolProducts).where(eq(eolProducts.slug, 'nodejs')).limit(1);
    const [postgresProduct] = await db.select().from(eolProducts).where(eq(eolProducts.slug, 'postgresql')).limit(1);
    const [pythonProduct] = await db.select().from(eolProducts).where(eq(eolProducts.slug, 'python')).limit(1);
    const [dockerProduct] = await db.select().from(eolProducts).where(eq(eolProducts.slug, 'docker-engine')).limit(1);
    const [k8sProduct] = await db.select().from(eolProducts).where(eq(eolProducts.slug, 'kubernetes')).limit(1);

    // 1. Node.js Guide
    const nodejsContent = `# Node.js Complete Guide

## Overview

Node.js is a powerful JavaScript runtime built on Chrome's V8 JavaScript engine. It enables developers to build scalable network applications using JavaScript on the server side.

## Installation

### Using Package Manager

#### Ubuntu/Debian
\`\`\`bash
# Using NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs
\`\`\`

#### macOS
\`\`\`bash
# Using Homebrew
brew install node@22
\`\`\`

### Using Version Manager (Recommended)

\`\`\`bash
# Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Install Node.js
nvm install 22
nvm use 22
\`\`\`

## Best Practices

### 1. Use LTS Versions
Always use Long Term Support (LTS) versions in production environments.

### 2. Environment Variables
\`\`\`javascript
// Load environment variables
require('dotenv').config();

const port = process.env.PORT || 3000;
\`\`\`

### 3. Error Handling
\`\`\`javascript
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
\`\`\`

## Version Migration Guide

### Migrating from Node.js 18 to 20

**Breaking Changes:**
- V8 upgraded to 11.3
- Updated default DNS resolution order
- Stable test runner API

**Migration Steps:**
1. Update package.json engine requirement
2. Test all dependencies for compatibility
3. Update CI/CD pipeline
4. Deploy to staging environment
5. Monitor for deprecation warnings

### Migrating from Node.js 16 to 18

**Key Changes:**
- Fetch API globally available
- Test runner experimental support
- V8 upgraded to 10.2

## Performance Tips

1. **Use Clustering**: Utilize all CPU cores
\`\`\`javascript
const cluster = require('cluster');
const os = require('os');

if (cluster.isMaster) {
  const numCPUs = os.cpus().length;
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
} else {
  // Worker process
  require('./app');
}
\`\`\`

2. **Stream Large Files**: Don't load everything into memory
\`\`\`javascript
const fs = require('fs');
const readStream = fs.createReadStream('large-file.txt');
readStream.pipe(response);
\`\`\`

## Security Considerations

- Keep Node.js updated
- Use \`npm audit\` regularly
- Validate user input
- Use helmet.js for Express apps
- Enable HTTPS in production

## Related Resources

- [Official Documentation](https://nodejs.org/docs)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [EOL Tracking](/eol/nodejs)
`;

    const [nodejsPage] = await db
      .insert(wikiPages)
      .values({
        title: 'Node.js Complete Guide',
        slug: 'nodejs-complete-guide',
        content: nodejsContent,
        contentMarkdown: nodejsContent,
        excerpt: 'Complete guide to Node.js installation, best practices, and version migration',
        authorId: adminUser.id,
        isPublished: true,
      })
      .returning()
      .onConflictDoNothing();

    if (nodejsPage && gettingStartedCat) {
      await db.insert(wikiPageCategories).values({ pageId: nodejsPage.id, categoryId: gettingStartedCat.id }).onConflictDoNothing();

      const nodejsTag = getTagBySlug('nodejs');
      const jsTag = getTagBySlug('javascript');
      const tutorialTag = getTagBySlug('tutorial');
      if (nodejsTag) await db.insert(wikiPageTags).values({ pageId: nodejsPage.id, tagId: nodejsTag.id }).onConflictDoNothing();
      if (jsTag) await db.insert(wikiPageTags).values({ pageId: nodejsPage.id, tagId: jsTag.id }).onConflictDoNothing();
      if (tutorialTag) await db.insert(wikiPageTags).values({ pageId: nodejsPage.id, tagId: tutorialTag.id }).onConflictDoNothing();
    }

    // 2. PostgreSQL Guide
    const postgresContent = `# PostgreSQL Database Guide

## Introduction

PostgreSQL is a powerful, open-source object-relational database system with over 35 years of active development.

## Installation

### Ubuntu/Debian
\`\`\`bash
# Add PostgreSQL repository
sudo sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'
wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo apt-key add -
sudo apt-get update
sudo apt-get -y install postgresql-16
\`\`\`

### Docker
\`\`\`bash
docker run -d \\
  --name postgres \\
  -e POSTGRES_PASSWORD=mypassword \\
  -e POSTGRES_DB=mydb \\
  -p 5432:5432 \\
  postgres:16
\`\`\`

## Basic Operations

### Creating a Database
\`\`\`sql
CREATE DATABASE myapp_production;
CREATE USER myapp_user WITH ENCRYPTED PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE myapp_production TO myapp_user;
\`\`\`

### Connection String
\`\`\`
postgresql://username:password@localhost:5432/database_name
\`\`\`

## Performance Optimization

### 1. Indexing Strategy
\`\`\`sql
-- B-tree index (default)
CREATE INDEX idx_users_email ON users(email);

-- Partial index
CREATE INDEX idx_active_users ON users(email) WHERE is_active = true;

-- GIN index for full-text search
CREATE INDEX idx_posts_content ON posts USING GIN(to_tsvector('english', content));
\`\`\`

### 2. Query Optimization
\`\`\`sql
-- Use EXPLAIN ANALYZE
EXPLAIN ANALYZE SELECT * FROM users WHERE email = 'user@example.com';

-- Add appropriate indexes
-- Avoid SELECT *
-- Use prepared statements
\`\`\`

### 3. Connection Pooling
Use connection pooling libraries:
- Node.js: \`pg-pool\`
- Python: \`psycopg2.pool\`
- Go: \`pgx\`

## Backup and Recovery

### Backup
\`\`\`bash
# Full database backup
pg_dump -U username -d database_name > backup.sql

# With compression
pg_dump -U username -d database_name | gzip > backup.sql.gz

# Backup all databases
pg_dumpall -U postgres > all_databases.sql
\`\`\`

### Restore
\`\`\`bash
# Restore database
psql -U username -d database_name < backup.sql

# From compressed backup
gunzip -c backup.sql.gz | psql -U username -d database_name
\`\`\`

## Version Upgrade Guide

### Major Version Upgrade (14 ⟶ 16)

1. **Backup current database**
2. **Install new version** alongside old
3. **Run pg_upgrade**:
\`\`\`bash
pg_upgrade \\
  -b /usr/lib/postgresql/14/bin \\
  -B /usr/lib/postgresql/16/bin \\
  -d /var/lib/postgresql/14/main \\
  -D /var/lib/postgresql/16/main
\`\`\`
4. **Test thoroughly**
5. **Update applications**

## Security Best Practices

1. **Use SSL/TLS connections**
2. **Implement row-level security**
3. **Regular security updates**
4. **Strong password policies**
5. **Principle of least privilege**

### Example: Row-Level Security
\`\`\`sql
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY document_access ON documents
  FOR ALL
  TO app_user
  USING (user_id = current_user_id());
\`\`\`

## Monitoring

### Key Metrics to Monitor
- Active connections
- Query performance
- Cache hit ratio
- Disk I/O
- Replication lag

### Using pg_stat views
\`\`\`sql
-- Active queries
SELECT pid, usename, application_name, state, query
FROM pg_stat_activity
WHERE state != 'idle';

-- Database size
SELECT pg_size_pretty(pg_database_size('mydb'));

-- Cache hit ratio
SELECT
  sum(heap_blks_read) as heap_read,
  sum(heap_blks_hit) as heap_hit,
  sum(heap_blks_hit) / (sum(heap_blks_hit) + sum(heap_blks_read)) as ratio
FROM pg_statio_user_tables;
\`\`\`

## Common Issues and Solutions

### Problem: Slow Queries
- Run VACUUM ANALYZE
- Check indexes
- Review query plans

### Problem: Connection Limit Reached
- Increase max_connections
- Implement connection pooling
- Check for connection leaks

### Problem: Disk Space
- Investigate bloat: \`pg_bloat_check\`
- Run VACUUM FULL (requires downtime)
- Archive old data

## Related Resources

- [Official Documentation](https://www.postgresql.org/docs/)
- [EOL Tracking](/eol/postgresql)
`;

    const [postgresPage] = await db
      .insert(wikiPages)
      .values({
        title: 'PostgreSQL Database Guide',
        slug: 'postgresql-database-guide',
        content: postgresContent,
        contentMarkdown: postgresContent,
        excerpt: 'Comprehensive PostgreSQL guide covering installation, optimization, backup, and security',
        authorId: adminUser.id,
        isPublished: true,
      })
      .returning()
      .onConflictDoNothing();

    if (postgresPage && developmentCat) {
      await db.insert(wikiPageCategories).values({ pageId: postgresPage.id, categoryId: developmentCat.id }).onConflictDoNothing();

      const pgTag = getTagBySlug('postgresql');
      const guideTag = getTagBySlug('guide');
      const bestPracticesTag = getTagBySlug('best-practices');
      if (pgTag) await db.insert(wikiPageTags).values({ pageId: postgresPage.id, tagId: pgTag.id }).onConflictDoNothing();
      if (guideTag) await db.insert(wikiPageTags).values({ pageId: postgresPage.id, tagId: guideTag.id }).onConflictDoNothing();
      if (bestPracticesTag) await db.insert(wikiPageTags).values({ pageId: postgresPage.id, tagId: bestPracticesTag.id }).onConflictDoNothing();
    }

    // 3. Docker Guide
    const dockerContent = `# Docker Containerization Guide

## What is Docker?

Docker is a platform for developing, shipping, and running applications in containers. Containers package software with all dependencies needed to run.

## Installation

### Linux
\`\`\`bash
# Install using convenience script
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add user to docker group
sudo usermod -aG docker $USER
\`\`\`

### Docker Desktop
Download from [docker.com](https://www.docker.com/products/docker-desktop)

## Dockerfile Best Practices

### Multi-stage Build
\`\`\`dockerfile
# Build stage
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM node:22-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY package*.json ./
USER node
CMD ["node", "dist/index.js"]
\`\`\`

### Layer Optimization
\`\`\`dockerfile
# Bad: Creates many layers
RUN apt-get update
RUN apt-get install -y curl
RUN apt-get install -y git

# Good: Single layer
RUN apt-get update && apt-get install -y \\
    curl \\
    git \\
    && rm -rf /var/lib/apt/lists/*
\`\`\`

### Use .dockerignore
\`\`\`
node_modules
npm-debug.log
.git
.env
*.md
\`\`\`

## Docker Compose

### Basic Example
\`\`\`yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/mydb
    depends_on:
      db:
        condition: service_healthy
    restart: unless-stopped

  db:
    image: postgres:16-alpine
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
      - POSTGRES_DB=mydb
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U user"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:
\`\`\`

## Container Management

### Basic Commands
\`\`\`bash
# List containers
docker ps
docker ps -a  # include stopped

# Start/Stop
docker start container_name
docker stop container_name
docker restart container_name

# Remove
docker rm container_name
docker rm -f container_name  # force remove running

# Logs
docker logs container_name
docker logs -f container_name  # follow
docker logs --tail 100 container_name  # last 100 lines

# Execute commands
docker exec -it container_name bash
docker exec container_name ls /app
\`\`\`

### Image Management
\`\`\`bash
# List images
docker images

# Remove images
docker rmi image_name
docker image prune  # remove dangling images

# Build
docker build -t myapp:latest .
docker build --no-cache -t myapp:latest .

# Tag and Push
docker tag myapp:latest registry.com/myapp:latest
docker push registry.com/myapp:latest
\`\`\`

## Networking

### Types of Networks
- **bridge**: Default, isolated network
- **host**: Share host network
- **none**: No networking
- **overlay**: Multi-host networking

### Custom Network
\`\`\`bash
# Create network
docker network create my-network

# Run container in network
docker run -d --network my-network --name app myapp

# Connect existing container
docker network connect my-network container_name
\`\`\`

## Volume Management

### Types
- **Named volumes**: Managed by Docker
- **Bind mounts**: Direct host path
- **tmpfs**: In-memory storage

### Examples
\`\`\`bash
# Named volume
docker run -v mydata:/app/data myapp

# Bind mount
docker run -v /host/path:/container/path myapp

# Read-only mount
docker run -v /host/path:/container/path:ro myapp

# List volumes
docker volume ls

# Remove unused volumes
docker volume prune
\`\`\`

## Security Best Practices

### 1. Use Official Images
\`\`\`dockerfile
FROM node:22-alpine  # Official, minimal
\`\`\`

### 2. Non-root User
\`\`\`dockerfile
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001
USER nodejs
\`\`\`

### 3. Scan Images
\`\`\`bash
docker scan myapp:latest
\`\`\`

### 4. Secrets Management
\`\`\`bash
# Don't use -e for secrets
# Use Docker secrets or external vault
docker secret create my_secret secret.txt
\`\`\`

### 5. Resource Limits
\`\`\`yaml
services:
  app:
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
\`\`\`

## Performance Optimization

### 1. Minimize Image Size
- Use Alpine base images
- Multi-stage builds
- Remove unnecessary files

### 2. Layer Caching
\`\`\`dockerfile
# Copy package files first (cached)
COPY package*.json ./
RUN npm ci

# Copy source code later (changes frequently)
COPY . .
\`\`\`

### 3. BuildKit
\`\`\`bash
# Enable BuildKit for faster builds
DOCKER_BUILDKIT=1 docker build .
\`\`\`

## Monitoring

### Resource Usage
\`\`\`bash
# Real-time stats
docker stats

# Specific container
docker stats container_name

# Disk usage
docker system df
\`\`\`

### Health Checks
\`\`\`dockerfile
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \\
  CMD curl -f http://localhost:3000/health || exit 1
\`\`\`

## Troubleshooting

### Common Issues

**Container exits immediately**
\`\`\`bash
docker logs container_name
docker inspect container_name
\`\`\`

**Permission denied**
- Add user to docker group
- Check file permissions in volumes

**Out of disk space**
\`\`\`bash
docker system prune -a  # Remove all unused data
docker volume prune
\`\`\`

## Migration Guide

### Docker 24 ⟶ 27
- Updated containerd
- BuildKit improvements
- Security enhancements
- Review breaking changes in release notes

## Related Resources

- [Official Documentation](https://docs.docker.com/)
- [Docker Hub](https://hub.docker.com/)
- [EOL Tracking](/eol/docker-engine)
`;

    const [dockerPage] = await db
      .insert(wikiPages)
      .values({
        title: 'Docker Containerization Guide',
        slug: 'docker-containerization-guide',
        content: dockerContent,
        contentMarkdown: dockerContent,
        excerpt: 'Complete Docker guide covering containerization, best practices, and production deployment',
        authorId: adminUser.id,
        isPublished: true,
      })
      .returning()
      .onConflictDoNothing();

    if (dockerPage && devopsCat) {
      await db.insert(wikiPageCategories).values({ pageId: dockerPage.id, categoryId: devopsCat.id }).onConflictDoNothing();

      const dockerTag = getTagBySlug('docker');
      const guideTag = getTagBySlug('guide');
      if (dockerTag) await db.insert(wikiPageTags).values({ pageId: dockerPage.id, tagId: dockerTag.id }).onConflictDoNothing();
      if (guideTag) await db.insert(wikiPageTags).values({ pageId: dockerPage.id, tagId: guideTag.id }).onConflictDoNothing();
    }

    // 4. Kubernetes Guide
    const k8sContent = `# Kubernetes Orchestration Guide

## Introduction

Kubernetes (K8s) is an open-source container orchestration platform for automating deployment, scaling, and management of containerized applications.

## Installation

### Minikube (Local Development)
\`\`\`bash
# Install Minikube
curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64
sudo install minikube-linux-amd64 /usr/local/bin/minikube

# Start cluster
minikube start
\`\`\`

### kubectl
\`\`\`bash
# Install kubectl
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl

# Verify
kubectl version --client
\`\`\`

## Core Concepts

### Pods
Smallest deployable units in Kubernetes.

\`\`\`yaml
apiVersion: v1
kind: Pod
metadata:
  name: nginx-pod
  labels:
    app: nginx
spec:
  containers:
  - name: nginx
    image: nginx:1.25
    ports:
    - containerPort: 80
\`\`\`

### Deployments
Manage stateless applications.

\`\`\`yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: web-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: web
  template:
    metadata:
      labels:
        app: web
    spec:
      containers:
      - name: app
        image: myapp:1.0
        ports:
        - containerPort: 3000
        resources:
          requests:
            memory: "128Mi"
            cpu: "100m"
          limits:
            memory: "256Mi"
            cpu: "200m"
\`\`\`

### Services
Expose applications to network traffic.

\`\`\`yaml
apiVersion: v1
kind: Service
metadata:
  name: web-service
spec:
  selector:
    app: web
  ports:
  - protocol: TCP
    port: 80
    targetPort: 3000
  type: LoadBalancer
\`\`\`

## Configuration Management

### ConfigMaps
\`\`\`yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
data:
  APP_ENV: "production"
  LOG_LEVEL: "info"
\`\`\`

### Secrets
\`\`\`bash
# Create secret
kubectl create secret generic db-secret \\
  --from-literal=username=admin \\
  --from-literal=password=secretpass

# Use in pod
spec:
  containers:
  - name: app
    env:
    - name: DB_USER
      valueFrom:
        secretKeyRef:
          name: db-secret
          key: username
\`\`\`

## Storage

### PersistentVolume
\`\`\`yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: app-storage
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 10Gi
\`\`\`

## Networking

### Ingress
\`\`\`yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: app-ingress
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
spec:
  rules:
  - host: app.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: web-service
            port:
              number: 80
\`\`\`

## Autoscaling

### Horizontal Pod Autoscaler
\`\`\`yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: web-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: web-app
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
\`\`\`

## Health Checks

\`\`\`yaml
spec:
  containers:
  - name: app
    livenessProbe:
      httpGet:
        path: /health
        port: 3000
      initialDelaySeconds: 30
      periodSeconds: 10
    readinessProbe:
      httpGet:
        path: /ready
        port: 3000
      initialDelaySeconds: 5
      periodSeconds: 5
\`\`\`

## Best Practices

### 1. Resource Management
- Always set resource requests and limits
- Use HPA for auto-scaling
- Monitor resource usage

### 2. Security
\`\`\`yaml
securityContext:
  runAsNonRoot: true
  runAsUser: 1000
  capabilities:
    drop:
    - ALL
  readOnlyRootFilesystem: true
\`\`\`

### 3. High Availability
- Run multiple replicas
- Use anti-affinity rules
- Implement pod disruption budgets

### 4. Observability
- Use labels consistently
- Implement health checks
- Enable logging and monitoring

## Common Commands

\`\`\`bash
# Apply configuration
kubectl apply -f deployment.yaml

# Get resources
kubectl get pods
kubectl get services
kubectl get deployments

# Describe resources
kubectl describe pod pod-name

# Logs
kubectl logs pod-name
kubectl logs -f pod-name  # follow
kubectl logs pod-name -c container-name  # specific container

# Execute commands
kubectl exec -it pod-name -- /bin/bash

# Scale
kubectl scale deployment web-app --replicas=5

# Delete
kubectl delete pod pod-name
kubectl delete -f deployment.yaml

# Namespace operations
kubectl get pods -n namespace-name
kubectl config set-context --current --namespace=namespace-name
\`\`\`

## Troubleshooting

### Pod Not Starting
\`\`\`bash
kubectl describe pod pod-name
kubectl logs pod-name
kubectl get events
\`\`\`

### Image Pull Errors
- Check image name and tag
- Verify registry credentials
- Check network connectivity

### Resource Issues
\`\`\`bash
kubectl top pods
kubectl top nodes
\`\`\`

## Upgrade Strategy

### Rolling Update
\`\`\`yaml
spec:
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
\`\`\`

### Version Migration (1.29 ⟶ 1.31)
1. Review release notes
2. Test in non-production
3. Upgrade control plane
4. Upgrade worker nodes
5. Update workloads for deprecated APIs

## Related Resources

- [Official Documentation](https://kubernetes.io/docs/)
- [kubectl Cheat Sheet](https://kubernetes.io/docs/reference/kubectl/cheatsheet/)
- [EOL Tracking](/eol/kubernetes)
`;

    const [k8sPage] = await db
      .insert(wikiPages)
      .values({
        title: 'Kubernetes Orchestration Guide',
        slug: 'kubernetes-orchestration-guide',
        content: k8sContent,
        contentMarkdown: k8sContent,
        excerpt: 'Comprehensive Kubernetes guide for container orchestration and deployment',
        authorId: adminUser.id,
        isPublished: true,
      })
      .returning()
      .onConflictDoNothing();

    if (k8sPage && devopsCat) {
      await db.insert(wikiPageCategories).values({ pageId: k8sPage.id, categoryId: devopsCat.id }).onConflictDoNothing();

      const k8sTag = getTagBySlug('kubernetes');
      const dockerTag = getTagBySlug('docker');
      const guideTag = getTagBySlug('guide');
      if (k8sTag) await db.insert(wikiPageTags).values({ pageId: k8sPage.id, tagId: k8sTag.id }).onConflictDoNothing();
      if (dockerTag) await db.insert(wikiPageTags).values({ pageId: k8sPage.id, tagId: dockerTag.id }).onConflictDoNothing();
      if (guideTag) await db.insert(wikiPageTags).values({ pageId: k8sPage.id, tagId: guideTag.id }).onConflictDoNothing();
    }

    console.log('✅ Wiki pages seeded successfully (4 pages)');
  } catch (error) {
    console.error('❌ Failed to seed wiki pages:', error);
    throw error;
  }
};
