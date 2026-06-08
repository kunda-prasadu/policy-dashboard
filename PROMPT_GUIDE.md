# Policy Hub — Complete AI Prompt Guide
## Step-by-step prompts to recreate the entire project from scratch

> **How to use:** Copy each prompt block into GitHub Copilot (or any AI assistant) in order.
> Each prompt is self-contained. Run them sequentially. Do not skip steps.

---

## Global Rules — Apply to Every Prompt

These three rules must be enforced in **every phase**. Include them at the top of every prompt you send, or paste this block before any individual prompt.

```
GLOBAL RULES — apply to all code you generate:

1. CODE COMMENTS
   - Every class, service, component, and store must have a JSDoc comment explaining its
     single responsibility (what it does, NOT how).
   - Every public method and function must have a JSDoc comment that explains:
       a) What it does
       b) Why it exists (what problem it solves)
       c) Any non-obvious side effects or state mutations
   - Every computed signal and effect must have an inline comment explaining what it
     derives and why that derivation lives here rather than elsewhere.
   - Every RxJS pipe operator chain must have a comment above it explaining the full
     data flow in plain English.

2. APPROACH EXPLANATION
   - Before writing any class, method, or block of logic, add a comment block:
       // WHY THIS APPROACH: ...
     Explain why you chose this pattern over the most obvious alternative.
     Example: if using a signal instead of a BehaviorSubject, say so and explain why.
     If using MatTableDataSource instead of a custom data array, explain the trade-off.

3. DECISION JUSTIFICATION
   - Whenever you make an architectural or API choice (e.g. standalone vs NgModule,
     server-side vs client-side filter, functional vs class-based interceptor),
     add a comment block:
       // DECISION: [choice made]
       // ALTERNATIVES CONSIDERED: [what else was possible]
       // REASON: [why this was preferred]
     Place this at the top of the file or immediately above the relevant code.
```

---

## ⚡ 4-Hour Fast Track

Eight prompts, one per major layer. Run them in order. Each builds on the last.

---

### 8 Big Prompts (~4 hours, recommended)

One prompt per major layer. Run them in order. Each builds on the last.

| Step | Time estimate |
|---|---|
| `ng new` + `npm install` | 20 min |
| 8 AI prompts × ~15 min each | 120 min |
| Debug + verify end-to-end | 60 min |
| **Total** | **~200 min** |

---

#### Fast Prompt 1 — Scaffold & Config

```
Create a new Angular 20 standalone app called policy-dashboard with:
- provideZonelessChangeDetection() + provideRouter + provideHttpClient(withFetch()) in app.config.ts
- angular.json styles array: add "node_modules/material-icons/iconfont/material-icons.css" BEFORE src/styles.scss
- environment.ts: { production: false, apiUrl: 'http://localhost:3000' }
- src/index.html: title "Policy Hub — Chubb APAC", Roboto preload (non-render-blocking), NO Material Icons CDN link (served locally)
- src/styles.scss: Material 3 CSS tokens (--mat-sys-primary, --mat-sys-surface, --mat-sys-on-surface, etc.),
  html.dark-theme class for dark mode, global reset, reduced-motion media query
- Install: npm install material-icons @angular/material json-server --legacy-peer-deps
- mock-api/generate-data.js: generate 250 policies with faker — fields: id(uuid), policyNumber(POL-XXXXXX),
  policyHolderName, lineOfBusiness(Property/Casualty/Marine/A&H), status(Active/Pending/Expired/Cancelled),
  region(Singapore/Hong Kong/Australia/Japan/Thailand/Indonesia/Malaysia/Philippines) — all 8 evenly distributed,
  premiumAmount(10000–2000000), currency(SGD/HKD/AUD/JPY/USD/THB),
  effectiveDate, expiryDate, underwriter, flaggedForReview(bool)
- mock-api/db.json: run the script to seed 250 records
- package.json: add "start:api": "json-server mock-api/db.json --port 3000"
```

