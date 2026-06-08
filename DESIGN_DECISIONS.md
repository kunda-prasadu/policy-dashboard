# Design Decisions — Policy Hub (Chubb APAC)

## State Management: Angular Signals (custom store) — not NgRx

**Decision**: Custom signal-based store (`PolicyStore`) using `signal()`, `computed()`, and `effect()`.

**Why not NgRx?**
- NgRx requires Actions → Reducers → Effects → Selectors for every async operation — significant boilerplate for a single-feature app.
- Time constraint: NgRx setup would consume 20–30% of the available sprint.
- NgRx shines for apps with multiple feature modules sharing complex state across teams. This app has one feature domain.

**Why Signals over RxJS BehaviorSubjects?**
- No need for `takeUntil` subscription management — signals are garbage-collected automatically.
- Computed signals (`filteredPolicies`, `summary`) automatically recalculate when dependencies change — no manual `combineLatest`.
- Angular 20's recommended reactive primitive; aligns with the framework's direction.

**Scalability path**: If requirements grow to multi-feature (e.g., Claims, Renewals), `PolicyStore` would be wrapped with `@ngrx/signals` (SignalStore) or split into feature stores, adding negligible migration cost.

---

## UI Component Library: Angular Material 3

**Decision**: Angular Material 3 (`mat-table`, `mat-sort`, `mat-paginator`, `mat-dialog`, `mat-bottom-sheet`, `mat-snack-bar`).

**Why?**
- Built-in WCAG 2.1 AA compliance (keyboard nav, ARIA, focus management) — would take days to replicate from scratch.
- Theming via CSS custom properties (`--mat-sys-*`) integrates seamlessly with light/dark token system.
- `MatTableDataSource` gives free client-side filter/paginate without RxJS plumbing.

**Trade-off**: Bundle size (~150 kB gzipped for Material). Acceptable for enterprise dashboard; mitigated by lazy loading and `@defer`.

---

## Filtering: Hybrid Server + Client

**Decision**: Status, region, lineOfBusiness, and minPremium sent as `HttpParams` to JSON Server. Free-text search and date range applied client-side via `filteredPolicies` computed signal.

**Why?**
- JSON Server v1 beta's `?q=` full-text search only matches exact fields individually, not cross-field OR search.
- JSON Server date range comparisons are unreliable without custom middleware.
- Server-side enum filtering (4 params) meaningfully reduces the response payload for common use cases.

**Production path**: A real API would support all filter params server-side, eliminating the computed signal entirely.

---

## Theming: CSS Custom Properties (`--mat-sys-*`) + SCSS

**Decision**: Extend Angular Material's design token system. Define dark theme via `html.dark-theme {}` class toggled by `ThemeService`.

**Why not Tailwind?**
- Angular Material already ships token-based theming — a second system would conflict.
- CSS variables work in all modern browsers; zero JS runtime cost.

---

## LocalStorage: Generic `StorageService`

**Decision**: Single generic `get<T>(key) / set<T>(key, value) / remove(key)` service.

**Why generic over named methods?**
- Named methods (`getTheme()`, `setTheme()`) require adding a method per storage key — doesn't scale.
- Generic typed API provides the same type safety with a single implementation.
- Key constants (`STORAGE_KEY`, `PAGE_SIZE_KEY`, `FILTER_KEY`) are co-located in their consumers, making changes localised.

---

## HTTP Error Handling: Interceptor + LoggerService

**Decision**: `errorInterceptor` (functional interceptor) catches all HTTP errors, normalises them to user-friendly messages, and logs via `LoggerService`. All callers receive a consistent `Error` object.

**Why a functional interceptor over class-based?**
- Angular 14+ recommends functional interceptors (`HttpInterceptorFn`) — less boilerplate, no `Injectable`.
- Wired via `withInterceptors([errorInterceptor])` — explicit and tree-shakeable.

---

## Server-Side Sorting

**Decision**: `MatSort.sortChange` events re-trigger `store.loadingPolicies()` with `_sort` / `_order` params sent to JSON Server, instead of using `MatTableDataSource.sort` (which sorts client-side).

**Why?**
- Requirements explicitly state "server-side sorting, not client-side".
- JSON Server v1 natively supports `_sort` and `_order` query parameters.
