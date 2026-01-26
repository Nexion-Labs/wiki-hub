# Implementation Plan: Wiki Application with EOL Software Management

## Overview
Full-stack wiki application with End-of-Life software tracking, built on Bun runtime, PostgreSQL, featuring role-based access control, version history, markdown editing, and containerized deployment.

## Technology Stack

### Backend
- **Runtime:** Bun (v1.0+)
- **Framework:** Elysia.js (397k req/s, 7.4kb, native Bun optimizations)
- **ORM:** Drizzle ORM (SQL-first, fastest ORM, native Bun support)
- **Database:** PostgreSQL 16 (full-text search with tsvector/GIN indexes)
- **Authentication:** JWT with HTTP-only cookies (@elysiajs/jwt using jose)
- **Validation:** Zod (TypeScript-first schema validation)

### Frontend
- **Framework:** React 19 + Vite
- **UI Library:** shadcn/ui + Radix UI + TailwindCSS
- **State Management:** TanStack Query (server state) + Zustand (client state)
- **Markdown Editor:** MDXEditor or react-markdown + CodeMirror
- **HTTP Client:** Axios with interceptors

### Infrastructure
- **Containerization:** Docker + Docker Compose
- **Testing:** Bun test (unit/integration) + Playwright (E2E)
- **Password Hashing:** Bun.password.hash() (native, no bcrypt needed)

## Core Features

### 1. EOL Software Management
- Database of software products with versions, EOL dates, lifecycle stages
- Version lifecycle tracking (active, maintenance, EOL, extended support)
- Alert subscription system (notify users N days before EOL)
- Link EOL entries to wiki migration guides
- Search functionality for products and versions

### 2. Authentication & Authorization (RBAC)
- JWT-based authentication with refresh tokens
- HTTP-only cookies for security (prevent XSS)
- 4 roles with granular permissions:
  * **Admin:** Full system access (manage users, roles, all content)
  * **Editor:** Create, edit, delete any wiki pages and EOL entries
  * **Contributor:** Create and edit OWN content only
  * **Viewer:** Read-only access
- Session management for token rotation

### 3. Wiki Features
- CRUD operations for wiki articles with markdown support
- Version history (track all changes, store diffs)
- Version comparison and revert functionality
- Categories (hierarchical) and tags for organization
- Full-text search using PostgreSQL tsvector/GIN indexes
- Markdown editor with live preview
- Soft delete for pages
- View count tracking

## Database Schema

### Core Tables
- **users:** User accounts with email, username, password_hash, role_id
- **roles:** 4 roles (admin, editor, contributor, viewer) with JSONB permissions
- **sessions:** Refresh token storage for JWT rotation

### Wiki Tables
- **wiki_pages:** Title, slug, content, markdown, author, search_vector, metadata (JSONB)
- **wiki_versions:** Version history with diffs, version numbers, change summaries
- **categories:** Hierarchical categories with parent_id, slug, color, icon
- **tags:** Flat tags with usage counts
- **wiki_page_categories:** Many-to-many relationship
- **wiki_page_tags:** Many-to-many relationship

### EOL Tables
- **eol_products:** Product name, vendor, description, type, homepage, documentation
- **eol_versions:** Version number, release_date, eol_date, lifecycle_stage, LTS flag, migration_guide_page_id
- **eol_alerts:** User subscriptions to version EOL notifications

### Audit Tables
- **activity_logs:** User actions, entity tracking, IP, user agent
- Full-text search indexes on wiki_pages and eol_products

## API Endpoints Structure

### Authentication (`/api/auth`)
- POST /register, /login, /logout, /refresh, /forgot-password, /reset-password
- GET /me, PUT /me, PUT /me/password

### Users (`/api/users`) - Admin only
- GET / (list), GET /:id, POST /, PUT /:id, DELETE /:id
- PUT /:id/role, GET /:id/activity

### Wiki Pages (`/api/wiki/pages`)
- GET / (list with search), GET /:slug, POST /, PUT /:id, DELETE /:id
- POST /:id/publish, GET /:id/versions, POST /:id/revert/:versionId
- GET /:id/diff/:v1/:v2, POST /:id/view

### Categories & Tags (`/api/wiki`)
- GET /categories, POST /categories, PUT /categories/:id, DELETE /categories/:id
- GET /tags, POST /tags, PUT /tags/:id, DELETE /tags/:id

