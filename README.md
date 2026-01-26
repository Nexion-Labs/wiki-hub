# Wiki Application with EOL Software Management

Full-stack wiki application with End-of-Life software tracking, built on Bun runtime, PostgreSQL, featuring role-based access control, version history, markdown editing, and containerized deployment.

## Tech Stack

### Backend
- **Runtime:** Bun
- **Framework:** Elysia.js
- **ORM:** Drizzle ORM
- **Database:** PostgreSQL 16
- **Authentication:** JWT with HTTP-only cookies

### Frontend
- **Framework:** React 19 + Vite
- **UI Library:** Tailwind CSS (shadcn/ui to be added)
- **State Management:** TanStack Query + Zustand
- **HTTP Client:** Axios

## Features

### Authentication & Authorization
- JWT-based authentication with refresh tokens
- 4 roles: Admin, Editor, Contributor, Viewer
- HTTP-only cookies for security

### Wiki Management
- CRUD operations for wiki articles
- Markdown support with live preview
- Version history and comparison
- Categories and tags
- Full-text search

### EOL Software Tracking
- Database of software products with EOL dates
- Version lifecycle tracking
- Alert subscription system
- Migration guide linking

## Getting Started

### Prerequisites
- Bun 1.0+
- Docker & Docker Compose
- PostgreSQL 16 (if running without Docker)

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd wiki-bun
```

2. **Set up environment variables**
```bash
cp .env.example .env.development
# Edit .env.development with your configuration
```

3. **Install dependencies**

Backend:
```bash
cd backend
bun install
```

Frontend:
```bash
cd frontend
bun install
```

### Running with Docker (Recommended)

```bash
# Start all services (PostgreSQL, Backend, Frontend)
cd docker
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000
- PostgreSQL: localhost:5432

### Running Locally (Without Docker)

1. **Start PostgreSQL**
Make sure PostgreSQL 16 is running on port 5432

2. **Run database migrations**
```bash
cd backend
bun run db:generate
bun run db:migrate
bun run db:seed
```

3. **Start the backend**
```bash
cd backend
bun run dev
```

4. **Start the frontend**
```bash
cd frontend
bun run dev
```

## Database

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

Seed initial data (roles and admin user):
```bash
cd backend
bun run db:seed
```

Default admin credentials:
- Email: `admin@wiki-app.com`
- Password: `admin123`

**⚠️ Change the password after first login!**

## Project Structure

```
wiki-bun/
├── backend/              # Backend API (Elysia.js + Drizzle)
│   ├── src/
│   │   ├── db/           # Database schema, migrations, seeds
│   │   ├── routes/       # API routes
│   │   ├── services/     # Business logic
│   │   ├── middleware/   # Auth, RBAC, etc.
│   │   └── utils/        # Utilities
│   └── tests/            # Tests
│
├── frontend/             # Frontend (React + Vite)
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── pages/        # Page components
│   │   ├── api/          # API client
│   │   ├── hooks/        # Custom hooks
│   │   └── stores/       # Zustand stores
│   └── public/           # Static assets
│
└── docker/               # Docker configuration
    ├── docker-compose.yml
    ├── Dockerfile.dev
    └── init-scripts/     # Database init scripts
```

## Development

### Backend Development

```bash
cd backend
bun run dev              # Start development server with hot reload
bun test                 # Run tests
bun run db:studio        # Open Drizzle Studio (database GUI)
```

### Frontend Development

```bash
cd frontend
bun run dev              # Start Vite dev server
bun run build            # Build for production
bun run preview          # Preview production build
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/me` - Get current user

### Wiki Pages
- `GET /api/wiki/pages` - List all pages
- `GET /api/wiki/pages/:slug` - Get page by slug
- `POST /api/wiki/pages` - Create new page
- `PUT /api/wiki/pages/:id` - Update page
- `DELETE /api/wiki/pages/:id` - Delete page

### EOL Management
- `GET /api/eol/products` - List products
- `GET /api/eol/versions` - List versions
- `POST /api/eol/alerts` - Subscribe to alerts

(More endpoints to be documented as they're implemented)

## Testing

Run tests:
```bash
# Backend tests
cd backend
bun test

# Frontend tests (to be added)
cd frontend
bun test
```

## Deployment

### Production Docker Build

```bash
# Build and start production containers
cd docker
docker-compose -f docker-compose.prod.yml up -d
```

## Contributing

1. Create a feature branch
2. Make your changes
3. Write tests
4. Submit a pull request

## License

[License to be determined]

## Support

For issues and questions, please open an issue on GitHub.
