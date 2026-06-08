# CHUBB APAC ASSESSMENT - QUICK REFERENCE CARD
## One-Page Guide for Developers

---

## 🎯 THE CORE CHALLENGE
**Build a Policy Overview Dashboard in 2-3 hours using Angular** 
- Show you can use AI effectively to produce quality code
- Demonstrate production-grade architecture under time pressure
- Balance completeness with code quality

---

## ✅ MANDATORY CHECKLIST (Cannot Pass Without These)

### Features (Must Have)
```
┌─────────────────────────────────────────────────────┐
│ ✅ Policy Table                                      │
│    • Pagination (configurable page size)             │
│    • Sorting on columns                              │
│    • Filters: Status, LOB, Date, Region              │
│    • Free-text search (POL#, Holder, Underwriter)    │
│                                                      │
│ ✅ Summary Statistics Panel                          │
│    • Count by Status (4 states)                      │
│    • Total Premium by LOB (4 types)                  │
│    • Expiring in 30 days count                       │
│    • Updates when filters change                     │
│                                                      │
│ ✅ Bulk Actions                                      │
│    • Multi-select checkboxes                         │
│    • "Flag for Review" action                        │
│    • Success/failure feedback                        │
│                                                      │
│ ✅ State Management                                  │
│    • Clear server/client/URL state separation        │
│    • Proper loading states (skeleton, not spinner)   │
│    • Empty states with messaging                     │
│    • Error states with retry                         │
│    • Document your choice & justify it               │
│                                                      │
│ ✅ Component Architecture                            │
│    • Single responsibility principle                 │
│    • Reusable, composable components                 │
│    • Container/Presentational separation             │
│    • Clear data flow patterns                        │
│                                                      │
│ ✅ Theming (REQUIRED)                               │
│    • Light + Dark modes                              │
│    • Design tokens (colors, spacing, typography)     │
│    • Toggle switch for user                          │
│    • Persist to localStorage                         │
│    • Respect system preference (prefers-color-scheme)│
│                                                      │
│ ✅ Local Storage Abstraction (REQUIRED)              │
│    • StorageService encapsulation                    │
│    • Persists: theme, page size, last filters        │
│    • NOT scattered through components                │
│                                                      │
│ ✅ Accessibility (WCAG 2.1 AA - REQUIRED)           │
│    • Semantic HTML                                   │
│    • Keyboard navigation fully supported             │
│    • 4.5:1 contrast ratio (WCAG AA)                  │
│    • Proper ARIA labels/roles                        │
│    • Screen reader compatible                        │
│    • Test with axe DevTools                          │
│                                                      │
│ ✅ Testing (Production Quality - REQUIRED)           │
│    • Unit tests for services                         │
│    • Component tests for behavior                    │
│    • Integration tests for workflows                 │
│    • Minimum 80% coverage                            │
│    • Meaningful assertions (not just rendering)      │
│    • All tests pass before submission                │
└─────────────────────────────────────────────────────┘
```

### Code & Engineering Standards
```
┌─────────────────────────────────────────────────────┐
│ ✅ Code Quality                                      │
│    • No "any" types (use unknown if needed)          │
│    • DRY principle - no duplication                  │
│    • SOLID principles evident                        │
│    • Clean, readable code                            │
│    • Meaningful variable names                       │
│                                                      │
│ ✅ Architecture & Patterns                           │
│    • Proper folder structure (/core, /shared, /features)
│    • Service-oriented design                         │
│    • Dependency injection                            │
│    • Error handling (no silent failures)             │
│    • HTTP error interceptor                          │
│                                                      │
│ ✅ Performance Awareness                             │
│    • OnPush change detection where appropriate       │
│    • Proper subscription management (takeUntil)      │
│    • Memory cleanup in ngOnDestroy                   │
│    • Debounced search/filter inputs                  │
│    • Pagination instead of loading all items         │
│                                                      │
│ ✅ Browser Storage                                   │
│    • Not localStorage scattered everywhere           │
│    • Dedicated StorageService with get/set           │
│    • Error handling for quota exceeded               │
│    • Sensible defaults                               │
└─────────────────────────────────────────────────────┘
```

### Deliverables
```
┌─────────────────────────────────────────────────────┐
│ 📦 Git Repository                                    │
│    • Meaningful commit messages                      │
│    • Commits every 15-30 minutes showing progress    │
│    • Clean .gitignore                                │
│    • README with setup instructions                  │
│                                                      │
│ 🚀 Working Application                              │
│    • npm install && npm start works                  │
│    • No console errors                               │
│    • All features functional                         │
│    • Backend (mock server) included or documented    │
│    • 200+ policy records in seed data                │
│                                                      │
│ 📝 AI Working Journal (REQUIRED)                    │
│    • Prompt log showing decisions made               │
│    • What you ACCEPTED from AI                       │
│    • What you CHALLENGED                             │
│    • What you OVERRODE                               │
│    • Brief reasoning for each                        │
│    • Committed to repo (can be informal)             │
│                                                      │
│ 📚 Documentation                                     │
│    • README (setup, how to run, limitations)         │
│    • ARCHITECTURE.md (if complex)                    │
│    • Code comments (explain WHY, not WHAT)           │
│    • Git history tells the story                     │
└─────────────────────────────────────────────────────┘
```

---

## ⚡ RECOMMENDED (Expected from Senior Engineers)
- [ ] Skeleton screens for loading (not just spinner)
- [ ] Error handling with retry functionality
- [ ] Empty state messaging
- [ ] Optimistic updates (e.g., for flag action)
- [ ] Configuration in environment files
- [ ] Logging service (not console.log)
- [ ] Type-safe services and components
- [ ] Supporting documentation (ARCHITECTURE.md, DESIGN_DECISIONS.md)