### Search (`/api/search`)
- GET / (universal), GET /wiki, GET /eol, GET /suggestions

### EOL Management (`/api/eol`)
- GET /products, POST /products, PUT /products/:id, DELETE /products/:id
- GET /versions, POST /versions, PUT /versions/:id, GET /versions/expiring
- GET /alerts, POST /alerts, DELETE /alerts/:id

### Analytics (`/api`)
- GET /dashboard/stats, /analytics/pages, /analytics/users
- GET /activity (global log with filters)

## Authentication Flow

1. **Register:** Hash password with `Bun.password.hash()`, create user with 'viewer' role
2. **Login:** Verify credentials, generate JWT access token (15min) + refresh token (7d)
3. **Tokens:** Store in HTTP-only cookies (secure, sameSite: strict)
4. **Protected Routes:** Middleware verifies JWT, extracts user + permissions
5. **Authorization:** RBAC middleware checks permissions from JWT payload
6. **Ownership:** Contributors can only modify resources where author_id = user.id
7. **Refresh:** Rotate refresh token, generate new access token
8. **Logout:** Invalidate refresh token in sessions table, clear cookies

## File Structure

```
wiki-bun/
├── docker/
│   ├── docker-compose.yml          # Development setup
│   ├── docker-compose.prod.yml     # Production setup
│   ├── Dockerfile                  # Backend production image
│   ├── Dockerfile.dev              # Backend dev image
│   └── init-scripts/               # Database initialization
│
├── backend/
│   ├── src/
│   │   ├── index.ts                # Entry point
│   │   ├── app.ts                  # Elysia app setup
│   │   ├── config/                 # Database, JWT, env config
│   │   ├── db/
│   │   │   ├── schema/             # Drizzle schema definitions
│   │   │   ├── migrations/         # Auto-generated migrations
│   │   │   ├── seeds/              # Seed data (roles, admin)
│   │   │   └── client.ts           # Drizzle client
│   │   ├── middleware/             # Auth, RBAC, ownership, rate-limit
│   │   ├── routes/                 # Route definitions
│   │   ├── controllers/            # Request handlers
│   │   ├── services/               # Business logic
│   │   ├── repositories/           # Data access layer
│   │   ├── validators/             # Zod schemas
│   │   ├── utils/                  # Password, JWT, slug, diff, markdown
│   │   └── types/                  # TypeScript types
│   ├── tests/                      # Unit, integration, E2E tests
│   └── drizzle.config.ts           # Drizzle configuration
│
├── frontend/
│   ├── src/
│   │   ├── main.tsx                # Entry point
│   │   ├── api/                    # API client layer (Axios)
│   │   ├── hooks/                  # Custom React hooks
│   │   ├── contexts/               # Auth, Theme contexts
│   │   ├── stores/                 # Zustand stores
│   │   ├── components/
│   │   │   ├── ui/                 # shadcn/ui components
│   │   │   ├── layout/             # Header, Sidebar, Footer
│   │   │   ├── auth/               # Login, Register forms
│   │   │   ├── wiki/               # Wiki editor, preview, version history
│   │   │   ├── eol/                # Product cards, timeline, alerts
│   │   │   ├── search/             # Search bar, results, filters
│   │   │   └── admin/              # User management, analytics
│   │   ├── pages/                  # Page components (routes)
│   │   ├── lib/                    # Utilities, queryClient
│   │   └── types/                  # TypeScript types
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── tsconfig.json
│
└── scripts/
    ├── setup-dev.sh                # Development setup
    ├── seed-database.ts            # Database seeding
    └── check-eol-alerts.ts         # Cron job for EOL notifications
```

## Implementation Phases

### Phase 1: Project Setup & Infrastructure (Week 1)
1. Initialize Bun project, install dependencies
2. Set up Docker Compose (PostgreSQL, backend, frontend services)
3. Configure environment variables (.env.development, .env.production)
4. Create Drizzle schema for all tables
5. Generate and run migrations
6. Seed database with roles and admin user
7. Verify development environment works

**Critical Files:**
- `docker/docker-compose.yml`
- `backend/src/db/schema/index.ts`
- `backend/drizzle.config.ts`
- `.env.example`

