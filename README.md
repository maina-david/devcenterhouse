# DCH Property Listing

A property listing platform for the Irish market, implemented in **two separate stacks** to demonstrate full-spectrum engineering capability.

---

## Two Implementations, One Domain

| | NestJS + Angular (Decoupled) | Laravel + React (Monolith) |
| --- | --- | --- |
| **Backend** | NestJS 11, TypeORM, PostgreSQL | Laravel 12, Eloquent, PostgreSQL |
| **Frontend** | Angular 21, Tailwind CSS 4, SSR | React 19, Inertia.js, Tailwind CSS 4 |
| **Auth** | JWT (7-day token, role-based) | Laravel Fortify (sessions, 2FA) |
| **Real-time** | — | Laravel Reverb + WebSockets |
| **API** | REST + Swagger/OpenAPI docs | Inertia (server-driven SPA, no separate API) |
| **Testing** | Jest + Vitest | PHPUnit 11 (SQLite in-memory) |
| **Container** | Docker Compose | — |

---

## Architecture

### Stack 1 — Decoupled (NestJS + Angular)

```
┌─────────────────────────────────────────────────────────┐
│                    Docker Compose                        │
│                                                          │
│  ┌──────────────┐    ┌──────────────┐  ┌─────────────┐  │
│  │  Angular UI  │───▶│  NestJS API  │─▶│  PostgreSQL  │  │
│  │  Port: 4200  │    │  Port: 3000  │  │  Port: 5432  │  │
│  │  SSR + lazy  │    │  REST + JWT  │  │  TypeORM     │  │
│  └──────────────┘    └──────────────┘  └─────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### Stack 2 — Monolith (Laravel + React + Inertia)

```
┌───────────────────────────────────────────────────┐
│                 Laravel Application                │
│                                                   │
│  React (Inertia SPA) ◀──▶ Laravel Controllers    │
│                               │                  │
│                          PostgreSQL               │
│                               │                  │
│                    Laravel Reverb (WebSocket)     │
└───────────────────────────────────────────────────┘
```

---

## Repository Structure

```
devcenterhouse/
├── docker-compose.yml                          # Runs the NestJS stack
├── properties-listing-api/                     # Stack 1 — NestJS REST API
│   ├── src/
│   │   ├── auth/                               # JWT auth, guards, decorators, strategies
│   │   ├── properties/                         # Property CRUD, filtering, seeder
│   │   ├── users/                              # User management
│   │   └── saved-properties/                   # Saved/favourite properties
│   └── README.md
├── properties-listing-ui/                      # Stack 1 — Angular 21 SPA + SSR
│   ├── src/app/
│   │   ├── core/                               # Services, guards, interceptors, models
│   │   ├── features/                           # All page components (lazy-loaded)
│   │   └── shared/                             # Navbar, Footer
│   └── README.md
└── property-listing-laravel-react-inertia/     # Stack 2 — Laravel + React monolith
    ├── app/                                    # Laravel PHP backend
    │   ├── Http/Controllers/                   # PropertyController (full CRUD + enquiries)
    │   ├── Models/                             # Property, Enquiry, User
    │   ├── Events/                             # EnquiryReceived (broadcasts via Reverb)
    │   ├── Mail/                               # EnquiryMailable (queued email)
    │   └── Policies/                           # PropertyPolicy (authorization)
    ├── resources/js/                           # React + TypeScript frontend (Inertia)
    │   ├── components/                         # Shared components + Radix UI primitives
    │   ├── pages/                              # Inertia page components
    │   └── hooks/                              # Custom hooks (2FA, clipboard, etc.)
    ├── database/                               # Migrations, factories, seeders
    └── tests/                                  # PHPUnit feature + unit tests
```

---

## Stack 1 — NestJS + Angular

### Quick Start (Docker Compose)

```bash
cp properties-listing-api/.env.example properties-listing-api/.env
# Set JWT_SECRET in .env

docker-compose up --build

# Seed demo data
curl -X POST http://localhost:3000/api/properties/seed
```

| Service    | URL                                      |
| ---------- | ---------------------------------------- |
| Frontend   | <http://localhost:4200>                  |
| API        | <http://localhost:3000/api>              |
| Swagger UI | <http://localhost:3000/api/docs>         |

### Quick Start (Local Dev)

```bash
# Backend
cd properties-listing-api && npm install && npm run start:dev

