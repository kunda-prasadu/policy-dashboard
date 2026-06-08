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

## PHASE 1 — Project Scaffold

### Prompt 1.1 — Create Angular project

```
Create a new Angular 20 standalone application called "policy-dashboard" with:
- Zoneless change detection (provideZonelessChangeDetection)
- Angular Material 3
- Angular SSR (server-side rendering)
- Strict TypeScript
- SCSS as the style format
- Routing enabled

Run: ng new policy-dashboard --standalone --style=scss --ssr=true --routing=true
Then: ng add @angular/material --theme=azure-blue --typography=true --animations=enabled

In the generated README or a top-level comment block in app.config.ts, add:
// DECISION: Angular 20 standalone components
// ALTERNATIVES CONSIDERED: NgModule-based architecture
// REASON: Standalone components remove the indirection of declaring components in
// NgModules, reduce boilerplate, and align with Angular's long-term direction.
// They also make lazy loading simpler — each component is self-contained.

// DECISION: Zoneless change detection (provideZonelessChangeDetection)
// ALTERNATIVES CONSIDERED: Default zone.js-based CD
// REASON: Zoneless CD removes the zone.js monkey-patching overhead. Combined with
// signals, every re-render is precisely triggered by signal mutations — no
// unnecessary traversal of the component tree.
```

### Prompt 1.2 — Install additional dependencies

```
In the policy-dashboard project, install these additional packages:

dependencies:
  json-server@1.0.0-beta.15
  uuid@14
  rxjs (already included)

devDependencies:
  @faker-js/faker@10
  angular-eslint@22
  typescript-eslint@8
  karma-coverage@2.2

Run:
npm install json-server uuid
npm install --save-dev @faker-js/faker angular-eslint typescript-eslint karma-coverage --legacy-peer-deps
```

### Prompt 1.3 — Update package.json scripts

```
Update package.json scripts section to:
{
  "ng": "ng",
  "start": "ng serve",
  "start:api": "json-server --watch mock-api/db.json --port 3000",
  "build": "ng build",
  "watch": "ng build --watch --configuration development",
  "test": "ng test",
  "lint": "ng lint",
  "serve:ssr:policy-dashboard": "node dist/policy-dashboard/server/server.mjs"
}
```

---

## PHASE 2 — Mock API & Seed Data

### Prompt 2.1 — Create data generator script

```
Create mock-api/generate-data.js that generates 250 realistic insurance policy records using @faker-js/faker.

Each record must have these exact fields:
{
  id: UUID string,
  policyNumber: "POL-" + 6-digit number (e.g. POL-123456),
  policyHolderName: realistic APAC full name,
  lineOfBusiness: one of ['Property', 'Casualty', 'A&H', 'Marine'] — evenly distributed,
  status: one of ['Active', 'Expired', 'Pending', 'Cancelled'] — 40% Active, 25% Expired, 20% Pending, 15% Cancelled,
  premiumAmount: random decimal between 1000 and 5000000,
  currency: one of ['USD', 'SGD', 'HKD', 'AUD', 'JPY', 'THB'] — distributed by region,
  effectiveDate: ISO date string YYYY-MM-DD (within last 3 years),
  expiryDate: ISO date string YYYY-MM-DD (effectiveDate + 1 year),
  region: one of ['Singapore', 'Hong Kong', 'Australia', 'Japan', 'Thailand', 'Indonesia', 'Malaysia', 'Philippines'] — evenly distributed,
  underwriter: realistic underwriter team name,
  flaggedForReview: boolean, default false, ~5% true
}

Export as JSON and write to mock-api/db.json wrapped in { "policies": [...] }.
Also add an npm script: "generate-data": "node mock-api/generate-data.js"
```

### Prompt 2.2 — Run data generator

```
Run the data generator to create the seed data:
node mock-api/generate-data.js

Verify mock-api/db.json has exactly 250 policy records with all 12 fields present.
```

---

## PHASE 3 — TypeScript Models

### Prompt 3.1 — Create domain models

```
Create the following TypeScript model files in src/app/features/policy-dashboard/models/:

1. policy.model.ts
   - Export type PolicyStatus = 'Active' | 'Expired' | 'Pending' | 'Cancelled'
   - Export type LineOfBusiness = 'Property' | 'Casualty' | 'A&H' | 'Marine'
   - Export type Region = 'Singapore' | 'Hong Kong' | 'Australia' | 'Japan' | 'Thailand' | 'Indonesia' | 'Malaysia' | 'Philippines'
   - Export type Currency = 'USD' | 'SGD' | 'HKD' | 'AUD' | 'JPY' | 'THB'
   - Export interface Policy with all 12 fields matching the db.json schema exactly
     (id, policyNumber, policyHolderName, lineOfBusiness, status, premiumAmount, currency,
      effectiveDate, expiryDate, region, underwriter, flaggedForReview)

2. policy-filter.model.ts
   - Export interface PolicyFilter:
     searchTerm?: string
     status?: PolicyStatus | ''
     region?: Region | ''
     lineOfBusiness?: LineOfBusiness | ''
     startDate?: Date
     endDate?: Date
     minPremium?: number

3. pagination.model.ts
   - Export interface Pagination: { pageIndex: number, pageSize: number, totalRecords: number }

4. sort.model.ts
   - Export interface SortState: { active: string, direction: 'asc' | 'desc' | '' }

5. policy-summary.model.ts
   - Export interface PolicySummary with: activeCount, expiredCount, pendingCount, cancelledCount,
     propertyPremium, casualtyPremium, ahPremium, marinePremium, totalGwp, expiringWithin30Days

6. policy-query-params.model.ts
   - Export interface PolicyQueryParams (URL query param shape — all string or null)
```

### Prompt 3.2 — Create constants

```
Create src/app/features/policy-dashboard/constants/policy.constants.ts with:
- POLICY_STATUSES: PolicyStatus[] array
- REGIONS: Region[] array  
- LINES_OF_BUSINESS: LineOfBusiness[] array
- CURRENCIES: Currency[] array
Import types from policy.model.ts
```

---

## PHASE 4 — Environment Files

### Prompt 4.1 — Create environment configuration

```
Create two environment files in src/app/environments/:

1. environment.ts (development):
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000'
};

2. environment.prod.ts (production):
export const environment = {
  production: true,
  apiUrl: 'https://api.policy-hub.example.com'
};

Then in angular.json, under architect.build.configurations.production, add fileReplacements:
[{
  "replace": "src/app/environments/environment.ts",
  "with": "src/app/environments/environment.prod.ts"
}]
```

---

## PHASE 5 — Core Services

### Prompt 5.1 — StorageService