#### Fast Prompt 2 — Models, Constants & Core Services

```
Create all models and core services:

MODELS (src/app/features/policy-dashboard/models/):
- policy.model.ts: Policy interface (id, policyNumber, policyHolderName,
  lineOfBusiness: 'Property'|'Casualty'|'Marine'|'A&H',
  status: 'Active'|'Pending'|'Expired'|'Cancelled',
  region: 'Singapore'|'Hong Kong'|'Australia'|'Japan'|'Thailand'|'Indonesia'|'Malaysia'|'Philippines',
  premiumAmount, currency: 'USD'|'SGD'|'HKD'|'AUD'|'JPY'|'THB', effectiveDate, expiryDate, underwriter, flaggedForReview)
- policy-filter.model.ts, pagination.model.ts, policy-summary.model.ts, policy-query-params.model.ts

CONSTANTS (src/app/features/policy-dashboard/constants/):
- policy.constants.ts: POLICY_STATUSES, REGIONS, LINES_OF_BUSINESS string arrays

CORE SERVICES (src/app/core/services/):
- storage.service.ts: root injectable, generic get<T>/set<T>/remove(key) — all try/catch guarded
- theme.service.ts: root injectable, isDark=signal(false), toggle(), applies 'dark-theme' class to
  document.documentElement, persists to localStorage key 'policy-hub-theme';
  resolveInitialTheme(): StorageService value → window.matchMedia('(prefers-color-scheme: dark)').matches → light default
- logger.service.ts: root injectable, debug/info/warn/error methods, suppressed in production via isDevMode()
- error.interceptor.ts: functional interceptor, catches HTTP errors, normalises to string message

All classes must have JSDoc comments.
```

#### Fast Prompt 3 — Signal Store & API Service

```
Create PolicyStore and PolicyApiService:

src/app/features/policy-dashboard/services/policy-api.service.ts:
- Root injectable, inject HttpClient and LoggerService
- getAll(filters?, sort?): Observable<Policy[]> — builds query params: status/region/lineOfBusiness/minPremium
  as server-side params, _sort/_order for sort, _limit=250
- patch(id, changes): Observable<Policy>
- flagPolicy(id): Observable<Policy> — PATCH {flaggedForReview:true};
  pipe catchError to log + rethrow a typed Error
- flagPolicies(ids: string[]): Observable<Policy[]> — forkJoin of individual flagPolicy calls;
  single subscription handles the entire batch

src/app/features/policy-dashboard/store/policy.store.ts — root injectable class (NOT @ngrx/signals):
- Inject PolicyApiService, LoggerService, DestroyRef
- Signals: policies, loading(bool), error(string|null), filters(PolicyFilter),
  sort({active,direction}), selectedPolicyIds(string[])
- Computed:
  - filteredPolicies: guard with policies() ?? [] before filtering
  - summary({active,pending,expired,cancelled,totalPremium,expiringWithin30Days,gwpByLob})
  - selectedCount, hasSelection, totalPolicies
- Methods: loadingPolicies(), updateFilters(), updateSort(), toggleSelection(id),
  selectAll(ids[]), clearSelection(), flagSelectedPolicies(), renewPolicy(id)
- loadingPolicies error handler: type err as HttpErrorResponse | Error; extract message safely
- flagSelectedPolicies: call policyApiService.flagPolicies(selectedIds) via single forkJoin
  subscription; pipe takeUntilDestroyed(destroyRef); rollback to snapshot on failure
- renewPolicy(id): PATCH {status:'Active'}
- All async methods log via LoggerService and write errors into error signal

// WHY CUSTOM STORE OVER NgRx: NgRx requires actions + reducers + effects + selectors — ~4x the boilerplate
// for a single-feature app. Angular signals give fine-grained reactivity with plain methods.
```

#### Fast Prompt 4 — PolicyTable Component

