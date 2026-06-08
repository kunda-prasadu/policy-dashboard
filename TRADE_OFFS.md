# Trade-Offs — Policy Hub (Chubb APAC)

## What Was Cut (and Why)

### E2E Tests (Playwright/Cypress)
- **Cut because**: Time constraint. Core unit + integration tests (95 tests) provide high confidence on business logic. E2E setup alone would consume 30–45 min.
- **With more time**: Add Playwright specs for: search → filter → bulk flag flow, theme persistence across reload, drill-down → renew workflow.

### Micro-Frontend (MFE) Architecture
- **Cut because**: Single-feature scope. MFE adds Webpack Module Federation complexity without benefit when there's one remote app and no independent team deployments.
- **With more time**: Shell app + `policy-dashboard` remote + shared design system library would be the production structure for a multi-team Chubb portal.

### Virtual Scrolling
- **Cut because**: Pagination (10/25/50/100 rows) is sufficient for 250 records and typical broker use. Virtual scroll adds complexity and reduces accessibility.
- **With more time**: Worth evaluating if dataset grows to 10,000+ records.

### i18n Translation Keys (JSON files)
- **Cut because**: Full i18n extraction (`ng extract-i18n`) and separate JSON translation files require Angular's ICU message format. All strings are in English; the LOCALE_ID + `getCurrencySymbol` infrastructure is in place for per-locale currency formatting.
- **With more time**: Extract all UI strings to `assets/i18n/en.json`, add `@ngx-translate/core`, support Simplified Chinese and Japanese for key APAC markets.

### Real FX Rate Conversion in Summary Panel
- **Cut because**: No FX rate API is available in the mock environment. The GWP total in the summary panel accumulates raw `premiumAmount` values across currencies (USD, SGD, HKD, AUD, JPY, THB), which is mathematically incorrect for a true GWP figure.
- **With more time**: Integrate an FX rate service (e.g. Open Exchange Rates) to normalise all premiums to USD before aggregation.

### Storybook Component Documentation
- **Cut because**: Out of scope for a 2–3 hour sprint.
- **With more time**: Storybook stories for every presentational component would greatly help onboarding and design review.

### Advanced Error Recovery (Retry with back-off)
- **Cut because**: Retry button triggers `store.loadingPolicies()` which is sufficient. Exponential back-off with RxJS `retryWhen` would add complexity.
- **With more time**: Implement `retryWhen(errors => errors.pipe(delay(1000), take(3)))` in the API service.

---

## Technical Debt Incurred

| Item | Description | Impact | Fix |
|---|---|---|---|
| Client-side free-text search | Search and date-range filters run in `filteredPolicies` computed signal, not server-side | Fetches full server-filtered set; client filters the rest | Move to server once a real API is available |
| Client-side pagination | `MatPaginator` paginates the already-loaded client dataset | Fetches up to 250 records per filter change | Add `page` + `pageSize` params to API |
| JSON Server PATCH per item | `flagSelectedPolicies()` fires one PATCH per selected policy | N network calls for N selected policies | Real API would accept bulk PATCH `[{id, flaggedForReview}]` |
| No i18n translation files | UI strings hardcoded in templates | Cannot add second language without template edits | `ng extract-i18n` + translate pipe |
| No Storybook | Component API not documented visually | Harder to onboard designers / new developers | `ng add @storybook/angular` |

---

## Shortcuts Taken

- Angular Material handles focus trap in `MatDialog` and `MatBottomSheet` automatically — no custom CDK FocusTrap needed.
- Used `MatTableDataSource` for client-side pagination and filter state instead of building a custom data source — acceptable given 250-record dataset.
- `json-server` used instead of MSW (Mock Service Worker) — JSON Server is simpler to configure for a REST endpoint but has limitations (no middleware, limited query operators).