```
Create src/app/core/services/storage.service.ts:

@Injectable({ providedIn: 'root' })
export class StorageService {
  - get<T>(key: string): T | null — parse JSON from localStorage, return null on error
  - set<T>(key: string, value: T): void — JSON.stringify to localStorage, swallow quota errors
  - remove(key: string): void — localStorage.removeItem, swallow errors
  - clearAll(): void — localStorage.clear(), swallow errors
}

All methods must have try/catch — never throw, never use 'any' type.

Add JSDoc comments for every method in this format:
/**
 * Retrieves and deserialises a value from localStorage.
 *
 * WHY: A single typed wrapper prevents scattered JSON.parse calls
 * throughout the codebase and centralises error handling for
 * malformed stored data.
 *
 * @param key The storage key to read.
 * @returns The parsed value, or null if absent or unparseable.
 */

At the top of the file add:
// DECISION: Generic get<T> / set<T> over named methods (e.g. getTheme / setTheme)
// ALTERNATIVES CONSIDERED: Dedicated typed methods per concern
// REASON: A generic API keeps the service open for extension without
// modification. Callers own the key names, preventing tight coupling.
// Try/catch in every method ensures the app never crashes due to
// localStorage being unavailable (e.g. private browsing, quota exceeded).
```

### Prompt 5.2 — LoggerService

```
Create src/app/core/services/logger.service.ts:

@Injectable({ providedIn: 'root' })
export class LoggerService {
  - Uses isDevMode() to suppress debug() in production
  - All methods prefix output with '[PolicyHub]'
  - debug(message: string, ...args: unknown[]): void
  - info(message: string, ...args: unknown[]): void
  - warn(message: string, ...args: unknown[]): void
  - error(message: string, ...args: unknown[]): void
  - Only debug() is suppressed in production; info/warn/error always log
}

At the top of the file add:
// DECISION: Custom LoggerService wrapping console
// ALTERNATIVES CONSIDERED: Direct console.log calls throughout the codebase
// REASON: Wrapping console in a service lets us gate debug output by environment,
// add a consistent prefix for filtering in DevTools, and makes the
// logging seam mockable in unit tests without polluting test output.

JSDoc for each method must state which environments the call produces output in.
```

### Prompt 5.3 — ThemeService

```
Create src/app/core/services/theme.service.ts:

@Injectable({ providedIn: 'root' })
export class ThemeService {
  - Inject StorageService
  - Private signal _theme: 'light' | 'dark'
  - readonly isDark = () => this._theme() === 'dark'
  - STORAGE_KEY = 'policy-hub-theme'
  - Constructor: call resolveInitialTheme(), apply theme to document
  - resolveInitialTheme(): read from StorageService first, fall back to
    window.matchMedia('(prefers-color-scheme: dark)').matches
  - toggle(): flip between light and dark, persist to StorageService
  - applyTheme(theme): toggle 'dark-theme' class on document.documentElement,
    set StorageService value
  
No direct localStorage calls — all storage via StorageService.

At the top of the file add:
// DECISION: CSS class toggle ('dark-theme') on document.documentElement
// ALTERNATIVES CONSIDERED: Angular CDK OverlayContainer, separate stylesheet load
// REASON: Toggling a class on <html> allows Material 3 design tokens to be
// overridden in a single .dark-theme {} block in styles.scss. It is
// synchronous, avoids flash of unstyled content, and does not require
// loading additional stylesheets at runtime.

// WHY THIS APPROACH (resolveInitialTheme):
// Priority order — stored preference > system preference > light default —
// ensures returning users get their last chosen theme while new users
// get a theme matching their OS setting automatically.

JSDoc for every method explaining the side effects on DOM and storage.
```

### Prompt 5.4 — HTTP Error Interceptor

```
Create src/app/core/interceptors/error.interceptor.ts as a functional interceptor:

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  - Inject LoggerService
  - pipe(catchError((error: HttpErrorResponse) => {
      if status === 0: message = 'Network error — please check your connection.'
      else: message = 'Server error (HTTP ${status}): ${statusText}'
      logger.error('[HTTP] ${method} ${url}', message)
      return throwError(() => new Error(message))
    }))
}

Wire it in app.config.ts via withInterceptors([errorInterceptor])

At the top of the file add:
// DECISION: Functional interceptor (HttpInterceptorFn) over class-based interceptor
// ALTERNATIVES CONSIDERED: Class implementing HttpInterceptor with useClass
// REASON: Functional interceptors are the Angular 15+ idiomatic pattern.
// They are tree-shakeable, do not require a class instantiation, and
// work directly with inject() — aligning with the signals/functional
// direction of the framework.

// WHY THIS APPROACH (error normalisation):
// status === 0 means the request never reached the server (network
// failure, CORS, offline). Separating this from HTTP status errors
// gives users a more actionable message instead of a raw 0 status code.

The interceptor function itself must have a JSDoc comment explaining
what it intercepts, what it does on error, and what it passes through.
```

---

## PHASE 6 — API Service

### Prompt 6.1 — PolicyApiService

```
Create src/app/features/policy-dashboard/services/policy-api.service.ts:

@Injectable({ providedIn: 'root' })
export class PolicyApiService {
  - Inject HttpClient
  - baseUrl = environment.apiUrl + '/policies'

  getPolicies(filters?: Partial<PolicyFilter>, sort?: SortState): Observable<Policy[]>
    - Build HttpParams:
      if filters.status → params.set('status', value)
      if filters.region → params.set('region', value)
      if filters.lineOfBusiness → params.set('lineOfBusiness', value)
      if filters.minPremium > 0 → params.set('premiumAmount_gte', String(value))
      if sort.active && sort.direction → params.set('_sort', active), params.set('_order', direction)
    - GET this.baseUrl with params

  flagPolicy(id: string): Observable<Policy>
    - PATCH this.baseUrl/:id with body { flaggedForReview: true }

  renewPolicy(id: string): Observable<Policy>
    - PATCH this.baseUrl/:id with body { status: 'Active' }
}

At the top of the file add:
// DECISION: Hybrid server + client filtering
// ALTERNATIVES CONSIDERED: All filtering on server / all filtering on client
// REASON: Enum filters (status, region, lineOfBusiness) are sent to the server
// because JSON Server supports exact-match query params natively — this keeps
// the response payload small. Free-text search (searchTerm) and date range
// filters are handled client-side because JSON Server v1 beta does not support
// cross-field OR queries or reliable ISO date range comparison.

// DECISION: PATCH (not PUT) for flag and renew operations
// ALTERNATIVES CONSIDERED: PUT with full policy body
// REASON: PATCH expresses intent — only the changed field is sent.
// PUT would require sending the entire policy object, creating a
// race condition risk if another field changed concurrently.

JSDoc for every public method must include:
- What HTTP verb and URL it calls
- Which params are sent to the server vs handled elsewhere
- The return type and what the observable emits
```