```
Create src/app/features/policy-dashboard/components/policy-table/ (.ts, .html, .scss):

TypeScript — Inject: PolicyStore, StorageService, LOCALE_ID
- output<Policy>() rowClick
- displayedColumns = ['select','policyNumber','policyHolderName','lineOfBusiness','status','region','premium','flagged','actions']
- dataSource = new MatTableDataSource<Policy>()
- _pageIndex = signal(0), _pageSize = signal(savedPageSize ?? 10)
- pageIds = computed(() => {
    const data = store.filteredPolicies();
    const start = _pageIndex() * _pageSize();
    return data.slice(start, start + _pageSize()).map(p => p.id);
  })
- isAllOnPageSelected = computed(() => pageIds().length > 0 && pageIds().every(id => store.selectedPolicyIds().includes(id)))
- isSomeOnPageSelected = computed(() => pageIds().some(id => store.selectedPolicyIds().includes(id)) && !isAllOnPageSelected())
- constructor effect: dataSource.data = store.filteredPolicies(); paginator()?.firstPage(); _pageIndex.set(0)
- ngAfterViewInit: inject DestroyRef; wire MatSort (server-side only — do NOT assign to dataSource.sort),
  pipe sort.sortChange through takeUntilDestroyed(destroyRef);
  wire MatPaginator (update _pageIndex/_pageSize on page event, persist pageSize to StorageService),
  pipe paginator.page through takeUntilDestroyed(destroyRef)
- Use ChangeDetectionStrategy.OnPush — signals trigger re-render precisely; no full tree traversal needed
- toggleSelectAll(): isAllOnPageSelected() ? clearSelection() : selectAll(pageIds())
- formatPremium(value, currencyCode): getCurrencySymbol + ≥1M→1.1M / ≥1K→123K / raw

// WHY _pageIndex/_pageSize SIGNALS: dataSource.filteredData is updated asynchronously by
// MatTableDataSource's RxJS pipeline. Reading it synchronously in an effect returns stale/empty data,
// making isAllOnPageSelected always false. Deriving pageIds from store.filteredPolicies() is synchronous.

HTML: mat-table, header checkbox [checked]="isAllOnPageSelected()" [indeterminate]="isSomeOnPageSelected()",
all 9 columns, actions column has manage_search mat-icon-button that emits rowClick,
mat-paginator [pageSizeOptions]="[10,25,50,100]" showFirstLastButtons
```

#### Fast Prompt 5 — Filter Components (PolicyFilter + FilterPanel)

```
1. src/app/features/policy-dashboard/components/policy-filter/ (.ts, .html, .scss):
- Inject: FormBuilder, Router, ActivatedRoute, MatBottomSheet, StorageService, PolicyStore
- FormGroup: { searchTerm, status, region, lineOfBusiness, startDate, endDate, minPremium:0 }
- activeFilterCount = computed: count non-empty/non-zero advanced filter values (exclude searchTerm)
- activeFilterChips = computed: Array<{key,label}> one entry per active filter (used for chip strip)
- Constructor seed priority: URL query params → localStorage → defaults
- formValueChanges (immediate): store.updateFilters()
- formValueChanges pipe(debounceTime(400)): StorageService.set + router.navigate(replaceUrl)
- openFilters(): open FilterPanel bottom sheet, afterDismissed patches form or calls store.loadingPolicies()
- removeFilter(key): patch control to default, call store.loadingPolicies() for server-side enum filters
- clearAllFilters(): reset all advanced fields, call store.loadingPolicies()
- HTML: search field + "All Filters" button (badge when activeFilterCount > 0) + chip strip:
    @if (activeFilterChips().length > 0) {
      @for (chip of activeFilterChips(); track chip.key) {
        <span class="active-filter-chip">{{ chip.label }} <button (click)="removeFilter(chip.key)">×</button></span>
      }
      <button (click)="clearAllFilters()">Clear all</button>
    }

2. src/app/features/policy-dashboard/components/filter-panel/ (.ts, .html, .scss):
- Bottom sheet component, inject MAT_BOTTOM_SHEET_DATA (current filter values)
- FormGroup seeded from injected data
- apply(): dismiss with form value; reset(): dismiss with 'reset'
```