### Phase 2: Backend Core & Authentication (Week 2-3)
1. Set up Elysia.js app with plugins (JWT, cookie, CORS)
2. Implement Drizzle client and repositories
3. Build authentication service (register, login, logout, refresh)
4. Create JWT middleware for token verification
5. Implement RBAC middleware for permission checking
6. Create ownership middleware for contributors
7. Build user management endpoints (admin)
8. Implement activity logging
9. Write unit tests for auth logic

**Critical Files:**
- `backend/src/middleware/auth.ts`
- `backend/src/middleware/rbac.ts`
- `backend/src/services/auth.service.ts`
- `backend/src/routes/auth.routes.ts`
- `backend/src/utils/jwt.ts`, `password.ts`

### Phase 3: Wiki Core Features (Week 4-5)
1. Implement wiki page repository and service
2. Build CRUD endpoints for wiki pages
3. Create slug generation and markdown processing utilities
4. Implement version history system (create version on update)
5. Build diff calculation utility for version comparison
6. Create revert functionality
7. Implement categories and tags (many-to-many relationships)
8. Set up PostgreSQL full-text search (tsvector, GIN indexes)
9. Build search service with ranking
10. Write integration tests for wiki endpoints

**Critical Files:**
- `backend/src/services/wiki.service.ts`
- `backend/src/services/version.service.ts`
- `backend/src/services/search.service.ts`
- `backend/src/routes/wiki.routes.ts`
- `backend/src/utils/diff.ts`, `markdown.ts`, `slug.ts`

### Phase 4: EOL Software Management (Week 6)
1. Implement EOL product and version repositories
2. Build CRUD endpoints for products and versions
3. Create lifecycle stage calculation logic
4. Implement alert subscription system
5. Build background job for checking EOL dates
6. Integrate email notification service
7. Link EOL versions to wiki migration guides
8. Create EOL dashboard endpoints

**Critical Files:**
- `backend/src/services/eol.service.ts`
- `backend/src/services/alert.service.ts`
- `backend/src/routes/eol-products.routes.ts`
- `backend/src/routes/eol-versions.routes.ts`
- `scripts/check-eol-alerts.ts`

### Phase 5: Frontend Development (Week 7-9)
1. Set up React Router, TanStack Query, Zustand
2. Configure Axios client with JWT interceptors
3. Create auth context and protected routes
4. Build authentication UI (login, register, password reset)
5. Implement wiki page listing and search
6. Build markdown editor with preview (MDXEditor or react-markdown)
7. Create version history viewer and comparison UI
8. Implement category/tag management
9. Build EOL product listing and details
10. Create version timeline visualization
11. Implement alert subscription UI
12. Build admin dashboard (user management, analytics)
13. Create responsive layout with sidebar navigation
14. Implement role-based UI visibility

**Critical Files:**
- `frontend/src/api/client.ts`
- `frontend/src/contexts/AuthContext.tsx`
- `frontend/src/components/wiki/WikiEditor.tsx`
- `frontend/src/components/wiki/VersionHistory.tsx`
- `frontend/src/components/eol/VersionTimeline.tsx`
- `frontend/src/pages/admin/DashboardPage.tsx`
- `frontend/src/components/layout/MainLayout.tsx`

### Phase 6: Testing & Quality Assurance (Week 10)
1. Write unit tests for all services (target 80%+ coverage)
2. Create integration tests for all API endpoints
3. Write E2E tests with Playwright (critical user flows)
4. Test authentication/authorization flows
5. Test RBAC enforcement (all 4 roles)
6. Test version control functionality
7. Test search performance
8. Security audit (JWT, RBAC, input validation, XSS/CSRF)
9. Performance testing with Artillery/k6
10. Fix bugs and optimize performance

### Phase 7: Deployment & DevOps (Week 11)
1. Create production Dockerfile (multi-stage build)
2. Set up docker-compose.prod.yml with secrets
3. Configure Nginx for frontend (production)
4. Set up health checks for all services
5. Implement database backup strategy
6. Create CI/CD pipeline (GitHub Actions)
7. Set up monitoring and logging
8. Write deployment documentation
9. Create API documentation
10. Final production deployment test

## Docker Configuration

### Development (docker-compose.yml)
- PostgreSQL 16-alpine with persistent volume
- Backend with volume mounting for hot reload
- Frontend with Vite dev server
- Health checks for service dependencies
- Port mapping: 5432 (postgres), 3000 (backend), 5173 (frontend)

