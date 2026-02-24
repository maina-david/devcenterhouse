# DCH Property Listing — NestJS REST API

Enterprise-grade REST API for the DCH Property Listing platform. Built with **NestJS 11**, **TypeORM**, and **PostgreSQL 16**.

---

## Tech Stack

| Concern              | Library / Tool                      | Version   |
| -------------------- | ----------------------------------- | --------- |
| Framework            | NestJS                              | ^11.0.1   |
| Language             | TypeScript                          | ^5.7.3    |
| ORM                  | TypeORM                             | ^0.3.28   |
| Database             | PostgreSQL                          | 16-alpine |
| Authentication       | @nestjs/jwt + passport-jwt          | ^11 / ^4  |
| Password Hashing     | bcryptjs                            | ^3.0.3    |
| Validation           | class-validator + class-transformer | ^0.14     |
| Rate Limiting        | @nestjs/throttler                   | ^6.5.0    |
| API Documentation    | @nestjs/swagger                     | ^11.2.6   |
| Security Headers     | helmet                              | ^8.1.0    |
| Config Management    | @nestjs/config                      | ^4.0.3    |
| Testing              | Jest + supertest                    | ^30 / ^7  |
| Linting              | ESLint + Prettier                   | ^9 / ^3   |

---

## Prerequisites

- Node.js >= 20
- npm >= 10
- PostgreSQL 16 (or use Docker Compose from the project root)

---

## Installation

```bash
cd properties-listing-api
npm install
cp .env.example .env
# Edit .env — at minimum set JWT_SECRET
```

---

## Environment Variables

| Variable              | Description                           | Example / Default    |
| --------------------- | ------------------------------------- | -------------------- |
| `DATABASE_HOST`       | PostgreSQL host                       | `localhost`          |
| `DATABASE_PORT`       | PostgreSQL port                       | `5432`               |
| `DATABASE_USER`       | PostgreSQL username                   | `postgres`           |
| `DATABASE_PASSWORD`   | PostgreSQL password                   | `postgres`           |
| `DATABASE_NAME`       | Database name                         | `properties_db`      |
| `JWT_SECRET`          | Secret used to sign JWT tokens        | *(required)*         |
| `ALLOWED_ORIGINS`     | CORS allowed origins, comma-separated | `http://localhost:4200` |
| `NODE_ENV`            | Runtime environment                   | `development`        |
| `PORT`                | HTTP port                             | `3000`               |

---

## Running the API

```bash
# Development (watch mode)
npm run start:dev

# Production build
npm run build
npm run start:prod

# Via Docker Compose (from project root)
docker-compose up api
```

The API starts at `http://localhost:3000/api`.
Swagger UI is available at `http://localhost:3000/api/docs`.

---

## Database Migrations

```bash
npm run migration:generate -- src/database/migrations/MigrationName
npm run migration:run
npm run migration:revert
npm run migration:show
```

> In development, `synchronize: true` keeps the schema in sync automatically.
> In production, set `synchronize: false` and run migrations explicitly.

---

## Database Schema

### `users`

| Column    | Type         | Constraints             |
| --------- | ------------ | ----------------------- |
| id        | SERIAL       | PK                      |
| email     | VARCHAR(255) | UNIQUE, INDEX, NOT NULL |
| password  | VARCHAR(255) | NOT NULL (bcrypt hash)  |
| firstName | VARCHAR(100) | NOT NULL                |
| lastName  | VARCHAR(100) | NOT NULL                |
| role      | VARCHAR(20)  | DEFAULT 'user'          |
| createdAt | TIMESTAMP    | AUTO                    |
| updatedAt | TIMESTAMP    | AUTO                    |

### `properties`

| Column        | Type          | Constraints / Notes              |
| ------------- | ------------- | -------------------------------- |
| id            | SERIAL        | PK                               |
| title         | VARCHAR(255)  | NOT NULL                         |
| description   | TEXT          | nullable                         |
| price         | DECIMAL(10,2) | NOT NULL, INDEX                  |
| propertyType  | VARCHAR(50)   | INDEX (house/apartment/studio…)  |
| bedrooms      | INTEGER       | nullable, INDEX                  |
| bathrooms     | INTEGER       | nullable                         |
| areaSqft      | INTEGER       | nullable                         |
| address       | VARCHAR(255)  | NOT NULL                         |
| city          | VARCHAR(100)  | NOT NULL                         |
| county        | VARCHAR(100)  | INDEX                            |
| eircode       | VARCHAR(20)   | nullable                         |
| status        | VARCHAR(20)   | INDEX (for_rent / for_sale)      |
| images        | text[]        | default: []                      |
| latitude      | DECIMAL(9,6)  | nullable                         |
| longitude     | DECIMAL(9,6)  | nullable                         |
| availableFrom | DATE          | nullable                         |
| isFeatured    | BOOLEAN       | INDEX, default: false            |
| createdAt     | TIMESTAMP     | INDEX, AUTO                      |
| updatedAt     | TIMESTAMP     | AUTO                             |

Composite indexes: `(county, status)`, `(propertyType, status)`, `(price, createdAt)`

### `saved_properties`

