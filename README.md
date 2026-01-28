# Wiki Hub - Full-Stack Application

A unified full-stack application built with TanStack Start, featuring:
- Wiki pages with markdown support
- EOL (End of Life) tracker for software versions
- User authentication with JWT
- Role-based access control

## Tech Stack

- **Framework**: [TanStack Start](https://tanstack.com/start)
- **Router**: [TanStack Router](https://tanstack.com/router)
- **Data Fetching**: [TanStack Query](https://tanstack.com/query)
- **Database**: PostgreSQL with [Drizzle ORM](https://orm.drizzle.team/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Build**: [Vinxi](https://vinxi.dev/)

## Project Structure

```
frontend/
├── src/
│   ├── routes/           # TanStack Router file-based routes
│   │   ├── __root.tsx    # Root layout with navigation
│   │   ├── index.tsx     # Home page (EOL tracker)
│   │   ├── login.tsx     # Login page
│   │   ├── wiki/         # Wiki pages
│   │   ├── eol/          # EOL detail pages
│   │   ├── dashboard/    # User dashboard
│   │   └── admin/        # Admin pages
│   ├── server/           # Server-side code
│   │   ├── functions/    # TanStack Start server functions
│   │   ├── services/     # Business logic
│   │   ├── repositories/ # Data access layer
│   │   ├── db/           # Database configuration
│   │   │   ├── schema/   # Drizzle schema definitions
│   │   │   ├── migrations/
│   │   │   └── seeds/
│   │   ├── utils/        # Utility functions
│   │   └── validators/   # Input validation
│   ├── router.tsx        # Router configuration
│   ├── routeTree.gen.ts  # Generated route tree
│   ├── entry-client.tsx  # Client entry point
│   └── entry-server.tsx  # Server entry point
├── app.config.ts         # TanStack Start configuration
├── drizzle.config.ts     # Drizzle Kit configuration
└── package.json
```

## Getting Started

### Prerequisites

- Node.js 18+ (or Bun)
- PostgreSQL database

### Environment Setup

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Update the `.env` file with your configuration:
   ```env
   DATABASE_URL=postgres://user:password@localhost:5432/wiki_hub
   JWT_SECRET=your-secret-key
   JWT_EXPIRES_IN=15m
   JWT_REFRESH_EXPIRES_IN=7d
   ```

### Installation

```bash
# Install dependencies
npm install

# Generate database migrations
npm run db:generate

# Apply migrations
npm run db:migrate

# Seed the database
npm run db:seed
```

### Development

```bash
# Start development server
npm run dev
```

The app will be available at `http://localhost:3000`

### Production

```bash
# Build for production
npm run build

# Start production server
npm start
```

## Features

### Authentication
- JWT-based authentication with access/refresh token rotation
- Secure HTTP-only cookies for token storage
- Role-based access control (admin, editor, contributor, viewer)

### Wiki
- Create, edit, and delete wiki pages
- Markdown support with HTML preview
- Version history with diff tracking
- Categories and tags

### EOL Tracker
- Track software product versions
- Set EOL dates and get alerts
- Dashboard for expiring versions

## API (Server Functions)

Server functions are automatically available through TanStack Start:

- **Auth**: `login`, `register`, `logout`, `getCurrentUser`, `refreshTokens`
- **Wiki**: `listPages`, `getPage`, `createPage`, `updatePage`, `deletePage`
- **EOL**: `listProducts`, `getProduct`, `createProduct`, `getVersionsByProduct`
- **Users**: `listUsers`, `getUser`, `updateUser`, `updateUserRole`

## Database Commands

```bash
# Generate migrations from schema changes
npm run db:generate

# Apply migrations
npm run db:migrate

# Push schema directly (dev only)
npm run db:push

# Open Drizzle Studio
npm run db:studio

# Run seeds
npm run db:seed
```