#### Fast Prompt 6 — SummaryPanel, BulkActionBar, DrilldownDialog

```
1. src/app/features/policy-dashboard/components/summary-panel/ (.ts, .html, .scss):
- Inject PolicyStore, MatDialog
- 4 clickable status cards (Active/Pending/Expired/Cancelled) with counts from store.summary()
  — each click opens PolicyDrilldownDialog with { mode:'status', status }
- SVG arc widget: % of active policies expiring within 30 days (animated stroke-dashoffset)
- GWP animated progress bars per line of business
- formatPremium helper

2. src/app/features/policy-dashboard/components/bulk-action-bar/ (.ts, .html, .scss):
- Inject PolicyStore, MatSnackBar
- flagForReview(): capture count = store.selectedCount(), store.flagSelectedPolicies(),
  snackBar.open('N policies flagged for review', 'Dismiss', 4000ms, panelClass:'snack-flag-success')
- HTML: role="toolbar", selection count with aria-live="polite" aria-atomic="true", Clear + Flag buttons

3. src/app/features/policy-dashboard/components/policy-drilldown-dialog/ (.ts, .html, .scss):
- Inject MAT_DIALOG_DATA as DrilldownDialogData { mode:'status'|'expiring'|'detail', status?, policy? }
- renewingIds = signal<Set<string>>(new Set())
- detailPolicy = computed(() => store.policies().find(p => p.id === data.policy?.id) ?? data.policy) [detail mode]
- renew(id): add to renewingIds → store.renewPolicy(id) → setTimeout remove after 1500ms
- flagDetail(): store.selectAll([data.policy.id]) → store.flagSelectedPolicies()
- MatDialogRef used for close; Angular CDK FocusTrap is auto-applied by MatDialog — verify
  the close button gets initial focus (cdkFocusInitial) so keyboard users don't land on backdrop
- Dialog container must have aria-labelledby pointing to the dialog title element

HTML TWO branches:
@if (data.mode === 'detail') → single policy card:
  status-pill + flag-pill badges, 2-column detail-grid with 9 fields (policyNumber, policyHolderName,
  lineOfBusiness with lob-chip, region, premiumAmount, currency, effectiveDate, expiryDate + days-badge if ≤30d, underwriter),
  detail-actions: Renew button (Expired/Cancelled only) + Flag for Review button (if !flaggedForReview)
@if (data.mode !== 'detail') → mat-table:
  filtered list with urgency badges (≤7d=critical/≤15d=high/≤30d=low), row tinting, renew buttons per row
```

#### Fast Prompt 7 — Dashboard Page, App Shell & Shared Components

```
1. src/app/features/policy-dashboard/pages/policy-dashboard/ (.ts, .html, .scss):
- Inject PolicyStore, MatDialog
- ngOnInit: store.loadingPolicies()
- readonly hasResults = computed(() => store.filteredPolicies().length > 0)
- openPolicyDetail(policy: Policy): dialog.open(PolicyDrilldownDialog, { data:{mode:'detail',policy}, width:'600px', maxWidth:'96vw' })
- HTML:
  <main class="dashboard">
    <app-policy-filter />
    <app-summary-panel />
    @if (store.loading()) { <app-loading-skeleton /> }
    @else if (store.error()) { <app-error-state (retryClick)="retry()" /> }
    @else {
      @defer (on idle) {
        @if (store.hasSelection()) { <app-bulk-action-bar /> }
        @if (hasResults()) {
          <section class="dashboard-table">
            <app-policy-table (rowClick)="openPolicyDetail($event)" />
          </section>
        } @else {
          <app-empty-state
            title="No policies found"
            description="Try adjusting your filters" />
        }
      } @placeholder { <div aria-busy="true"></div> }
    }
  </main>

2. src/app/shared/loading-skeleton/ — shimmer placeholder with CSS animation
3. src/app/shared/error-state/ — error card with retryClick output()
4. src/app/shared/empty-state/ — zero-result card with search_off icon, title and description inputs;
   include a "Clear all filters" action button that calls store's clearAllFilters (pass as input or route through parent)
5. src/app/app.ts / app.html / app.scss — app shell:
   header: "Policy Hub" title + "APAC Insurance Platform" subtitle + dark/light theme toggle button
   ThemeService injection, toggle() on click, shows light_mode or dark_mode icon
   <router-outlet />
6. app.routes.ts: { path: '', component: PolicyDashboard }
```