---

## PHASE 7 — Signal Store

### Prompt 7.1 — Store state defaults

```
Create src/app/features/policy-dashboard/store/policy-dashboard.state.ts:

Export DEFAULT_FILTERS: PolicyFilter = {
  searchTerm: '',
  status: '',
  region: '',
  lineOfBusiness: '',
  startDate: undefined,
  endDate: undefined,
  minPremium: 0
}
```

### Prompt 7.2 — PolicyStore

```
Create src/app/features/policy-dashboard/store/policy.store.ts using Angular signals (NO NgRx):

At the top of the file, before the class, add:
// DECISION: Custom Signal Store over NgRx
// ALTERNATIVES CONSIDERED: NgRx Store + Effects, NgRx Signal Store, NGXS, Akita
// REASON: NgRx adds ~15KB, boilerplate actions/reducers/effects, and a
// steeper learning curve for a single-feature dashboard. Angular's built-in
// signals (signal, computed, effect) cover all required reactivity with zero
// extra dependencies and direct TypeScript type safety.

// DECISION: @Injectable({ providedIn: 'root' }) singleton store
// ALTERNATIVES CONSIDERED: Component-level store, feature-level providers
// REASON: All dashboard components read from the same policy list. A singleton
// ensures the filter state, selection state, and loaded data are shared
// without prop drilling or additional DI configuration.


@Injectable({ providedIn: 'root' })
export class PolicyStore {
  Inject: PolicyApiService, LoggerService

  SIGNALS (writable):
  - policies = signal<Policy[]>([])
  - loading = signal<boolean>(false)
  - error = signal<string | null>(null)
  - filters = signal<PolicyFilter>(DEFAULT_FILTERS)
  - pagination = signal<Pagination>({ pageIndex:0, pageSize:10, totalRecords:0 })
  - sort = signal<SortState>({ active:'', direction:'' })
  - selectedPolicyIds = signal<string[]>([])

  COMPUTED SIGNALS (add a comment above each explaining what it derives and why it's computed here):
  // WHY COMPUTED: selectedCount avoids scanning the array in multiple places.
  // Recomputes only when selectedPolicyIds signal changes.
  - selectedCount = computed(() => selectedPolicyIds().length)
  // WHY COMPUTED: hasSelection is a boolean gate used in templates and methods.
  // Derived from selectedCount so it shares the same memo.
  - hasSelection = computed(() => selectedCount() > 0)
  - totalPolicies = computed(() => policies().length)
  // WHY COMPUTED: filteredPolicies is the single source of truth for the
  // table and summary panel. Client-side filters are applied here because
  // JSON Server cannot do cross-field OR search or reliable date range queries.
  - filteredPolicies = computed(() => {
      Apply client-side filters to policies():
      - searchTerm: case-insensitive match against policyNumber, policyHolderName, underwriter
      - status: exact match (skip if empty)
      - region: exact match (skip if empty)
      - lineOfBusiness: exact match (skip if empty)
      - startDate: expiryDate >= startDate
      - endDate: expiryDate <= endDate (end of day)
      - minPremium: premiumAmount >= minPremium
    })
  - summary = computed(() => {
      From filteredPolicies():
      - activeCount, expiredCount, pendingCount, cancelledCount (filter by status)
      - propertyPremium, casualtyPremium, ahPremium, marinePremium (sum premiumAmount by lob)
      - totalGwp getter (sum of all 4 premiums)
      - expiringWithin30Days: expiryDate between today and today+30 days
    })

  METHODS (add JSDoc to every method in this exact format):
  /**
   * <What it does in one sentence>
   *
   * WHY THIS APPROACH: <why this pattern was chosen, e.g. why optimistic update>
   * SIDE EFFECTS: <any signals mutated, any observable subscriptions started>
   */

  - loadingPolicies(): void
      // WHY: Triggers a fresh API fetch using the current filter + sort state.
      // This is always called after filter/sort changes rather than auto-subscribing
      // inside the computed because it needs to be explicitly triggered
      // (filter changes should not fire API calls on every keystroke — that is
      // debounced in the PolicyFilter component).
      loading.set(true)
      policyApiService.getPolicies(filters(), sort()).subscribe({
        next: policies => { this.policies.set(policies); loading.set(false); logger.info(...) }
        error: err => { error.set(err.message); loading.set(false); logger.error(...) }
      })

  - updateFilters(filters: Partial<PolicyFilter>): void
      // WHY: Partial update avoids callers having to spread existing state.
      // Uses update() not set() to safely merge rather than replace.
      filters.update(current => ({ ...current, ...filters }))

  - updatePagination(pageIndex, pageSize?): void

  - updateSort(active, direction): void
      // WHY: Sort state is stored in the signal store (not in MatSort)
      // so that sort is part of the serialisable app state and can be
      // passed to the API on every loadingPolicies() call.
      sort.set({ active, direction })

  - toggleSelection(policyId: string): void
      toggle id in selectedPolicyIds array

  - clearSelection(): void

  - selectAll(policyIds: string[]): void

  - flagSelectedPolicies(): void
      // WHY OPTIMISTIC UPDATE:
      // Updating the UI before the API responds makes the interaction feel
      // instant. The snapshot/rollback pattern ensures data integrity:
      // if any PATCH fails, the entire policies signal is restored to its
      // pre-action state and an error message is shown.
      1. Save snapshot = policies()
      2. Optimistic update: set flaggedForReview=true for all selectedIds
      3. clearSelection()
      4. For each id: policyApiService.flagPolicy(id).subscribe({
           error: () => { policies.set(snapshot); error.set('Failed to flag. Changes reverted.') }
         })

  - renewPolicy(id: string): void
      // WHY OPTIMISTIC UPDATE: Same snapshot/rollback pattern as flagSelectedPolicies.
      // The policy's status is set to 'Active' immediately in the UI.
      // If the API call fails, the snapshot is restored.
      1. Save snapshot = policies()
      2. Optimistic update: set status='Active' for matching id
      3. policyApiService.renewPolicy(id).subscribe({
           error: () => { policies.set(snapshot); error.set('Failed to renew. Changes reverted.') }
         })
}
```

---

## PHASE 8 — Shared Components

### Prompt 8.1 — LoadingSkeleton

```
Create src/app/shared/loading-skeleton/ (loading-skeleton.ts, .html, .scss, .spec.ts):

Standalone component, selector: app-loading-skeleton

HTML: 5 shimmer row placeholders using div.skeleton-row with CSS animation.
Each row has varying widths (100%, 85%, 92%, 78%, 88%).

SCSS:
- .skeleton-row: height 16px, border-radius 4px, background gradient
- Shimmer animation: @keyframes shimmer using background-position transition
  from -200% to 200% over 1.4s infinite
- Respect prefers-reduced-motion: disable animation

Spec: 1 test — component creates successfully.
```