---

## 🎁 BONUS (Differentiators - if you have time)
- [ ] Micro-Frontend Architecture
- [ ] E2E tests
- [ ] Storybook documentation
- [ ] Advanced i18n structure
- [ ] Advanced ARIA patterns
- [ ] Custom theming editor UI

---

## 📊 DATA SCHEMA (Copy-Paste Ready)

```typescript
interface Policy {
  id: string;                  // UUID
  policyNumber: string;        // POL-XXXXXX format
  policyholderName: string;    // APAC names
  lineOfBusiness: 'Property' | 'Casualty' | 'A&H' | 'Marine';
  status: 'Active' | 'Expired' | 'Pending' | 'Cancelled';
  premiumAmount: number;       // 1,000 - 5,000,000
  currency: 'USD' | 'SGD' | 'HKD' | 'AUD' | 'JPY' | 'THB';
  effectiveDate: string;       // YYYY-MM-DD
  expiryDate: string;          // YYYY-MM-DD
  region: 'Singapore' | 'Hong Kong' | 'Australia' | 'Japan' | 
          'Thailand' | 'Indonesia' | 'Malaysia' | 'Philippines';
  underwriter: string;         // Team/person name
  flaggedForReview: boolean;   // Default: false
}
```

---

## ⏱️ SUGGESTED TIME ALLOCATION

```
0:00-0:15  Setup & scaffolding ........................... 15 min
0:15-0:45  Table + Filtering (CORE) ...................... 30 min
0:45-1:15  Statistics + State Management ................ 30 min
1:15-1:45  Bulk Actions ................................. 30 min
1:45-2:00  Theming + Storage (REQUIRED) ................. 15 min
2:00-2:30  Accessibility + Basic Tests .................. 30 min
2:30-3:00  Error States, Loading States, Polish ........ 30 min
3:00+      E2E Tests, Advanced Features, MFE (BONUS) ... Variable
```

**If you run out of time, in this order:**
1. ✅ Keep core table + filtering (most critical)
2. ✅ Keep statistics panel
3. ✅ Keep theming & storage (it's required)
4. ⚠️ Simplify bulk actions (still show feedback)
5. ⚠️ Basic accessibility (keyboard navigation minimum)
6. ❌ Skip E2E tests
7. ❌ Skip advanced features
8. ❌ Skip MFE pattern

---

## 🗣️ WALKTHROUGH (30-60 min) - Be Ready For:

### Your Presentation (15-20 min)
- [ ] Architecture overview & component design
- [ ] Live demo of application
- [ ] What you built, what you didn't, why

### Panel Q&A (10-15 min)
- [ ] Technical deep-dive: "Why did you choose X?"
- [ ] Tradeoff discussions
- [ ] "Why not Y instead?"
- [ ] Be prepared to defend EVERY decision

### With More Time (10 min)
- [ ] What would you tackle next? (prioritized list)
- [ ] What would you do differently?
- [ ] What did you learn?

### Your Questions (5 min)
- [ ] Ask about the role, team, engineering culture

---

## 🚨 RED FLAGS - AVOID THESE

❌ **Code Smells**
- Scattered localStorage calls throughout components
- No error handling in API calls
- `any` type everywhere
- Hardcoded values / Magic numbers
- No loading/empty/error states
- Inaccessible HTML (divs as buttons, no labels)

❌ **Process Issues**
- No git history / single commit for everything
- Missing AI journal
- Application doesn't run
- Tests don't pass
- Walkthrough you can't explain your own code

❌ **Time Management**
- Perfect MFE with 0 tests over core features + tests
- Skipped all mandatory items for bonus features
- No git history showing work progression

---

## ✨ GREEN FLAGS - DO THESE

✅ **Code Excellence**
- Type-safe services and components
- Clear separation of concerns
- Components are reusable
- Error handling with user feedback
- Proper async management (no memory leaks)

✅ **Smart Prioritization**
- Core features solid + tested
- Acknowledged trade-offs
- Explained what was cut & why
- Time-boxed features appropriately

✅ **Professional Approach**
- Meaningful commit messages every 15-30 min
- Documentation of decisions
- AI journal showing your direction
- Code you can defend in walkthrough
- Accessibility considered, not an afterthought

---

## 📋 FINAL CHECKLIST BEFORE SUBMISSION

```
Feature Implementation:
  [ ] Table with pagination, sort, filter, search
  [ ] Statistics panel (counts + premium by LOB + expiring)
  [ ] Bulk actions (select + flag for review)
  [ ] Loading states (skeleton screens, not spinners)
  [ ] Empty states (when no data matches filters)
  [ ] Error states (with retry)
  
Required Architecture:
  [ ] Component architecture (proper separation)
  [ ] State management (with justification documented)
  [ ] Theming (light + dark + persistence)
  [ ] Storage service (not scattered localStorage)
  [ ] Accessibility (WCAG 2.1 AA - axe pass)
  
Code Quality:
  [ ] No "any" types
  [ ] Services properly encapsulated
  [ ] Tests passing (unit + integration)
  [ ] Linting passes
  [ ] No console errors
  
Deliverables:
  [ ] Git repo with meaningful commits
  [ ] Application runs: npm install && npm start
  [ ] README with instructions
  [ ] AI Journal committed
  [ ] Supporting docs (ARCHITECTURE.md, etc.)
  
Testing:
  [ ] Unit tests for services ≥80% coverage
  [ ] Component tests for behavior
  [ ] Integration tests for features
  [ ] Manual testing of accessibility
  [ ] All tests passing
```

---

**Remember:** The panel is evaluating **how well you work with AI**, not just what you build. 
Show your thinking. Challenge bad suggestions. Own your code. Good luck! 🚀
