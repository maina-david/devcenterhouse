# DCH Properties — Property Listing Platform

A full-stack property listing web application built with **Laravel 12**, **React 19**, **Inertia.js**, **TypeScript**, and **Tailwind CSS v4**. Inspired by [findqo.ie](https://findqo.ie), it allows users to browse, search, filter, and enquire about properties for rent and sale across Ireland.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Laravel 12, PHP 8.4 |
| Frontend | React 19, TypeScript (strict) |
| Bridge | Inertia.js v2 |
| Styling | Tailwind CSS v4, Radix UI primitives |
| Database | PostgreSQL |
| Build | Vite 7 |
| Auth | Laravel Fortify (2FA support) |
| WebSockets | Laravel Reverb + Laravel Echo + pusher-js |
| Testing | PHPUnit 11, SQLite in-memory |
| Sitemap | spatie/laravel-sitemap |

---

## Features

### Public (no login required)

- **Landing page** (`/`) — hero search, live stats bar, featured properties grid, browse-by-type section
- **Property listing page** (`/properties`) — responsive grid with search, filters and pagination
- **Property detail page** (`/properties/{id}/{slug}`) — image gallery, full property info, features, enquiry form, related listings
- **Enquiry form** — validated contact form; rate-limited to 5 requests/minute per IP; triggers email + real-time broadcast
- **Search** — debounced full-text search across title, address, town and county
- **Filters** — listing type, property type, county, price range, bedrooms, sort order
- **Pagination** — Inertia soft navigation (no full reloads)
- **SEO** — Open Graph tags, `<meta name="description">` and canonical `<link>` on all public pages
- **Sitemap** — auto-generated XML sitemap at `/sitemap.xml` (updated on every request)
- **Responsive** — filter sidebar collapses to a full-width toggle on mobile

### Authenticated admin (`/dashboard` and `/admin/*`)

- **Dashboard** — stats overview, recent listings table, recent enquiries panel, live unread-enquiry badge
- **Real-time notifications** — Reverb WebSocket broadcasts `EnquiryReceived` to the admin dashboard; Sonner toast appears instantly with a link to the enquiry
- **Flash toasts** — Sonner toast notifications for every success/error flash message across all pages
- **Property CRUD** — create, edit, update and delete listings via `/admin/properties`
- **Enquiry management** — paginated list of all enquiries at `/admin/enquiries`; mark individual enquiries as read
- **Unread badge** — sidebar navigation shows a live count of unread enquiries
- **Authorization** — `PropertyPolicy` gates all admin actions; `AuthorizesRequests` trait on the base `Controller`

---

## Project Structure

```
app/
├── Events/
│   └── EnquiryReceived.php          # ShouldBroadcast — private channel 'admin.enquiries'
├── Http/
│   ├── Controllers/
│   │   ├── Controller.php           # Base controller — uses AuthorizesRequests
│   │   └── PropertyController.php   # index, show, enquiry, adminIndex, create, store, edit, update, destroy, enquiries, markEnquiryRead
│   ├── Middleware/
│   │   └── HandleInertiaRequests.php # Shares flash messages + unread_enquiry_count
│   └── Requests/
│       ├── StoreEnquiryRequest.php
│       ├── StorePropertyRequest.php
│       └── UpdatePropertyRequest.php
├── Mail/
│   └── EnquiryMailable.php          # ShouldQueue — sent to admin on new enquiry
├── Models/
│   ├── Enquiry.php                  # HasFactory, scopeUnread, belongsTo Property
│   └── Property.php                 # scopeActive, scopeFilter, main_image accessor, hasMany Enquiry
├── Policies/
│   └── PropertyPolicy.php           # viewAny, create, update, delete — any authenticated user
└── Http/Resources/
    └── PropertyResource.php         # JSON transformer for API use

database/
├── factories/
│   ├── EnquiryFactory.php           # Default unread; read() state
│   └── PropertyFactory.php          # forRent, forSale, inactive, sold, let, featured, inCounty, ofType states
├── migrations/
│   ├── ..._create_properties_table.php
│   └── ..._create_enquiries_table.php
└── seeders/
    ├── DatabaseSeeder.php
    └── PropertySeeder.php           # 34 realistic Irish properties with Unsplash images

resources/
├── css/
│   └── app.css                      # Tailwind v4 — pink #EE0088 primary, light + dark modes
├── views/emails/
│   └── enquiry.blade.php            # HTML email template sent to admin
└── js/
    ├── components/
    │   ├── properties/
    │   │   ├── filter-bar.tsx        # Desktop sidebar + mobile collapsible toggle
    │   │   ├── property-card.tsx     # Card — image, badges, Call + Enquire buttons (no nested <a>)
    │   │   ├── property-form.tsx     # Shared create/edit form with image/feature lists
    │   │   └── property-pagination.tsx
    │   ├── app-sidebar.tsx           # Sidebar with dynamic nav items + unread enquiry badge
    │   └── app-logo.tsx
    ├── hooks/
    │   └── use-flash-toast.ts        # Reads Inertia flash props and fires Sonner toasts
    ├── layouts/
    │   ├── app/
    │   │   └── app-sidebar-layout.tsx # Authenticated layout (Toaster wired)
    │   └── public-layout.tsx          # Public layout — auth-aware header, Toaster wired
    ├── lib/
    │   └── echo.ts                    # Laravel Echo configured for Reverb broadcaster
    ├── pages/
    │   ├── welcome.tsx                # Landing page — featured properties, SEO meta
    │   ├── dashboard.tsx              # Stats, recent enquiries, Reverb listener
    │   └── properties/
    │       ├── index.tsx              # Listing page — search, filters, grid, pagination
    │       ├── show.tsx               # Detail page — gallery, enquiry form, related, SEO meta
    │       ├── create.tsx             # Admin create form
    │       ├── edit.tsx               # Admin edit form
    │       ├── admin-index.tsx        # Admin listing management table
    │       └── enquiries.tsx          # Admin enquiry list with mark-as-read
    └── types/
        ├── index.ts
        └── property.ts               # Property, PaginatedProperties, PropertyFilters interfaces

routes/
├── channels.php                      # Reverb channel auth — 'admin.enquiries' requires login
└── web.php

tests/
├── Unit/
│   ├── ExampleTest.php
│   └── PropertyModelTest.php         # 26 tests — scopeActive, scopeFilter, casts, accessors
└── Feature/
    ├── Auth/                          # Authentication tests (existing)
    ├── Settings/                      # Profile/password/2FA tests (existing)
    ├── DashboardTest.php
    └── Properties/
        ├── PropertyCrudTest.php       # 20 tests — admin CRUD, auth guards, validation
        ├── EnquiryModelTest.php       # 14 tests — model, broadcast, rate limit, admin routes
        ├── PropertyListingTest.php    # 19 tests — listing page, filters, pagination
        ├── PropertyShowTest.php       # 13 tests — detail page, related, 404 cases
        └── PropertyEnquiryTest.php    # 13 tests — enquiry validation and flash
```

---

## Database Schema

### `properties`

| Column | Type | Notes |
|---|---|---|
| `id` | bigint PK | |
| `title` | string | |
| `slug` | string unique | SEO-friendly URL segment |
| `description` | text nullable | |
| `listing_type` | enum | `rent`, `sale` |
| `property_type` | enum | `house`, `apartment`, `flat`, `studio`, `bungalow`, `duplex`, `terraced`, `semi-detached`, `detached` |
| `status` | enum | `active`, `inactive`, `sold`, `let` — default `active` |
| `price` | decimal(10,2) | |
| `price_period` | enum nullable | `per_month`, `per_week`, `per_year` (rent only) |
| `bedrooms` | tinyint unsigned | |
| `bathrooms` | tinyint unsigned | |
| `area_sqft` | int unsigned nullable | |
| `address` | string | |
| `town` | string | |
| `county` | string | indexed |
| `eircode` | string nullable | |
| `images` | json | Array of image URLs |
| `features` | json | Array of amenity strings e.g. `["parking","garden"]` |
| `is_featured` | boolean | default false |
| `available_from` | date nullable | Rent listings only |
| `created_at / updated_at` | timestamps | |

**Indexes:** `listing_type`, `property_type`, `county`, `status`, `price`, `bedrooms`

### `enquiries`

| Column | Type | Notes |
|---|---|---|
| `id` | bigint PK | |
| `property_id` | bigint FK | cascades on delete |
| `name` | string | |
| `email` | string | |
| `phone` | string(50) nullable | |
| `message` | text | max 2000 chars |
| `is_read` | boolean | default false |
| `created_at / updated_at` | timestamps | |

**Indexes:** `property_id`, `is_read`

---

## Getting Started

### Requirements

- PHP 8.4+
- Composer
- Node.js 20+
- PostgreSQL

### Installation

```bash
# Clone and install dependencies
git clone <repo-url>
cd property-listing
composer install
npm install

# Environment setup
cp .env.example .env
php artisan key:generate

# Configure database credentials in .env, then:
php artisan migrate --seed

# Start all development servers
npm run dev          # Vite
php artisan serve    # Laravel
php artisan reverb:start  # WebSocket server (real-time notifications)
php artisan queue:work    # Queue worker (email delivery)
```

Visit `http://localhost:8000` — no login needed to browse properties.

Register at `/register` to access the admin dashboard and property management.

---

## Running Tests

Tests use an **SQLite in-memory database** (configured in `phpunit.xml`) — no PostgreSQL connection needed.

```bash
# Run all tests
php artisan test

# Run only property tests
php artisan test tests/Unit/PropertyModelTest.php tests/Feature/Properties/

# Run with coverage (requires Xdebug or PCOV)
php artisan test --coverage
```

**Test summary:** 146 tests, 581 assertions — all passing.

| Suite | File | Tests |
|---|---|---|
| Unit | `PropertyModelTest` | 26 — model scopes, casts, accessors |
| Feature | `PropertyCrudTest` | 20 — admin CRUD, auth guards, validation |
| Feature | `EnquiryModelTest` | 14 — model, broadcast event, rate limit, admin |
| Feature | `PropertyListingTest` | 19 — listing page, filters, pagination |
| Feature | `PropertyShowTest` | 13 — detail page, related listings, 404 cases |
| Feature | `PropertyEnquiryTest` | 13 — enquiry validation and success flash |
| Feature | Auth / Settings / Dashboard | 41 — existing auth tests |

---

## Key Routes

### Public

| Method | URI | Description |
|---|---|---|
| GET | `/` | Landing page |
| GET | `/properties` | Property listing with search & filters |
| GET | `/properties/{id}/{slug?}` | Property detail page |
| POST | `/properties/{id}/enquiry` | Submit contact enquiry (rate-limited 5/min) |
| GET | `/sitemap.xml` | Auto-generated XML sitemap |

### Admin (auth + verified)

| Method | URI | Description |
|---|---|---|
| GET | `/dashboard` | Stats dashboard with real-time enquiry notifications |
| GET | `/admin/properties` | All listings management table |
| GET | `/admin/properties/create` | Create property form |
| POST | `/admin/properties` | Store new property |
| GET | `/admin/properties/{id}/edit` | Edit property form |
| PUT | `/admin/properties/{id}` | Update property |
| DELETE | `/admin/properties/{id}` | Delete property |
| GET | `/admin/enquiries` | Paginated enquiry list |
| PATCH | `/admin/enquiries/{id}/read` | Mark enquiry as read |

---

## Property Filters (Query Parameters)

| Parameter | Values | Description |
|---|---|---|
| `search` | string | Searches title, address, town, county |
| `listing_type` | `rent` \| `sale` | Filter by listing type |
| `property_type` | `house`, `apartment`, etc. | Filter by property type |
| `county` | e.g. `Dublin` | Filter by county |
| `min_price` | number | Minimum price (€) |
| `max_price` | number | Maximum price (€) |
| `bedrooms` | `1`–`5` | Minimum number of bedrooms |
| `sort` | `newest`, `oldest`, `price_asc`, `price_desc` | Sort order (default: `newest`) |

Example: `/properties?listing_type=rent&county=Dublin&bedrooms=2&sort=price_asc`

---

## Real-Time Notifications (Reverb)

When a visitor submits an enquiry form:

1. The `Enquiry` record is saved to the database
2. A queued `EnquiryMailable` is dispatched to the admin email
3. `EnquiryReceived` is broadcast on the private channel `admin.enquiries`
4. Any logged-in admin on the dashboard receives a Sonner toast in real time with a link to the enquiry

Channel authorization (`routes/channels.php`) requires the user to be authenticated. The frontend connects via `resources/js/lib/echo.ts` using the Reverb broadcaster.

---

## Theme

The UI uses a **hot pink** primary colour (`#EE0088`, `oklch(0.59 0.28 345)`) matching the findqo.ie brand palette. Both light and dark modes are fully supported, with pink-tinted dark backgrounds and lighter pink for dark mode primary.

---

## Development Notes

- **Authorization** — `PropertyPolicy` is registered in `AuthServiceProvider`. All policy methods return `true` for any authenticated user (single-admin platform). The `AuthorizesRequests` trait lives on the base `Controller` so every controller inherits `$this->authorize()`.
- **Enquiry rate limiting** — the `throttle:5,1` middleware on the enquiry route limits submissions to 5 per minute per IP address.
- **Inertia navigation** — filter changes and pagination use `router.get()` with `preserveState: true` — no full page reloads.
- **Flash messages** — `HandleInertiaRequests` shares `flash.success / error / info / warning` session values. `useFlashToast` hook reads these and fires the appropriate Sonner toast.
- **Image gallery** — property images are stored as a JSON array of URLs. The seeder uses Unsplash images (2–4 per property).
- **PropertyFactory states** — use `forRent()`, `forSale()`, `inactive()`, `sold()`, `let()`, `featured()`, `inCounty('Dublin')`, `ofType('apartment')` in tests and seeders.
- **PropertyResource** — a `JsonResource` transformer is available at `App\Http\Resources\PropertyResource` for API or explicit serialization use cases.