### Prompt 8.2 — ErrorState

```
Create src/app/shared/error-state/ (error-state.ts, .html, .scss, .spec.ts):

Standalone component, selector: app-error-state

Inputs:
- title: string = 'Something went wrong'
- message: string = 'We couldn\'t load your policies. Please try again.'

Outputs:
- retryClick = new EventEmitter<void>()

HTML:
- mat-icon (error icon)
- h2 for title
- p for message
- "Try Again" button that emits retryClick
- role="alert" on the container

Spec: 1 test — component creates, retryClick emits on button click.
```

---

## PHASE 9 — Feature Components

### Prompt 9.1 — PolicyTable component

```
Create src/app/features/policy-dashboard/components/policy-table/ (.ts, .html, .scss, .spec.ts):

Standalone, selector: app-policy-table
Imports: MatTableModule, MatSortModule, MatPaginatorModule, MatCheckboxModule, MatIconModule, MatTooltipModule

At the top of the .ts file add:
// DECISION: MatTableDataSource<Policy> over a plain Policy[] array bound to mat-table
// ALTERNATIVES CONSIDERED: Plain array with manual pagination slice
// REASON: MatTableDataSource handles paginator and filter plumbing automatically.
// However, we do NOT assign MatSort to dataSource.sort because sorting is
// server-side — assigning it would cause MatTable to re-sort the current page
// data in the browser instead of fetching a fresh sorted result from the API.

// DECISION: effect() to sync store.filteredPolicies() → dataSource.data
// ALTERNATIVES CONSIDERED: async pipe in template, manual subscribe
// REASON: effect() runs outside the template, so it works even if the table
// is not yet rendered. It also calls paginator()?.firstPage() to reset
// pagination whenever the data changes — without this the user could be
// on page 3 after applying a filter that has fewer results.

TypeScript:
- Inject: PolicyStore, StorageService, LOCALE_ID
- PAGE_SIZE_KEY = 'policy-page-size', DEFAULT_PAGE_SIZE = 10
- displayedColumns = ['select', 'policyNumber', 'policyHolderName', 'lineOfBusiness', 'status', 'region', 'premium', 'flagged']
- dataSource = new MatTableDataSource<Policy>()
- initialPageSize from StorageService ?? 10
- sort = viewChild(MatSort), paginator = viewChild(MatPaginator)
- constructor: effect(() => { dataSource.data = store.filteredPolicies(); paginator()?.firstPage(); })
- ngAfterViewInit:
    - sort: subscribe to sortChange → store.updateSort() → store.loadingPolicies()
      (do NOT assign sort to dataSource — server-side sort)
    - paginator: assign to dataSource, subscribe page → save pageSize to StorageService
- toggleSelectAll(): get current page ids, if all selected → clearSelection, else selectAll
- formatPremium(value, currencyCode): use getCurrencySymbol(currencyCode, 'narrow', locale)
    format: ≥1M → 1.1M, ≥1K → 123K, else raw

All methods and the constructor effect must have JSDoc comments.

HTML table with mat-table:
- All th elements must have scope="col"
- aria-label="Policy data table" on table
- Columns: select (mat-checkbox), policyNumber, policyHolderName, lineOfBusiness,
  status (status-badge with dot), region, premium, flagged (mat-icon flag)
- mat-paginator with [pageSizeOptions]="[10, 25, 50, 100]" showFirstLastButtons
- Wrap table in <div class="table-responsive-wrapper"> for horizontal scroll on mobile
- Empty state when filteredPolicies().length === 0:
    <div role="status" aria-live="polite"> with search_off icon and message

SCSS:
- .table-responsive-wrapper: width 100%, overflow-x: auto, min-width: 700px on table
- Status badge: color-coded pills for Active(green), Pending(amber), Expired(red), Cancelled(grey)
- Dark theme badge overrides
- Compact row heights (36px rows, 32px header)
- Policy number in monospace font with primary color
```

### Prompt 9.2 — SummaryPanel component

```
Create src/app/features/policy-dashboard/components/summary-panel/ (.ts, .html, .scss, .spec.ts):

Standalone, selector: app-summary-panel
Inject: PolicyStore, LOCALE_ID

Methods:
- formatPremium(value, currencyCode='USD'): use getCurrencySymbol for currency symbol
  format: ≥1B → 1.1B, ≥1M → 1.1M, ≥1K → 123K

HTML layout:
1. Status cards row: 4 cards for Active, Expired, Pending, Cancelled
   Each shows count from store.summary() with color-coded icon
   
2. Expiring alert: card showing expiringWithin30Days count with warning icon

3. GWP section: 4 LoB rows (Property, Casualty, A&H, Marine) showing formatted premium totals
   + Total GWP row
   + SVG arc widget (donut-style) showing what % of total GWP is Property premium:
     <svg width="52" height="52"> with two circles — track and fill using stroke-dasharray
     [attr.stroke-dashoffset] bound to computed arc percentage

All computed from store.summary() — updates automatically when filters change.
```

### Prompt 9.3 — FilterPanel (bottom sheet)

```
Create src/app/features/policy-dashboard/components/filter-panel/ (.ts, .html, .scss, .spec.ts):

At the top of the .ts file add:
// DECISION: MatBottomSheet over MatDialog for the advanced filters panel
// ALTERNATIVES CONSIDERED: MatDialog, inline collapsible panel, sidebar
// REASON: Bottom sheet is the Material 3 pattern for contextual actions on
// mobile — it slides up from the bottom and does not obscure the full
// screen on small viewports. On desktop it still presents as a modal
// panel but with a natural dismiss gesture (swipe or backdrop click).

Standalone, selector: app-filter-panel
Inject: MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef, LOCALE_ID
Imports: ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatSelectModule,
         MatDatepickerModule, MatNativeDateModule, MatSliderModule, MatButtonModule, MatIconModule

FormGroup fields:
- status: '' (PolicyStatus | '')
- region: '' (Region | '')
- lineOfBusiness: '' (LineOfBusiness | '')
- startDate: null (Date | null)
- endDate: null (Date | null)
- minPremium: 0 (number)

Constructor: seed form from MAT_BOTTOM_SHEET_DATA (pre-filled with current filter values)

computed premiumLabel: getCurrencySymbol('USD', 'narrow', locale) + formatted value or 'Any'

Methods:
- apply(): close sheet with form values
- reset(): close sheet with string 'reset'
- close(): close sheet with null

HTML:
- Header with title "Advanced Filters" and close X button (aria-label="Close filters")
- Status mat-select with All Statuses option + 4 status options
- Region mat-select with All Regions + 8 region options
- Line of Business mat-select with All Lines + 4 LOB options
- Start Date / End Date mat-datepicker fields
- Min Premium mat-slider (min=0, max=1000000, step=10000)
  with aria-label and current value display showing premiumLabel
- Footer: Reset button + Apply Filters primary button
```