#### Fast Prompt 8 — Unit Tests & CI

```
Write unit tests for the policy dashboard using Jasmine + Karma.

CRITICAL RULES for all spec files:
- Use real PolicyStore — never jasmine.createSpyObj for stores (signal graphs break with spies)
- Always add provideZonelessChangeDetection() to every TestBed
- Use provideHttpClientTesting() for HTTP-dependent services

Write these specs:
1. policy.store.spec.ts — 30 tests: loadingPolicies, updateFilters, summary counts, filteredPolicies,
   toggleSelection, selectAll, clearSelection, flagSelectedPolicies (PATCH + clears), renewPolicy
2. policy-api.service.spec.ts — 5 tests: GET no params, GET with status filter, PATCH flag, PATCH renew
3. storage.service.spec.ts — 4 tests: get returns null when empty, set+get round-trips, remove clears,
   swallows JSON parse errors gracefully
4. theme.service.spec.ts — 4 tests: defaults to system preference when no saved value,
   toggle flips isDark, persists to StorageService, applies dark-theme class to documentElement
5. error.interceptor.spec.ts — 3 tests: passes through successful responses, normalises HTTP errors,
   normalises network errors (status 0)
6. policy-table.spec.ts — 7 tests: creates, formatPremium (SGD/JPY/AUD), toggleSelectAll selects page ids,
   toggleSelectAll clears when all selected
7. policy-filter.spec.ts — 5 tests: creates, activeFilterCount is 0 with defaults,
   activeFilterCount increments per active filter, removeFilter clears one filter,
   clearAllFilters resets all advanced fields
8. policy-drilldown-dialog.spec.ts — 18 tests: detail mode shows policy fields, status mode shows table,
   daysLeft, urgencyClass, renew adds to renewingIds
9. summary-panel.spec.ts — 17 tests: expiringPct, arcOffset, barPct, formatPremium, openDrilldown
10. bulk-action-bar.spec.ts — 4 tests: creates, flagForReview calls store, snackbar singular/plural
11. filter-panel.spec.ts — 10 tests: creates, seeds form from data, apply emits values, reset emits 'reset'
12. empty-state.spec.ts — 2 tests: creates, displays title and description inputs

Create .github/workflows/ci.yml:
- Triggers: push and pull_request on main
- Steps: checkout, setup Node 20, npm ci --legacy-peer-deps, lint, test (ChromeHeadless --no-sandbox), build
```

---

## Prompt 9 — Documentation