# Frontend (separate terminal)
cd properties-listing-ui && npm install && ng serve
```

### NestJS + Angular Features

#### Public Access

- Property listing with server-side pagination (default 12/page, max 100)
- Full-text search across title, address, city, county
- Filters: type, county, price range, bedrooms, bathrooms, status
- Sort by price, date, size, name (ASC / DESC)
- Property detail page with image gallery
- Landing page, About, Contact, 404

#### Authenticated User Access

- Register & login (JWT, 7-day expiry)
- Save / unsave properties (heart button on cards)
- User dashboard — saved properties grid

#### Admin Panel

- Property CRUD (create, edit, delete)
- Analytics dashboard (totals, per-status, featured, new this month)
- User management — list users, promote/demote roles
- Admin route guard — non-admins redirected

---

## Stack 2 — Laravel + React + Inertia

### Quick Start

```bash
cd property-listing-laravel-react-inertia
composer install
npm install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
npm run dev
# In separate terminal:
php artisan serve
```

### Laravel + React Features

#### Public

- Landing page — hero search, live stats, featured grid, browse-by-type
- Property listing with debounced search, filters, Inertia pagination (no full reload)
- Property detail — image gallery, full spec, enquiry form
- Enquiry form — rate-limited (5/min per IP), triggers queued email + WebSocket broadcast
- SEO — Open Graph tags, meta descriptions, canonical links on all public pages
- Auto-generated XML sitemap at `/sitemap.xml`

#### Admin

- Dashboard — stats, recent listings, recent enquiries, live unread-enquiry badge
- Real-time notifications — Reverb WebSocket broadcasts `EnquiryReceived`; Sonner toast appears instantly
- Property CRUD via `/admin/properties`
- Enquiry management — paginated list, mark as read
- Flash toast notifications throughout

#### Auth (Laravel Fortify)

- Email + password login
- Two-factor authentication (TOTP)
- Email verification
- Password reset

---

## Key Differences Between Stacks

| Concern | NestJS + Angular | Laravel + React |
| --- | --- | --- |
| API style | REST (decoupled, Swagger docs) | Inertia (server-driven, no separate API) |
| Auth mechanism | Stateless JWT | Stateful sessions (Fortify) |
| Real-time | Not included | Reverb WebSockets + Echo |
| 2FA | Role-based only | Full TOTP 2FA |
| SEO | Angular SSR | Native server-side rendering via Blade/Inertia |
| DB interaction | TypeORM (query builder) | Eloquent ORM (scopes, accessors) |
| Testing | Jest + Vitest | PHPUnit (SQLite in-memory, 15+ test files) |

---

## Creating an Admin User (Stack 1)

```bash
# Register via UI, then promote in the database
psql -U postgres -d properties_db
UPDATE users SET role = 'admin' WHERE email = 'your@email.com';
```

---

## Environment Variables (Stack 1)

See [`properties-listing-api/.env.example`](properties-listing-api/.env.example) for the full list.

| Variable            | Description                      | Default                  |
| ------------------- | -------------------------------- | ------------------------ |
| `DATABASE_HOST`     | Postgres host                    | `localhost`              |
| `DATABASE_PORT`     | Postgres port                    | `5432`                   |
| `DATABASE_USER`     | Postgres username                | `postgres`               |
| `DATABASE_PASSWORD` | Postgres password                | `postgres`               |
| `DATABASE_NAME`     | Database name                    | `properties_db`          |
| `JWT_SECRET`        | JWT signing secret               | *(required)*             |
| `ALLOWED_ORIGINS`   | CORS whitelist (comma-separated) | `http://localhost:4200`  |
| `PORT`              | API listen port                  | `3000`                   |

---

## Sub-project Documentation

- [Stack 1 — NestJS API](properties-listing-api/README.md)
- [Stack 1 — Angular UI](properties-listing-ui/README.md)
- [Stack 2 — Laravel + React + Inertia](property-listing-laravel-react-inertia/README.md)