### Prompt 9.4 — PolicyFilter (search bar + filter trigger)

```
Create src/app/features/policy-dashboard/components/policy-filter/ (.ts, .html, .scss, .spec.ts):

At the top of the .ts file add:
// DECISION: URL query params + localStorage for filter persistence
// ALTERNATIVES CONSIDERED: Store-only state (lost on refresh), cookie storage
// REASON: URL query params allow filters to be bookmarked and shared — a link
// sent to a colleague opens the same filtered view. localStorage is the
// fallback so direct navigation (no query params) still restores the last
// session's filters. The priority order is: URL params > localStorage > defaults.

// DECISION: debounceTime(400) on the search-term RxJS pipe
// ALTERNATIVES CONSIDERED: Immediate store update on every keystroke
// REASON: Without debounce, every character typed triggers a URL update and
// a localStorage write. debounceTime(400) batches rapid typing into a
// single update, reducing unnecessary re-renders and history entries.
// The store.updateFilters() subscription is NOT debounced — the in-memory
// computed signal filters instantly for a responsive feel.

Standalone, selector: app-policy-filter
Inject: FormBuilder, Router, ActivatedRoute, MatBottomSheet, StorageService, PolicyStore

Static STORAGE_KEY = 'policy-filters'

Signal: isFilterSheetOpen = signal(false) — for aria-expanded on the filter button

FormGroup: { searchTerm: '', status: '', region: '', lineOfBusiness: '',
             startDate: null, endDate: null, minPremium: 0 }

computed activeFilterCount: count non-empty/non-zero advanced filter values (exclude searchTerm)

Constructor initialization priority:
1. If URL query params exist (search/status/region/lob/from/to) → seed form from URL
2. Else if localStorage has saved filters → seed from StorageService
3. Else → defaults

formValueChanges subscribe (immediate): → store.updateFilters(...)

formValueChanges pipe(debounceTime(400)) subscribe:
  → StorageService.set(STORAGE_KEY, values)
  → router.navigate([], { queryParams: {search,status,region,lob,from,to}, replaceUrl: true })

openFilters():
  isFilterSheetOpen.set(true)
  open FilterPanel bottom sheet with panelClass='filter-bottom-sheet' and current form data
  afterDismissed().subscribe(result => {
    isFilterSheetOpen.set(false)
    if result === 'reset' → form.reset (preserve searchTerm) → store.loadingPolicies()
    if result is filter object → form.patchValue(result) → store.loadingPolicies()
  })

HTML:
- form.filter-bar with search mat-form-field
- "All Filters" mat-stroked-button:
    [attr.aria-expanded]="isFilterSheetOpen()"
    aria-haspopup="dialog"
    [attr.aria-label]="activeFilterCount() > 0 ? 'All Filters, N active' : 'All Filters'"
    show badge count when activeFilterCount() > 0
```

### Prompt 9.5 — BulkActionBar component

```
Create src/app/features/policy-dashboard/components/bulk-action-bar/ (.ts, .html, .scss, .spec.ts):

At the top of the .ts file add:
// DECISION: aria-live="polite" + aria-atomic="true" on the selection count
// ALTERNATIVES CONSIDERED: No live region (sighted-only feedback)
// REASON: Screen readers do not automatically announce dynamic DOM changes.
// aria-live="polite" queues an announcement after the current speech finishes.
// aria-atomic="true" ensures the entire count string is read as one unit
// (e.g. "3 policies selected") rather than just the changed number.

Standalone, selector: app-bulk-action-bar
Inject: PolicyStore, MatSnackBar

flagForReview():
  - count = store.selectedCount()
  - store.flagSelectedPolicies()
  - snackBar.open('N policies flagged for review', 'Dismiss', {
      duration: 4000, horizontalPosition: 'end', verticalPosition: 'bottom',
      panelClass: 'snack-flag-success'
    })

HTML (only shown when store.hasSelection()):
- role="toolbar" aria-label="Bulk actions"
- Selection count display:
    <div aria-live="polite" aria-atomic="true">
      {{ store.selectedCount() }} {{ singular/plural }} selected
    </div>
- "Clear Selection" mat-stroked-button → store.clearSelection()
- "Flag for Review" mat-raised-button color="warn" → flagForReview()
  with mat-icon flag
```

### Prompt 9.6 — PolicyDrilldownDialog component

```
Create src/app/features/policy-dashboard/components/policy-drilldown-dialog/ (.ts, .html, .scss, .spec.ts):

At the top of the .ts file add:
// DECISION: signal<Set<string>>(renewingIds) for per-row renew loading state
// ALTERNATIVES CONSIDERED: Single boolean isRenewing, index-based array
// REASON: The expiring-policies table can show multiple rows. A Set keyed
// by policy id allows each row's renew button to show its own spinner
// independently. Using a signal ensures the template reacts automatically
// when any id is added or removed.

Standalone, selector: app-policy-drilldown-dialog
Inject: MAT_DIALOG_DATA (Policy), MatDialogRef, PolicyStore, LOCALE_ID

renewingIds = signal<Set<string>>(new Set())

formatPremium(value, currencyCode): getCurrencySymbol + M/K/raw formatting
formatDate(dateStr): new Date(dateStr).toLocaleDateString(locale, {day:'2-digit',month:'short',year:'numeric'})

renew(id):
  renewingIds.update(set => new Set([...set, id]))
  store.renewPolicy(id)
  setTimeout(() => renewingIds.update(set => { set.delete(id); return new Set(set) }), 1500)

HTML:
- Dialog header with policy number + close button (aria-label="Close policy details")
- 2-column grid showing all 12 policy fields as label/value pairs
- Expiring Policies section: mat-table showing policies expiring within 30 days
  with columns: policyNumber, policyHolderName, expiryDate, premium, renew
  - Renew button: [disabled]="renewingIds().has(p.id)"
    Shows mat-progress-spinner when renewing, otherwise autorenew icon
    aria-label="Renew policy {{p.policyNumber}}"
```

---

## PHASE 10 — Dashboard Page

### Prompt 10.1 — PolicyDashboard page (container/smart component)

