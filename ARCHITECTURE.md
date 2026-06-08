# Architecture Overview — Policy Hub (Chubb APAC)

## Component Hierarchy

```
AppComponent
└── AppLayout (layouts/app-layout)
    ├── Header (layouts/header)
    │   └── ThemeToggle (layouts/header)
    └── PolicyDashboard [CONTAINER / SMART]
        ├── PolicyFilter [presentational — search + filter trigger]
        │   └── FilterPanel [MatBottomSheet — advanced filters]
        ├── SummaryPanel [presentational — KPI cards + GWP arc]
        ├── BulkActionBar [presentational — flag selected]
        ├── PolicyTable [presentational — table + paginator]
        │   └── PolicyDrilldownDialog [MatDialog — detail + renew]
        ├── LoadingSkeleton [shared — shimmer placeholders]
        └── ErrorState [shared — error card + retry]
```

## State Flow

```
URL query params
       │  (seed on init)
       ▼
  PolicyFilter ──updateFilters()──► PolicyStore.filters (signal)
                                            │
                                    loadingPolicies()
                                            │
                                    PolicyApiService.getPolicies(filters, sort)
                                       (status/region/lob/premium → server)
                                       (search/dates → client-side computed)
                                            │
                                    policies.set(result)
                                            │
                                    filteredPolicies (computed signal)
                                       ├── PolicyTable.dataSource
                                       └── SummaryPanel.summary (computed)
```

## Layer Responsibilities

| Layer | Path | Responsibility |
|---|---|---|
| **Core** | `src/app/core/` | Singleton services (Storage, Logger, Theme, HTTP interceptor) |
| **Shared** | `src/app/shared/` | Reusable UI components (LoadingSkeleton, ErrorState) |
| **Feature** | `src/app/features/policy-dashboard/` | All domain logic |
| **Store** | `features/.../store/policy.store.ts` | Single source of truth (signals) |
| **API Service** | `features/.../services/policy-api.service.ts` | HTTP boundary only |
| **Pages** | `features/.../pages/` | Smart/container components — compose the view |
| **Components** | `features/.../components/` | Presentational — receive data via store injection |

## State Categories

| State Type | Location | Example |
|---|---|---|
| **Server state** | `PolicyStore.policies` signal | Raw policy list from API |
| **Client state** | `PolicyStore.selectedPolicyIds`, `filters`, `sort` | UI selections, active filters |
| **Derived state** | `PolicyStore.filteredPolicies`, `summary` | Computed from server + client state |
| **URL state** | `?status=Active&region=Singapore` | Shareable / bookmarkable filter view |
| **Persisted state** | localStorage via `StorageService` | Theme, page size, last-used filters |

## Key Design Decisions

- **Angular Signal Store (no NgRx)**: Application complexity didn't justify NgRx boilerplate. Signals give reactive derived state (`computed`) without streams, and `effect()` for side effects. See `DESIGN_DECISIONS.md`.
- **Zoneless change detection** (`provideZonelessChangeDetection()`): Future-proof, required for signals-first architecture.
- **Hybrid server/client filtering**: Enum filters (status, region, LoB) sent as `HttpParams`; free-text and date range computed client-side (JSON Server v1 limitation — see API service comment).
- **HTTP Error Interceptor** (`core/interceptors/error.interceptor.ts`): Centralised error normalisation so every API caller receives a consistent `Error` with a user-friendly message.
- **`@defer (on idle)`**: BulkActionBar and PolicyTable are deferred until after initial paint to improve LCP.