| Column     | Type      | Constraints                         |
| ---------- | --------- | ----------------------------------- |
| id         | SERIAL    | PK                                  |
| userId     | INTEGER   | FK → users(id), CASCADE DELETE      |
| propertyId | INTEGER   | FK → properties(id), CASCADE DELETE |
| createdAt  | TIMESTAMP | AUTO                                |

Unique constraint: `(userId, propertyId)`

---

## API Endpoints

### Auth — `/api/auth`

| Method | Path             | Auth | Description                                          |
| ------ | ---------------- | ---- | ---------------------------------------------------- |
| POST   | `/auth/register` | —    | Register with email, password, firstName, lastName   |
| POST   | `/auth/login`    | —    | Login — returns `{ accessToken, user }`              |
| GET    | `/auth/me`       | JWT  | Returns current authenticated user                   |

### Properties — `/api/properties`

| Method | Path                  | Auth | Role  | Description                       |
| ------ | --------------------- | ---- | ----- | --------------------------------- |
| GET    | `/properties`         | —    | —     | Paginated list with query filters |
| GET    | `/properties/:id`     | —    | —     | Single property by ID             |
| GET    | `/properties/stats`   | JWT  | admin | Aggregate counts                  |
| POST   | `/properties`         | JWT  | admin | Create a property                 |
| PATCH  | `/properties/:id`     | JWT  | admin | Partial update                    |
| DELETE | `/properties/:id`     | JWT  | admin | Delete — returns 204 No Content   |
| POST   | `/properties/seed`    | —    | —     | Seeds 40 mock properties          |

**Query parameters for `GET /properties`:**

| Param     | Type   | Default   | Notes                                           |
| --------- | ------ | --------- | ----------------------------------------------- |
| search    | string | —         | Full-text across title, address, city, county   |
| type      | string | —         | house / apartment / studio / townhouse / bungalow |
| county    | string | —         | Partial ILIKE match                             |
| minPrice  | number | —         | Inclusive lower bound                           |
| maxPrice  | number | —         | Inclusive upper bound                           |
| bedrooms  | number | —         | Minimum bedroom count                           |
| bathrooms | number | —         | Minimum bathroom count                          |
| status    | string | —         | for_rent / for_sale                             |
| page      | number | 1         |                                                 |
| limit     | number | 12        | Max 100                                         |
| sortBy    | string | createdAt | createdAt / price / bedrooms / areaSqft / title |
| sortOrder | string | DESC      | ASC / DESC                                      |

### Users — `/api/users`

| Method | Path                | Auth | Role  | Description                    |
| ------ | ------------------- | ---- | ----- | ------------------------------ |
| GET    | `/users/me`         | JWT  | —     | Current user profile           |
| GET    | `/users`            | JWT  | admin | List all users                 |
| PATCH  | `/users/:id/role`   | JWT  | admin | Update role to `user` or `admin` |

### Saved Properties — `/api/saved-properties`

| Method | Path                            | Auth | Description                         |
| ------ | ------------------------------- | ---- | ----------------------------------- |
| GET    | `/saved-properties`             | JWT  | Full saved properties list          |
| GET    | `/saved-properties/ids`         | JWT  | Property IDs only (UI optimisation) |
| POST   | `/saved-properties/:propertyId` | JWT  | Save a property (idempotent)        |
| DELETE | `/saved-properties/:propertyId` | JWT  | Unsave a property                   |

---

## Module Architecture

```
AppModule
├── ConfigModule (global, reads .env)
├── ThrottlerModule (100 req / 60 s window)
├── TypeOrmModule (PostgreSQL)
├── AuthModule
│   ├── AuthController
│   ├── AuthService       (bcrypt + JWT signing)
│   ├── JwtStrategy       (Passport JWT validation)
│   ├── JwtAuthGuard
│   ├── RolesGuard        (@Roles() enforcement)
│   ├── @Roles()          decorator
│   └── @CurrentUser()    param decorator
├── PropertiesModule
│   ├── PropertiesController
│   └── PropertiesService
├── UsersModule
│   ├── UsersController
│   └── UsersService
└── SavedPropertiesModule
    ├── SavedPropertiesController
    └── SavedPropertiesService
```

---

## Security

| Feature           | Implementation                                      |
| ----------------- | --------------------------------------------------- |
| Password storage  | bcryptjs, 12 salt rounds                            |
| Token format      | JWT, signed with `JWT_SECRET`, expires in 7 days   |
| HTTP headers      | helmet (XSS, HSTS, no-sniff, etc.)                 |
| CORS              | Configurable origin whitelist via `ALLOWED_ORIGINS` |
| Rate limiting     | 100 requests per 60-second window (global)          |
| Input validation  | class-validator — whitelist, forbidNonWhitelisted   |
| Role enforcement  | `RolesGuard` + `@Roles('admin')` per route          |

---

## Testing

```bash
npm run test          # Unit tests
npm run test:watch    # Watch mode
npm run test:cov      # Coverage report
npm run test:e2e      # End-to-end tests
```

---

## Seeding

```bash
curl -X POST http://localhost:3000/api/properties/seed
```

Seeds 40 properties across 8 Irish counties with realistic data. Idempotent — no-op if data already exists.