```
Create the following documentation files:

README.md:
- Project overview (Chubb APAC Policy Hub, Angular 20 / Material 3 / Signal Store)
- Quick Start: npm install --legacy-peer-deps, npm run start:api, npm start
- Scripts table: start, start:api, build, test, lint, serve:ssr
- Project structure tree (core/, shared/, features/, environments/)
- Architecture section: Signal Store, hybrid server/client filtering, theming
- Mock API: JSON Server, 250 records, http://localhost:3000/policies
- StorageService keys: policy-hub-theme, policy-filters, policy-page-size
- Known limitations / trade-offs summary

ARCHITECTURE.md:
- ASCII component hierarchy (AppComponent → all leaf components)
- State flow: URL params → PolicyFilter → PolicyStore → filteredPolicies → components
- Layer responsibilities table (Core / Shared / Feature / Store / API / Pages)
- State categories table (Server / Client / Derived / URL / Persisted)

DESIGN_DECISIONS.md — one section each for:
1. Angular Signals vs NgRx
2. Angular Material 3
3. Hybrid server+client filtering (enum → server, search/dates → client, JSON Server limitation)
4. CSS class theming (dark-theme on <html>)
5. Generic StorageService
6. Functional HTTP interceptor
7. Server-side sorting via MatSort.sortChange

TRADE_OFFS.md:
- What Was Cut: E2E tests, MFE, virtual scrolling, i18n extraction, FX conversion, Storybook
- Technical Debt: client-side search/dates, N PATCH per flag, no i18n pipe usage
- Shortcuts: MatTableDataSource, JSON Server limitations

AI-JOURNAL.md — informal log of [ACCEPTED]/[CHALLENGED]/[OVERRODE] decisions covering:
architecture, each major feature, theming, testing, performance, accessibility, requirement gaps.
```

---

## Final Verification Checklist

```
1. npm test          → all tests pass (target: 95+ tests)
2. npm run build     → no errors
3. npm run lint      → no errors
4. npm run start:api → http://localhost:3000/policies returns 250 records
5. npm start         → http://localhost:4200 loads the dashboard

Manual checks:
✓ Dark/light theme toggle works and persists
✓ On first load (no saved preference), theme follows OS system preference (prefers-color-scheme)
✓ Filters update table + summary panel; active filter chips appear
✓ Individual × chip removes one filter; "Clear all" removes all
✓ Empty state shows "Clear all filters" action when no results match
✓ Header checkbox selects/deselects all rows on the current page only
✓ Multi-select → Flag for Review shows snackbar and clears checkboxes
✓ Sorting column header triggers fresh API fetch
✓ manage_search opens detail card (not list) with all 9 fields + action buttons
✓ Dialog close button receives focus on open; Tab cycles inside dialog (focus trap)
✓ All features operable keyboard-only (Tab, Enter, Space, Esc to close dialog)
✓ Renew works for Expired/Cancelled policies in the detail card
✓ Summary status cards open the status-list drilldown (not detail mode)
✓ Error state appears and Retry works (break the API URL to test)
✓ Loading skeleton appears on initial load
✓ Material icons render (no CDN link in index.html — served from npm package)
✓ No policies found → empty-state card shown (not blank table)
✓ Run axe DevTools in browser — zero accessibility violations on dashboard and dialog
```

---

## Summary — What This Builds

| Layer | Files |
|---|---|
| **Config** | app.config.ts, main.ts, angular.json, eslint.config.js, tsconfig.* |
| **Environments** | environment.ts, environment.prod.ts |
| **Core** | storage.service, logger.service, theme.service, error.interceptor |
| **Models** | policy, policy-filter, pagination, sort, policy-summary, policy-query-params |
| **Constants** | policy.constants |
| **Store** | policy.store, policy-dashboard.state |
| **API Service** | policy-api.service |
| **Shared Components** | loading-skeleton, error-state, empty-state |
| **Feature Components** | policy-table, summary-panel, filter-panel, policy-filter, bulk-action-bar, policy-drilldown-dialog |
| **Pages** | policy-dashboard (container) |
| **App Shell** | app.ts, app.html, app.scss, app.routes.ts |
| **Styles** | styles.scss (Material 3 light/dark theme, design tokens, reduced-motion) |
| **i18n** | assets/i18n/en.json (70+ translation keys) |
| **Mock API** | mock-api/db.json (250 records), generate-data.js |
| **Tests** | 12 spec files, 109 tests, 83%+ coverage |
| **CI** | .github/workflows/ci.yml |
| **Docs** | README, ARCHITECTURE, DESIGN_DECISIONS, TRADE_OFFS, AI-JOURNAL |

**Tech Stack:** Angular 20 · Angular Material 3 · Angular Signals · JSON Server · Karma/Jasmine · ESLint · GitHub Actions
