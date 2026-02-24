# DCH Property Listing — Angular UI

Modern, server-side rendered frontend for the DCH Property Listing platform. Built with **Angular 21**, **Tailwind CSS 4**, and **Angular Signals**.

---

## Tech Stack

| Concern          | Library / Tool          | Version  |
| ---------------- | ----------------------- | -------- |
| Framework        | Angular (standalone)    | ^21.1.0  |
| Language         | TypeScript              | ~5.9.2   |
| Styling          | Tailwind CSS            | ^4.1.12  |
| SSR              | @angular/ssr            | ^21.1.4  |
| HTTP             | Angular HttpClient      | built-in |
| State Management | Angular Signals         | built-in |
| Routing          | Angular Router          | built-in |
| Build Tool       | @angular/build          | ^21.1.4  |
| Testing          | Vitest + jsdom          | ^4 / ^27 |
| Linting          | ESLint + Angular plugin | ^9       |
| Fonts            | Inter (Google Fonts)    | —        |

---

## Prerequisites

- Node.js >= 20
- npm >= 10
- Angular CLI >= 21 (`npm install -g @angular/cli`)
- The [NestJS API](../properties-listing-api/README.md) running on port 3000

---

## Installation

```bash
cd properties-listing-ui
npm install
```

---

## Environment Configuration

| File                                   | Used when   | API URL                         |
| -------------------------------------- | ----------- | ------------------------------- |
| `src/environments/environment.ts`      | Development | `http://localhost:3000/api`     |
| `src/environments/environment.prod.ts` | Production  | *(set your production API URL)* |

Production builds automatically swap `environment.ts` → `environment.prod.ts` via Angular's `fileReplacements`.

---

## Running Locally

```bash
# Start dev server (with live reload)
ng serve

# Or via npm
npm start
```

App is served at `http://localhost:4200`.

---

## Building for Production

```bash
ng build
# Output written to dist/properties-listing-ui/
```

The production build enables tree-shaking, minification, route-level lazy-loading, SSR bundle generation, and environment file replacement.

---

## Running via Docker Compose

```bash
# From the project root
docker-compose up ui
```

---

## Project Structure

```
src/
└── app/
    ├── core/                           # Framework-level singletons
    │   ├── guards/
    │   │   ├── auth.guard.ts           # Redirects to /auth/login if unauthenticated
    │   │   └── admin.guard.ts          # Redirects to /properties if not admin
    │   ├── interceptors/
    │   │   └── auth.interceptor.ts     # Attaches Bearer token to every request
    │   ├── models/
    │   │   ├── property.model.ts       # Property, PropertyFilters, PaginatedResponse
    │   │   └── user.model.ts           # User, AuthResponse, PropertyStats
    │   └── services/
    │       ├── auth.service.ts         # Signal-based auth state + localStorage
    │       ├── property.service.ts     # Property CRUD + stats
    │       └── saved-properties.service.ts
    │
    ├── features/
    │   ├── landing/                    # Hero, featured properties, how-it-works, CTA
    │   ├── properties/
    │   │   ├── pages/
    │   │   │   ├── property-listing/   # Filterable, paginated listing page
    │   │   │   └── property-detail/    # Single property view
    │   │   └── components/
    │   │       ├── filter-panel/       # Advanced filters sidebar / mobile drawer
    │   │       ├── property-card/      # Card with heart/save button overlay
    │   │       └── pagination/         # Page controls
    │   ├── auth/
    │   │   ├── login/
    │   │   └── register/
    │   ├── admin/
    │   │   ├── dashboard/              # Stats cards + recent properties table
    │   │   ├── properties/             # Full property table with CRUD actions
    │   │   ├── property-form/          # Dual-mode create / edit form
    │   │   └── users/                  # User table with inline role selector
    │   ├── user/
    │   │   └── dashboard/              # Saved properties grid + profile
    │   ├── about/
    │   ├── contact/
    │   └── not-found/                  # 404 page
    │
    ├── shared/
    │   └── components/
    │       ├── navbar/                 # Responsive, auth-aware navigation
    │       └── footer/
    │
    ├── app.ts                          # Root component (conditional navbar/footer)
    ├── app.html                        # Shell template
    ├── app.routes.ts                   # All route definitions
    └── app.config.ts                   # Providers: router, HTTP, interceptors, SSR
```

---

## Routes

| Path                         | Component                | Guard      |
| ---------------------------- | ------------------------ | ---------- |
| `/`                          | LandingComponent         | —          |
| `/properties`                | PropertyListingComponent | —          |
| `/properties/:id`            | PropertyDetailComponent  | —          |
| `/auth/login`                | LoginComponent           | —          |
| `/auth/register`             | RegisterComponent        | —          |
| `/dashboard`                 | UserDashboardComponent   | authGuard  |
| `/admin`                     | AdminDashboardComponent  | adminGuard |
| `/admin/properties`          | AdminPropertiesComponent | adminGuard |
| `/admin/properties/new`      | PropertyFormComponent    | adminGuard |
| `/admin/properties/:id/edit` | PropertyFormComponent    | adminGuard |
| `/admin/users`               | AdminUsersComponent      | adminGuard |
| `/about`                     | AboutComponent           | —          |
| `/contact`                   | ContactComponent         | —          |
| `/**`                        | NotFoundComponent        | —          |

All routes are **lazy-loaded** for optimal initial bundle size.

---

## Core Services

### AuthService

Signal-based authentication. Persists token and user to `localStorage` (guarded by `PLATFORM_ID` for SSR safety).

```typescript
authService.currentUser()     // Signal<User | null>
authService.isAuthenticated() // Signal<boolean>
authService.isAdmin()         // Signal<boolean>
authService.login(email, password)
authService.register(firstName, lastName, email, password)
authService.logout()
authService.getToken()        // string | null
```

### PropertyService

```typescript
propertyService.getProperties(filters)     // Observable<PaginatedResponse<Property>>
propertyService.getProperty(id)            // Observable<Property>
propertyService.getStats()                 // Observable<PropertyStats>
propertyService.createProperty(data)       // Observable<Property>
propertyService.updateProperty(id, data)   // Observable<Property>
propertyService.deleteProperty(id)         // Observable<void>
propertyService.seedDatabase()             // Observable<{ message, count }>
```

### SavedPropertiesService

```typescript
savedService.isSaved(propertyId)   // boolean (from signal)
savedService.loadSavedIds()        // fetches IDs from API on login
savedService.toggle(propertyId)    // Observable — save or unsave
```

---

## Key Architectural Decisions

| Decision                     | Rationale                                                    |
| ---------------------------- | ------------------------------------------------------------ |
| Standalone components        | No NgModule boilerplate; naturally tree-shakeable            |
| Angular Signals              | Built-in reactivity — no external state library needed       |
| Lazy-loaded routes           | Initial bundle stays small; pages load on demand             |
| Functional guards/interceptors | `inject()`-compatible; no class boilerplate                |
| SSR with PLATFORM_ID guard   | Prevents `localStorage`/`window` crashes on the server       |
| Tailwind CSS 4               | Utility-first; no runtime JS; automatically purged           |

---

## Testing

```bash
npm test             # Vitest unit tests
npm run test:watch   # Watch mode
```

---

## Brand

- Primary colour: `#EE0088`
- Font: Inter (Google Fonts, loaded via `src/styles.css`)
- Admin sidebar: `#1e293b`