```
Create src/app/features/policy-dashboard/pages/policy-dashboard/ (.ts, .html, .scss, .spec.ts):

At the top of the .ts file add:
// DECISION: @defer (on idle) wrapping BulkActionBar + PolicyTable
// ALTERNATIVES CONSIDERED: Eager loading all components, @defer (on viewport)
// REASON: 'on idle' defers rendering until the browser's requestIdleCallback
// fires — the page shell (header, filter bar, summary panel) renders first
// and is immediately interactive. The heavier table component loads during
// idle time, improving Largest Contentful Paint. A @placeholder block shows
// LoadingSkeleton so the layout does not shift.

Standalone container component, selector: app-policy-dashboard
Inject: PolicyStore, MatDialog

Imports: PolicyFilter, SummaryPanel, BulkActionBar, PolicyTable,
         LoadingSkeleton (from shared), ErrorState (from shared),
         MatProgressSpinnerModule

ngOnInit: store.loadingPolicies()

openDrilldown(policy: Policy):
  dialog.open(PolicyDrilldownDialog, {
    data: policy,
    width: '900px', maxWidth: '96vw',
    panelClass: 'drilldown-dialog-panel'
  })

HTML structure:
<main class="dashboard" aria-label="Policy Dashboard">
  <app-policy-filter />
  <app-summary-panel />

  @defer (on idle) {
    @if (store.hasSelection()) {
      <app-bulk-action-bar />
    }
    <section class="table-section" aria-label="Policy list">
      @if (store.loading()) {
        <app-loading-skeleton />
      } @else if (store.error()) {
        <app-error-state
          [message]="store.error()!"
          (retryClick)="store.loadingPolicies()" />
      } @else {
        <app-policy-table (rowClick)="openDrilldown($event)" />
      }
    </section>
  } @placeholder {
    <app-loading-skeleton />
  }
</main>
```

---

## PHASE 11 — App Shell & Layout

### Prompt 11.1 — App root and layout

```
Update src/app/app.ts (root component), src/app/app.html, src/app/app.scss:

app.html should render the app shell:
- <header> with:
    - App title "Policy Hub" with Chubb branding
    - Subtitle "APAC Insurance Platform"
    - Theme toggle button (mat-icon-button):
        [attr.aria-label]="themeService.isDark() ? 'Switch to light theme' : 'Switch to dark theme'"
        (click)="themeService.toggle()"
        Shows light_mode or dark_mode mat-icon based on current theme
- <main> or router outlet

Inject ThemeService in AppComponent.

src/app/app.routes.ts:
- Lazy-load the policy-dashboard feature:
  { path: '', loadComponent: () => import('./features/policy-dashboard/pages/policy-dashboard/policy-dashboard').then(m => m.PolicyDashboard) }
  { path: '**', redirectTo: '' }
```

---

## PHASE 12 — App Configuration

### Prompt 12.1 — app.config.ts

```
Update src/app/app.config.ts with all providers:

import { ApplicationConfig, LOCALE_ID, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core'
import { provideRouter, withPreloading, PreloadAllModules } from '@angular/router'
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http'
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async'
import { errorInterceptor } from './core/interceptors/error.interceptor'

providers: [
  provideBrowserGlobalErrorListeners(),
  provideZonelessChangeDetection(),
  provideAnimationsAsync(),
  { provide: LOCALE_ID, useValue: 'en-GB' },
  provideHttpClient(withFetch(), withInterceptors([errorInterceptor])),
  provideRouter(routes, withPreloading(PreloadAllModules)),
]

Above each provider add an inline comment explaining WHY it is here:
// provideBrowserGlobalErrorListeners — catches unhandled errors and promise
//   rejections globally so they surface in the Angular error pipeline
// provideZonelessChangeDetection — removes zone.js; all CD is signal-driven
// provideAnimationsAsync — lazy-loads animation code, reducing initial bundle
// LOCALE_ID: 'en-GB' — sets locale for Angular pipes (date, currency, number)
//   without needing to call formatDate/formatCurrency manually in every component
// withFetch() — uses the native Fetch API instead of XHR; enables HTTP/2 streaming
// withInterceptors([errorInterceptor]) — wires global error normalisation
// withPreloading(PreloadAllModules) — eagerly preloads lazy routes after bootstrap
//   so navigation to the dashboard page is instant
```

### Prompt 12.2 — main.ts i18n bootstrap

```
Update src/main.ts:
- Import { registerLocaleData } from '@angular/common'
- Import localeEnGb from '@angular/common/locales/en-GB'
- Call registerLocaleData(localeEnGb) BEFORE bootstrapApplication()

// DECISION: registerLocaleData(localeEnGb) in main.ts
// ALTERNATIVES CONSIDERED: Using Angular's built-in en locale (default),
//   or importing locale data inside individual components
// REASON: Angular's default bundle includes only the 'en' (US) locale.
// Chubb APAC uses en-GB date and number formatting conventions (DD/MM/YYYY,
// full ISO week). Calling registerLocaleData once in main.ts makes the
// locale available globally to all pipes — no per-component imports needed.

Add this comment immediately above the registerLocaleData call in main.ts.
```

---

## PHASE 13 — Theming & Design Tokens

### Prompt 13.1 — Global styles and dark theme

```
Replace src/styles.scss with a full Material 3 theme:

1. Use @use '@angular/material' as mat

2. html block: @include mat.theme with azure-blue primary palette, Roboto typography
   Override --mat-sys-primary to Chubb navy #1B3A6B
   Define surface tokens for light mode (clean whites and slate greys)

3. body: background-color light grey (#f1f5f9), color from tokens, margin 0

4. html.dark-theme block: @include mat.theme with theme-type: dark
   Override --mat-sys-primary to #93b4ff (accessible blue on dark)
   body inside: background-color #0a1628, dark surface tokens

5. @media (prefers-reduced-motion: reduce):
   *, *::before, *::after {
     animation-duration: 0.01ms !important
     animation-iteration-count: 1 !important
     transition-duration: 0.01ms !important
   }

6. Global snackbar panel class .snack-flag-success:
   Dark green background (#1e4620), light green text (#c8e6c9)
   Dark theme override with deeper green (#0f2e11)

7. .filter-bottom-sheet .mat-bottom-sheet-container:
   border-radius 20px 20px 0 0, max-height 92vh, width 95vw

8. .drilldown-dialog-panel .mat-mdc-dialog-container:
   border-radius 20px, overflow hidden
```

---

## PHASE 14 — index.html & Performance

### Prompt 14.1 — index.html setup

