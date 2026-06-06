# AI Working Journal

A running log of AI collaboration decisions made during this assessment — what I accepted, what I challenged, and what I overrode, with brief reasoning.

---

## Session Overview

**Tool used:** GitHub Copilot (Claude Sonnet 4.6) inside VS Code  
**Approach:** AI-driven code generation with human review, challenge, and override at every step.

---

## Feature Log

### 1. Project Scaffolding & Mock API

**Prompt intent:** Set up Angular 20, Angular Material 3, JSON Server, seed 250+ policy records.

**Accepted:**
- Angular standalone components, zoneless change detection (`provideZonelessChangeDetection()`). This was the right default for Angular 20 — no zone.js overhead.
- `@faker-js/faker` + `uuid` for seed data generation. Realistic APAC names and correct enums matched the schema.

**Challenged / Overrode:**
- AI initially scaffolded SSR (`@angular/ssr`). **Overrode** — SSR adds complexity with no benefit for a dashboard behind auth. Removed `main.server.ts`, `app.config.server.ts`, `server.ts`.
- AI placed `db.json` at root. **Moved** to `mock-api/` folder for clarity.

---

### 2. Signal-Based State Store

**Prompt intent:** Build a `PolicyStore` with `signal()`, `computed()`, no NgRx.

**Accepted:**
- Single root-level `@Injectable({ providedIn: 'root' })` store. Appropriate for this app's complexity — NgRx would be over-engineering.
- `filteredPolicies = computed(...)` deriving from `policies` + `filters` signals. Clean reactive chain with no subscriptions.
- `summary = computed(...)` deriving counts and GWP in one pass over `filteredPolicies`. Efficient — one computation for all KPIs.

**Challenged:**
- AI initially put `get totalGwp()` as a regular computed field. **Challenged** — it's a derived sum of other fields in the same object, so a getter on the returned object literal is cleaner. Accepted AI's revised approach with the getter pattern.

**Overrode:**
- AI suggested `BehaviorSubject` for selected policy IDs. **Overrode** to `signal<string[]>` — consistent with the signal-first architecture.

---

### 3. URL Query Param Sync

**Prompt intent:** Reflect active filters in URL query params so the dashboard is shareable/bookmarkable.

**Accepted:**
- `ActivatedRoute.snapshot.queryParams` to seed on load, `Router.navigate()` with `replaceUrl: true` to write back. Standard Angular pattern, no extra library needed.
- `debounceTime(400)` on the URL write — avoids thrashing history on every keystroke. Good UX call.

**Challenged:**
- AI's first version wrote URL on every `valueChanges` event (no debounce). **Challenged** — would flood browser history. Added debounce.

---

### 4. Summary Cards & SVG Arc Widget

**Prompt intent:** KPI cards with click-through drill-down; expiring card with animated arc progress.

**Accepted:**
- Inline SVG `<circle>` with `stroke-dasharray` / `stroke-dashoffset` for the arc. No D3 or charting library dependency — correct call for a single widget.
- `arcOffset(pct)` computation: `circumference * (1 - pct/100)`. Correct formula.

**Overrode:**
- AI used `stroke-dasharray="{{ arcCircumference }}"` (interpolation). **Overrode** to `[attr.stroke-dasharray]="arcCircumference"` — Angular throws `NG8002` for SVG attribute interpolation with security sanitisation.

---

### 5. Drill-Down Dialog (Status + Expiring modes)

**Prompt intent:** `MatDialog` showing filtered policy list; expiring mode adds urgency badges + renew button.

**Accepted:**
- `DrilldownMode = 'status' | 'expiring'` discriminated union. Clean API — caller passes mode, dialog derives its own title/columns/filters.
- `renewingIds = signal<Set<string>>()` for per-row optimistic spinner state. Right level of granularity.
- Urgency thresholds: `≤7d` = critical, `≤14d` = high, `>14d` = low. Reasonable domain defaults.

**Challenged:**
- AI's initial `urgencyClass()` used `Math.ceil` comparisons that were off-by-one at exact day boundaries. **Challenged** — identified that `daysFromToday(7)` resolves to 8 due to millisecond delta. AI confirmed the issue and fixed.

---

