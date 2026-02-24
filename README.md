# DCH Property Listing — Enterprise Platform

A full-stack, enterprise-grade property listing platform for the Irish market. Built with **NestJS**, **Angular 21**, **PostgreSQL**, and **Docker Compose**.

---

## Overview

DCH Property Listing enables users to search, filter, and save properties for rent or sale across Ireland. Administrators can manage the full property catalogue, view analytics, and control user roles — all from a dedicated admin panel.

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Docker Compose                        │
│                                                          │
│  ┌──────────────┐    ┌──────────────┐  ┌─────────────┐  │
│  │  Angular UI  │───▶│  NestJS API  │─▶│  PostgreSQL  │  │
│  │  Port: 4200  │    │  Port: 3000  │  │  Port: 5432  │  │
│  └──────────────┘    └──────────────┘  └─────────────┘  │
└─────────────────────────────────────────────────────────┘
```

| Layer      | Technology              | Version  |
|------------|-------------------------|----------|
| Frontend   | Angular + Tailwind CSS  | 21.x / 4.x |
| Backend    | NestJS + TypeORM        | 11.x / 0.3.x |
| Database   | PostgreSQL              | 16-alpine |
| Auth       | JWT + bcryptjs          | 7d expiry |
| Container  | Docker Compose          | —         |

---

## Project Structure

```
devcenterhouse/
├── docker-compose.yml              # Orchestrates all three services
├── properties-listing-api/         # NestJS REST API
│   ├── src/
│   │   ├── auth/                   # JWT auth, guards, decorators
│   │   ├── properties/             # Property CRUD + filtering
│   │   ├── users/                  # User management
│   │   └── saved-properties/       # Saved/favourite properties
│   └── README.md
├── properties-listing-ui/          # Angular 21 SPA + SSR
│   ├── src/app/
│   │   ├── core/                   # Services, guards, interceptors
│   │   ├── features/               # Page-level components
│   │   └── shared/                 # Navbar, Footer
│   └── README.md
└── property-listing-laravel-react-inertia/   # Alternative stack (reference)
```

---

## Quick Start

### Option 1 — Docker Compose (recommended)

```bash
# Clone and configure
cp properties-listing-api/.env.example properties-listing-api/.env
# Edit JWT_SECRET in .env

# Start all services
docker-compose up --build

# Seed the database
curl -X POST http://localhost:3000/api/properties/seed
```

| Service     | URL                              |
|-------------|----------------------------------|
| Frontend    | http://localhost:4200            |
| API         | http://localhost:3000/api        |
| Swagger UI  | http://localhost:3000/api/docs   |

### Option 2 — Local Development

```bash
# Backend
cd properties-listing-api
npm install
cp .env.example .env   # fill in your values
npm run start:dev

# Frontend (separate terminal)
cd properties-listing-ui
npm install
ng serve
```

---

## Key Features

### Public
- Browse properties with server-side pagination (default 12/page)
- Full-text search across title, address, city, county
- Filter by type, county, price range, bedrooms, bathrooms, status
- Sort by price, date, size, or name
- View property details with image gallery
- Landing page, About, Contact, 404

### Authenticated Users
- Register & login (JWT)
- Save / unsave properties (heart icon on cards)
- User dashboard — view all saved properties

### Admin
- Property CRUD (create, edit, delete)
- Analytics dashboard (totals, new this month, featured)
- User management — view all users and change roles
- Admin route guard — non-admins are redirected

---

## Creating an Admin User

After seeding, register via the UI, then promote via the API:

```bash
# 1. Register normally via /auth/register
# 2. Get the user ID from GET /api/users (log in as admin first)
# 3. PATCH /api/users/:id/role  { "role": "admin" }

# Or directly in the database
psql -U postgres -d properties_db
UPDATE users SET role = 'admin' WHERE email = 'your@email.com';
```

---

## Environment Variables

See [`properties-listing-api/.env.example`](properties-listing-api/.env.example) for the full list.

| Variable          | Description                          | Default                       |
|-------------------|--------------------------------------|-------------------------------|
| `DATABASE_HOST`   | Postgres host                        | `localhost`                   |
| `DATABASE_PORT`   | Postgres port                        | `5432`                        |
| `DATABASE_USER`   | Postgres username                    | `postgres`                    |
| `DATABASE_PASSWORD` | Postgres password                  | `postgres`                    |
| `DATABASE_NAME`   | Database name                        | `properties_db`               |
| `JWT_SECRET`      | Secret for signing JWT tokens        | *(required in production)*    |
| `ALLOWED_ORIGINS` | CORS whitelist (comma-separated)     | `http://localhost:4200`       |
| `PORT`            | API listen port                      | `3000`                        |

---

## Sub-project Documentation

- [Backend (NestJS API)](properties-listing-api/README.md)
- [Frontend (Angular UI)](properties-listing-ui/README.md)