```
Update src/index.html:

1. <title>Policy Hub — Chubb APAC</title>

2. Security meta tags:
   <meta name="referrer" content="strict-origin-when-cross-origin">
   Note: X-Frame-Options and X-Content-Type-Options must be HTTP headers, not meta tags

3. Non-render-blocking Google Fonts preload pattern:
   <link rel="preconnect" href="https://fonts.googleapis.com">
   <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
   For each font (Roboto, Material Icons):
     <link rel="preload" href="[font-url]" as="style" onload="this.onload=null;this.rel='stylesheet'">
     <noscript><link rel="stylesheet" href="[font-url]"></noscript>
```

### Prompt 14.2 — angular.json headers and budgets

```
Update angular.json:

1. Under architect.serve.options, add headers:
   {
     "X-Frame-Options": "SAMEORIGIN",
     "X-Content-Type-Options": "nosniff",
     "Referrer-Policy": "strict-origin-when-cross-origin"
   }

2. Under architect.build.configurations.production.budgets, set:
   anyComponentStyle: maximumWarning 8kB, maximumError 16kB

3. Under architect.test.options, add:
   "codeCoverage": true

4. Add lint architect target:
   "lint": {
     "builder": "@angular-eslint/builder:lint",
     "options": { "lintFilePatterns": ["src/**/*.ts", "src/**/*.html"] }
   }
```

---

## PHASE 15 — i18n Translation Keys

### Prompt 15.1 — Create en.json translation key file

```
Create src/assets/i18n/en.json with translation keys for all UI strings, organized by feature:

Structure:
{
  "APP": { title },
  "FILTER": { search label, placeholder, all filters, apply, reset, close, field labels },
  "TABLE": { caption, all column headers, select aria labels, empty state, page size },
  "STATUS": { Active, Expired, Pending, Cancelled },
  "LOB": { Property, Casualty, A&H, Marine },
  "REGION": { all 8 regions },
  "SUMMARY": { title, status labels, expiring, GWP labels },
  "BULK_ACTION": { selected singular/plural, clear, flag, success messages },
  "DRILLDOWN": { title, close, all 12 field labels, renew, renewing aria },
  "ERROR": { generic title, message, retry, network, http },
  "LOADING": { aria label },
  "THEME": { toggle light, toggle dark }
}

This file is the English translation base — ready for ngx-translate integration.
Note: Template strings currently hardcoded in components; this file documents all keys
for future i18n extraction.
```

---

## PHASE 16 — ESLint Configuration

### Prompt 16.1 — ESLint flat config

```
Create eslint.config.js in project root using Angular ESLint flat config format:

// DECISION: ESLint flat config (eslint.config.js) over legacy .eslintrc.json
// ALTERNATIVES CONSIDERED: .eslintrc.json, Biome
// REASON: ESLint v9+ uses flat config by default. angular-eslint@22 and
// typescript-eslint@8 both expect flat config. The old .eslintrc format
// is deprecated. Flat config is easier to read — it is just a JS array
// of config objects with explicit file patterns, no implicit inheritance.

import tseslint from 'typescript-eslint'
import angular from 'angular-eslint'

export default tseslint.config(
  {
    files: ['**/*.ts'],
    extends: [...tseslint.configs.recommended, ...angular.configs.tsRecommended],
    processor: angular.processInlineTemplates,
    rules: {
      // Enforces app prefix on all selectors — prevents collisions with
      // third-party components and makes component origin obvious in templates
      '@angular-eslint/directive-selector': ['error', { type:'attribute', prefix:'app', style:'camelCase' }],
      '@angular-eslint/component-selector': ['error', { type:'element', prefix:'app', style:'kebab-case' }],
      // 'any' bypasses TypeScript's type system entirely — treat it as an error
      '@typescript-eslint/no-explicit-any': 'error',
      // Consistent type imports reduce bundle size and improve IDE tooling
      '@typescript-eslint/consistent-type-imports': 'warn',
    }
  },
  {
    files: ['**/*.html'],
    // templateAccessibility adds WCAG-aligned rules: missing alt text,
    // missing form labels, interactive elements needing keyboard support
    extends: [...angular.configs.templateRecommended, ...angular.configs.templateAccessibility],
    rules: {}
  }
)

Wire in angular.json architect.lint target and add "lint": "ng lint" to package.json scripts.
```

---

## PHASE 17 — Unit Tests

### Prompt 17.1 — PolicyApiService spec

```
Create src/app/features/policy-dashboard/services/policy-api.service.spec.ts:

Using HttpTestingController, write 7 tests:
1. GET /policies with no params when called without filters
2. Sends status, region, lineOfBusiness, premiumAmount_gte as query params
3. Omits params when filter values are empty or zero
4. Sends _sort and _order params when sort state provided
5. Omits _sort/_order when sort direction is empty
6. PATCH /policies/:id with { flaggedForReview: true } for flagPolicy
7. PATCH /policies/:id with { status: 'Active' } for renewPolicy

Setup: TestBed with provideHttpClient(), provideHttpClientTesting(), provideZonelessChangeDetection()
Teardown: httpMock.verify() in afterEach
```

### Prompt 17.2 — PolicyStore spec

```
Create src/app/features/policy-dashboard/store/policy.store.spec.ts:

Tests (minimum 12):
1. Creates store successfully
2. Initial state: policies=[], loading=false, error=null
3. loadingPolicies() sets loading=true then false after response
4. loadingPolicies() sets policies from API response
5. loadingPolicies() sets error on API failure
6. filteredPolicies: searchTerm filters policyNumber
7. filteredPolicies: searchTerm filters policyHolderName
8. filteredPolicies: searchTerm filters underwriter
9. filteredPolicies: status filter
10. filteredPolicies: region filter
11. summary: correct activeCount, expiredCount, pendingCount, cancelledCount
12. summary: expiringWithin30Days only counts policies in the next 30 days
13. flagSelectedPolicies: optimistic update sets flaggedForReview=true
14. flagSelectedPolicies: rolls back on API error
15. renewPolicy: optimistic update sets status=Active
16. toggleSelection / selectAll / clearSelection

Mock PolicyApiService with jasmine spies.
```

### Prompt 17.3 — SummaryPanel spec

```
Create summary-panel.spec.ts with 17+ tests covering:
- Component creation
- formatPremium: values < 1K, 1K-999K, ≥ 1M, ≥ 1B
- formatPremium with different currency codes (USD→$, JPY→¥, SGD→S$, HKD→HK$)
- Arc SVG: arcCircumference computed correctly
- arcOffset: correct offset when GWP total is 0
- arcOffset: correct offset for non-zero values
- Summary panel reads from store.summary()
```

### Prompt 17.4 — PolicyTable spec

```
Create policy-table.spec.ts with tests covering:
- Component creation
- formatPremium: all ranges and currencies
- toggleSelectAll: selects all page items when none selected
- toggleSelectAll: clears selection when all selected
- displayedColumns contains all 8 expected columns
- dataSource reflects store.filteredPolicies()
```

