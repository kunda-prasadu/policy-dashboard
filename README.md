# Policy Hub — Chubb APAC Policy Dashboard

A production-quality insurance policy management dashboard built with **Angular 20**, **Angular Material 3**, and a custom **signal-based state store**. Designed for Chubb APAC operations to provide real-time visibility into policy portfolios across regions and lines of business.

---

## Features

| Area | Details |
|---|---|
| **Summary Cards** | Live counts for Active, Pending, Expired, and Cancelled policies; click any card to drill down into a filtered policy list |
| **Expiring Widget** | SVG arc progress indicator showing % of active policies expiring within 30 days; animated stroke-dashoffset |
| **GWP Breakdown** | Animated progress bars for Gross Written Premium across 4 lines of business (Marine, Property, Liability, Casualty) |
| **Policy Table** | Sortable, paginated table with inline flag-for-review toggle; bulk row selection |
| **Drill-down Dialog** | Full policy list filtered by status or expiry window; expiring mode adds urgency badges (critical / high / low) and row tinting |
| **Renew Button** | Optimistic PATCH to mark expiring policies Active; spinner feedback during in-flight request |
| **Filter Bar** | Instant search (policy number, holder, underwriter) + bottom-sheet "All Filters" (status, region, LOB, premium range, date range) |
| **URL Sync** | All active filters are reflected in URL query params; shareable and browser-back compatible |
| **Bulk Flag** | Select multiple policies and flag for underwriter review in one action; per-policy PATCH + snackbar confirmation |
| **Dark / Light Theme** | Toggle persisted to `localStorage`; CSS custom properties (`--mat-sys-*`) throughout |
| **Loading Skeleton** | Shimmer placeholder rendered while the initial API call is in-flight |
| **Error State** | Graceful error card with a retry button |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Angular 20 (standalone components, zoneless change detection) |
| UI Library | Angular Material 3 (`MatDialog`, `MatTable`, `MatBottomSheet`, `MatSnackBar`, …) |
| State | Custom signal store — `signal()`, `computed()`, `effect()` — no NgRx |
| Styling | SCSS + BEM, Material 3 CSS tokens, `::ng-deep` MDC overrides |
| Mock API | JSON Server (port 3000), GET + PATCH, 250+ seeded records |
| Testing | Jasmine + Karma + ChromeHeadless — 82 passing tests |
| Build | Angular CLI 20 / esbuild |

---

## Prerequisites

- **Node.js** ≥ 18
- **npm** ≥ 9

---

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Start the mock API

The dashboard reads from and writes to a local JSON Server instance.

```bash
npm run start:api
```

This serves `mock-api/db.json` on `http://localhost:3000`. Keep this terminal running.

> To regenerate the seed data (250+ randomised policies):
> ```bash
> node mock-api/generate-data.js
> ```

### 3. Start the dev server

In a separate terminal:

```bash
npm start
# or
ng serve
```

Open `http://localhost:4200` in your browser.

---

## Available Scripts

| Command | Description |
|---|---|
| `npm start` | Start Angular dev server on port 4200 |
| `npm run start:api` | Start JSON Server mock API on port 3000 |
| `npm test` | Run the full unit-test suite (Jasmine + Karma, ChromeHeadless) |
| `npm run build` | Production build (output: `dist/`) |
| `npm run watch` | Incremental dev build |

---

## Project Structure

```
src/app/
├── core/
│   └── services/
│       └── theme.service.ts          # Dark/light theme toggle, localStorage persistence
├── features/
│   └── policy-dashboard/
│       ├── components/
│       │   ├── bulk-action-bar/      # Select-all + flag-for-review toolbar
│       │   ├── error-state/          # Error card with retry
│       │   ├── filter-panel/         # Bottom-sheet advanced filter form
│       │   ├── loading-skeleton/     # Shimmer placeholder
│       │   ├── policy-drilldown-dialog/  # Status / expiring drill-down dialog
│       │   ├── policy-filter/        # Search bar + filter chips
│       │   ├── policy-table/         # Mat-table with sort + pagination
│       │   └── summary-pannl/        # KPI cards + GWP bars + SVG arc widget
│       ├── constants/                # Default filter values, LOB config
│       ├── models/                   # TypeScript interfaces (Policy, Filter, Pagination, …)
│       ├── pages/
│       │   └── policy-dashboard/     # Top-level page shell
│       ├── services/
│       │   └── policy-api.service.ts # HTTP client (GET policies, PATCH flag/renew)
│       └── store/
│           └── policy.store.ts       # Signal-based state store
├── layouts/                          # App shell / toolbar layout
├── shared/                           # Shared pipes / directives
└── themes/                           # SCSS theme tokens
mock-api/
├── db.json                           # JSON Server database (250+ policies)
└── generate-data.js                  # Seeding script (Faker.js + UUID)
```

---

## Architecture

### Signal-Based State Store

`PolicyStore` is a root-level injectable that owns all application state as Angular signals. There is no NgRx, no BehaviorSubject, and no zone-based change detection.

```
policies (signal)  ──►  filteredPolicies (computed)  ──►  summary (computed)
filters  (signal)  ─╯                                       └── status counts
                                                            └── GWP by LOB
                                                            └── expiringWithin30Days
```

Mutations are **optimistic**: the signal is updated immediately, then the PATCH request fires in the background. This gives instant UI feedback without waiting on the network.

### Zoneless Change Detection

The app is bootstrapped with `provideZonelessChangeDetection()`. Components rely entirely on signal-driven reactivity — no `ChangeDetectorRef.markForCheck()` calls are needed anywhere.

### URL Query Param Sync

`PolicyFilterComponent` reads and writes Angular Router query params on every filter change. Navigating to a bookmarked URL restores the exact filter state automatically.

---

## API Contract

The mock API is a JSON Server instance with the following endpoints:

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/policies` | Fetch all policies |
| `PATCH` | `/policies/:id` | Update a policy (flag or renew) |

**Flag for review** — sends `{ flaggedForReview: true }` \
**Renew policy** — sends `{ status: "Active" }`

---

## Testing

```bash
npm test
```

82 tests across 6 spec files:

| Spec file | Tests |
|---|---|
| `policy.store.spec.ts` | ~30 — filters, summary, selection, flag, renew |
| `policy-api.service.spec.ts` | 3 — GET, PATCH flag, PATCH renew |
| `bulk-action-bar.spec.ts` | 4 — create, flag action, snackbar singular/plural |
| `policy-table.spec.ts` | 7 — create, formatPremium, toggleSelectAll |
| `summary-pannl.spec.ts` | 17 — expiringPct, arcOffset, barPct, formatPremium, openDrilldown |
| `policy-drilldown-dialog.spec.ts` | 18 — mode filtering, columns, urgency, renew |
| Auto-generated stubs | 3 — App, ErrorState, LoadingSkeleton |

Key testing patterns used:
- Real `PolicyStore` + `provideHttpClientTesting()` (avoids signal graph breakage from `jasmine.createSpyObj`)
- `spyOn(component['dialog'], 'open')` to target the component-scope `MatDialog` instance
- `provideZonelessChangeDetection()` in every `TestBed` (required for zoneless apps)