### Production (docker-compose.prod.yml)
- Multi-stage builds for minimal image size
- Non-root user for security
- Docker secrets for sensitive data
- Network isolation (backend + frontend networks)
- Health checks and restart policies
- HTTPS support with Nginx
- Resource limits and monitoring

## Security Best Practices

1. **Authentication:**
   - HTTP-only cookies (prevent XSS)
   - Secure cookies in production (HTTPS only)
   - sameSite: strict (prevent CSRF)
   - Short access token expiry (15 min)
   - Refresh token rotation
   - Rate limiting on login attempts

2. **Authorization:**
   - JWT signature verification
   - Role-based permissions in JWT payload
   - Ownership verification for contributors
   - Admin-only routes protection

3. **Input Validation:**
   - Zod schemas for all API inputs
   - SQL injection prevention (Drizzle ORM)
   - XSS prevention (markdown sanitization)
   - File upload validation

4. **Infrastructure:**
   - Non-root Docker containers
   - Docker secrets management
   - Network isolation
   - Database SSL connections
   - Regular dependency updates

## Verification Strategy

### Unit Testing (Bun test)
- Service layer business logic
- Utility functions (password, JWT, slug, diff)
- Repository methods
- Validation schemas
- Target: 80%+ coverage

### Integration Testing (Bun test)
- API endpoint functionality
- Database operations
- Authentication/authorization flows
- Search functionality
- Version control operations

### E2E Testing (Playwright)
- User registration and login
- Wiki page creation and editing
- Version history and revert
- Search functionality
- Role-based access control
- EOL product management
- Alert subscriptions

### Performance Testing
- API response times (< 200ms target)
- Database query performance
- Search query performance
- Concurrent user handling (50-100 users)
- Memory and CPU usage

### Security Testing
- JWT token validation
- RBAC enforcement on all routes
- Input validation and sanitization
- SQL injection prevention
- XSS/CSRF protection
- Password strength requirements

## Environment Variables

```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/wiki_db
POSTGRES_DB=wiki_db
POSTGRES_USER=wiki_user
POSTGRES_PASSWORD=change_me

# JWT
JWT_SECRET=min_32_character_secret_key
JWT_REFRESH_SECRET=min_32_character_refresh_secret
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Application
NODE_ENV=development
PORT=3000
CORS_ORIGIN=http://localhost:5173

# Frontend
VITE_API_URL=http://localhost:3000/api
```

## Success Criteria

### Functional Requirements
- ✅ User authentication and authorization working
- ✅ All 4 roles (Admin, Editor, Contributor, Viewer) implemented
- ✅ Wiki CRUD operations with markdown support
- ✅ Version history with diff and revert functionality
- ✅ Categories and tags working
- ✅ Full-text search operational
- ✅ EOL product and version tracking
- ✅ Alert subscription system functional
- ✅ Admin dashboard with user management
- ✅ Responsive UI on desktop and mobile

### Non-Functional Requirements
- ✅ API response times < 200ms (95th percentile)
- ✅ 80%+ test coverage
- ✅ Docker containers running in production
- ✅ HTTPS enabled in production
- ✅ Database backups configured
- ✅ Monitoring and logging operational
- ✅ Documentation complete (README, API docs, deployment guide)

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Bun ecosystem immaturity | Use stable libraries, have Node.js fallback plan |
| PostgreSQL FTS limitations | Monitor performance, prepare Elasticsearch migration if needed |
| JWT token theft | HTTP-only cookies, short expiration, token rotation |
| Database migration failures | Test thoroughly, maintain backups, rollback plan |
| Version history storage growth | Implement version pruning policy after 100 versions |
| Search performance degradation | Optimize indexes, implement caching, pagination |

## Future Enhancements (Post-MVP)

- Real-time collaboration with WebSocket
- Rich media support (images, videos, attachments)
- Page templates
- Comments and discussions
- OAuth2 integration (Google, GitHub)
- Automated EOL data import from endoflife.date API
- Slack/Discord notification channels
- GraphQL API option
- Kubernetes deployment
- Multi-region deployment
- Elasticsearch for advanced search

## Resources & Documentation

- Elysia.js: https://elysiajs.com
- Drizzle ORM: https://orm.drizzle.team
- PostgreSQL Full-Text Search: https://www.postgresql.org/docs/current/textsearch.html
- Bun Documentation: https://bun.sh/docs
- React 19: https://react.dev
- shadcn/ui: https://ui.shadcn.com
- TanStack Query: https://tanstack.com/query