### Prompt 17.5 — FilterPanel spec

```
Create filter-panel.spec.ts with 10 tests:
- Component creates
- Form seeded from MAT_BOTTOM_SHEET_DATA
- premiumLabel returns 'Any' when minPremium is 0
- premiumLabel returns formatted value with currency symbol
- premiumLabel handles different LOCALE_ID values
- apply() closes sheet with form values
- reset() closes sheet with 'reset' string
- close() closes sheet with null
- Status options all present in select
- Region options all present in select
```

### Prompt 17.6 — Remaining component specs

```
Create the following spec files, each with at minimum a creation test + key behaviour tests:

1. bulk-action-bar.spec.ts:
   - Creates, flagForReview() calls store.flagSelectedPolicies(), snackbar opens on flag

2. policy-filter.spec.ts:
   - Creates, activeFilterCount returns 0 with defaults,
   - activeFilterCount increments per active filter,
   - openFilters() sets isFilterSheetOpen to true

3. policy-drilldown-dialog.spec.ts:
   - Creates, formatDate produces correct string, formatPremium works

4. policy-dashboard.spec.ts (page):
   - Creates, calls store.loadingPolicies() on ngOnInit

5. loading-skeleton.spec.ts: creates
6. error-state.spec.ts: creates, retryClick emits on button click
7. app.spec.ts: creates
```

---

## PHASE 18 — CI/CD Pipeline

### Prompt 18.1 — GitHub Actions CI

```
Create .github/workflows/ci.yml:

name: CI
on: push and pull_request to main branch

jobs:
  build-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4 with node-version: '20'
      - run: npm ci --legacy-peer-deps
      - run: npx ng build --configuration production
      - run: npx ng test --no-watch --browsers=ChromeHeadless
```

---

## PHASE 19 — Documentation

### Prompt 19.1 — README.md

```
Create README.md with these sections:
1. Project Overview — Chubb APAC Policy Hub, tech stack (Angular 20, Material 3, Signal Store)
2. Quick Start — npm install --legacy-peer-deps, npm run start:api, npm start
3. Available Scripts table — start, start:api, build, test, lint, serve:ssr
4. Project Structure — tree showing core/, shared/, features/, environments/, layouts/
5. Architecture — Signal Store, hybrid server/client filtering, theming, i18n
6. Testing — how to run, current count (97 tests), coverage (83%+)
7. Mock API — JSON Server, 250 records, endpoints table
8. StorageService keys table — policy-hub-theme, policy-filters, policy-page-size
9. Known Limitations / Trade-offs summary
```

### Prompt 19.2 — ARCHITECTURE.md

```
Create ARCHITECTURE.md with:
1. Component hierarchy diagram (ASCII tree from AppComponent down to all leaf components)
2. State flow diagram showing: URL params → PolicyFilter → PolicyStore → filteredPolicies → components
3. Layer responsibilities table (Core / Shared / Feature / Store / API / Pages / Components)
4. State categories table (Server / Client / Derived / URL / Persisted)
5. Key design decision bullets (Signal Store rationale, hybrid filtering, HTTP interceptor, @defer, zoneless)
```

### Prompt 19.3 — DESIGN_DECISIONS.md

```
Create DESIGN_DECISIONS.md with one section per major decision:
1. Angular Signals vs NgRx — why not NgRx, why signals over BehaviorSubjects, scalability path
2. Angular Material 3 — why chosen, accessibility benefits, theming integration
3. Hybrid server+client filtering — why enum filters server-side, why search/dates client-side
4. CSS custom properties theming — why not Tailwind, how dark-theme class works
5. Generic StorageService — why generic over named methods, key co-location pattern
6. HTTP error interceptor — why functional interceptor, what it normalises
7. Server-side sorting — how MatSort.sortChange triggers API fetch, JSON Server _sort/_order params
```

### Prompt 19.4 — TRADE_OFFS.md

```
Create TRADE_OFFS.md with:
1. What Was Cut section: E2E tests, MFE architecture, virtual scrolling, i18n translation files, FX rate conversion, Storybook, advanced retry
   For each: why cut, impact, what to do with more time
2. Technical Debt table: client-side search/dates, client-side pagination, N PATCH calls for bulk flag, no i18n extraction
3. Shortcuts Taken: Material CDK focus trap, MatTableDataSource, JSON Server limitations
```

### Prompt 19.5 — AI-JOURNAL.md

```
Create AI-JOURNAL.md documenting the AI collaboration process. Format:

# AI Collaboration Journal — Policy Hub

## [ACCEPTED] / [CHALLENGED] / [OVERRODE] log entries covering:
- Architecture decisions (signal store choice, component breakdown)
- Each major feature (table, filter, summary panel, bulk actions, drilldown)
- Theming approach
- Testing strategy
- Performance optimisations
- Accessibility fixes
- Requirement gaps found and resolved

Include time estimates and reasoning for each decision.
This is intentionally informal — shows human direction of the AI, not polished writing.
```

---

## PHASE 20 — Final Verification

### Prompt 20.1 — Run all checks

```
Run the following verification commands and confirm all pass:

1. npm test -- should show all tests passing (target: 95+ tests)
2. npm run build -- should complete with no errors
3. npm run lint -- should pass with no errors (or acceptable warnings)
4. npm run start:api & npm start -- both should start without errors

Also verify:
- http://localhost:3000/policies returns 250 JSON records
- http://localhost:4200 loads the dashboard
- Dark/light theme toggle works
- Filters update the table and summary panel
- Multi-select + flag for review works with snackbar feedback
- Sorting triggers API re-fetch
- Policy drill-down dialog opens on row click
- Renew button in drill-down works
- Error state and retry works (temporarily break API URL)
- Loading skeleton appears on initial load
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
| **Shared Components** | loading-skeleton, error-state |
| **Feature Components** | policy-table, summary-panel, filter-panel, policy-filter, bulk-action-bar, policy-drilldown-dialog |
| **Pages** | policy-dashboard (container) |
| **App Shell** | app.ts, app.html, app.scss, app.routes.ts |
| **Styles** | styles.scss (Material 3 light/dark theme, design tokens, reduced-motion) |
| **i18n** | assets/i18n/en.json (70+ translation keys) |
| **Mock API** | mock-api/db.json (250 records), generate-data.js |
| **Tests** | 12 spec files, 97 tests, 83%+ coverage |
| **CI** | .github/workflows/ci.yml |
| **Docs** | README, ARCHITECTURE, DESIGN_DECISIONS, TRADE_OFFS, AI-JOURNAL |

**Tech Stack:** Angular 20 · Angular Material 3 · Angular Signals · JSON Server · Karma/Jasmine · ESLint · GitHub Actions