### 6. Bulk Flag + Optimistic Update

**Prompt intent:** Select policies, flag all in one click; optimistic signal update before HTTP.

**Accepted:**
- Optimistic update pattern: mutate signal immediately, fire PATCH in background. Correct UX — no waiting for network.
- Per-policy PATCH (not a batch endpoint) since JSON Server doesn't support batch. Acknowledged trade-off.

**Overrode:**
- AI suggested dispatching all PATCHes in `forkJoin`. **Overrode** to individual `.subscribe()` calls — `forkJoin` would cancel all requests if one fails, which is wrong for bulk partial success scenarios.

---

### 7. Unit Tests

**Prompt intent:** Production-quality test suite across all components, store, and service.

**Accepted:**
- Jasmine + Karma + ChromeHeadless. Standard Angular testing stack — no added dependencies.
- Real `PolicyStore` in `policy-table.spec.ts` (not mocked via `jasmine.createSpyObj`). AI's initial approach used `createSpyObj` which broke Angular's signal reactive graph. AI identified the root cause.

**Challenged / Overrode:**
- `jasmine.createSpyObj` with signal properties set via the 3rd argument don't integrate with `effect()`. **Overrode** — use real store + `spyOn(store, 'method')` on the real instance.
- AI used `TestBed.inject(MatDialog)` to spy on the dialog. **Challenged** — `MatDialogModule` registers `MatDialog` in the component's environment injector scope, so the root-injected instance is a different object. **Fixed** to `spyOn(component['dialog'], 'open')`.
- AI used `toBeGreaterThanOrEqualTo` (non-existent Jasmine matcher). **Overrode** to `toBeGreaterThanOrEqual`.
- All specs needed `provideZonelessChangeDetection()` — AI missed this in 4 files initially.

---

### 8. Accessibility

**Prompt intent:** WCAG 2.1 AA compliance.

**Accepted:**
- `aria-label` on table, checkboxes, buttons, dialogs.
- `aria-hidden="true"` on decorative `mat-icon` elements.
- `role="status" aria-live="polite"` on empty-state divs.

**Challenged:**
- AI's initial pass was light — only added labels to the most obvious elements. **Challenged** to go deeper: button-toggle-groups in filter panel need `aria-label`, date picker fields need `<mat-label>`, spinner needs `aria-label`.

---

### 9. localStorage / StorageService

**Prompt intent:** Abstracted `StorageService` — no scattered raw `localStorage` calls.

**Accepted:**
- `StorageService` with generic `get<T>`, `set<T>`, `remove` methods, all try/catch guarded. Clean seam for future backend swap.
- Priority: URL params > localStorage > defaults for filter seeding. Correct UX — a shared link should always win over saved state.

**Overrode:**
- `ThemeService` was calling `localStorage` directly. **Refactored** to go through `StorageService`.

---

## What I Would Do With More Time

1. **E2E tests** (Playwright) for critical flows: load → filter → flag → renew
2. **Virtual scrolling** (`CdkVirtualScrollViewport`) for the table — with 250+ records the current approach re-renders all filtered rows on every filter change
3. **Batch PATCH endpoint** in the mock API — current flag implementation fires N parallel PATCHes
4. **i18n** — `$localize` tags and a locale file for at least EN + ZH (Chubb APAC coverage)
5. **MFE exploration** — Module Federation to split the filter panel and table into independently deployable units
6. **Real auth guard** — the dashboard currently has no route guard; add a mock JWT check
7. **Performance budget** — `summary-pannl.scss` already exceeds the Angular default budget; audit and split

---

## AI Collaboration Reflections

The AI (GitHub Copilot / Claude Sonnet 4.6) was effective at:
- Generating boilerplate quickly (store, service, spec files)
- Knowing Angular 20 signal APIs correctly
- Suggesting correct ARIA patterns

Where I added the most value:
- Catching the `MatDialog` injector scope issue (environment vs root injector)
- Catching the off-by-one in `urgencyClass` date math
- Deciding against NgRx (AI defaulted to suggesting it)
- Deciding against `forkJoin` for bulk PATCH
- Removing SSR (AI scaffolded it by default)
- Pushing for a proper `StorageService` abstraction rather than scattered `localStorage` calls
