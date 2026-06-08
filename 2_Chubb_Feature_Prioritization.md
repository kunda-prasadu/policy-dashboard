# FEATURE PRIORITIZATION MATRIX
## Implementation Roadmap for 2-3 Hour Sprint

---

## 🔴 CRITICAL PATH (Do First - Can't Pass Without These)

### Priority 1: Foundation (0:00 - 0:30)
*Estimated: 30 minutes*

| Feature | Why Critical | Complexity | Time | Status |
|---------|-------------|-----------|------|--------|
| **Project Setup** | Must run locally | Low | 10 min | ⏳ |
| **Angular Project** | Framework requirement | Low | 5 min | ⏳ |
| **Mock Server** | Data source needed | Low | 10 min | ⏳ |
| **Seed Data (200+ records)** | Dataset required | Low | 5 min | ⏳ |

**What you'll have:** Running project with 200+ policies ready to display

---

### Priority 2: Core Table (0:30 - 1:15)
*Estimated: 45 minutes*

| Feature | Why Critical | Complexity | Time | Must-Have |
|---------|-------------|-----------|------|-----------|
| **Table Display** | Core feature | Medium | 15 min | 🔴 YES |
| **Pagination** | Requirement | Medium | 15 min | 🔴 YES |
| **Sorting** | Requirement | Medium | 10 min | 🔴 YES |
| **Status Filter** | Requirement | Low | 5 min | 🔴 YES |

**What you'll have:** Clickable, sortable, paginated policy table that works

---

### Priority 3: Filtering & Search (1:15 - 1:45)
*Estimated: 30 minutes*

| Feature | Why Critical | Complexity | Time | Must-Have |
|---------|-------------|-----------|------|-----------|
| **LOB Filter** | Requirement | Low | 5 min | 🔴 YES |
| **Date Range Filter** | Requirement | Medium | 10 min | 🔴 YES |
| **Region Filter** | Requirement | Low | 5 min | 🔴 YES |
| **Free-text Search** | Requirement | Medium | 10 min | 🔴 YES |

**What you'll have:** Fully functional filtering dashboard - users can find any policy

---

### Priority 4: Statistics & State (1:45 - 2:15)
*Estimated: 30 minutes*

| Feature | Why Critical | Complexity | Time | Must-Have |
|---------|-------------|-----------|------|-----------|
| **Summary Stats Panel** | Requirement | Medium | 15 min | 🔴 YES |
| **State Management Setup** | Requirement + Architecture | High | 15 min | 🔴 YES |
| **Theming Foundation** | Requirement | Medium | 10 min | 🔴 YES |

**What you'll have:** 
- Statistics updating with filters
- Proper state architecture in place
- Theme tokens defined

---

### Priority 5: Required Features (2:15 - 2:45)
*Estimated: 30 minutes*

| Feature | Why Critical | Complexity | Time | Must-Have |
|---------|-------------|-----------|------|-----------|
| **Bulk Select Checkboxes** | Requirement | Low | 10 min | 🔴 YES |
| **Flag for Review Action** | Requirement | Low | 5 min | 🔴 YES |
| **Success/Error Feedback** | Requirement | Low | 5 min | 🔴 YES |
| **Theme Toggle** | Requirement | Low | 10 min | 🔴 YES |
| **Local Storage Service** | Requirement | Low | 10 min | 🔴 YES |

**What you'll have:** All mandatory features implemented

---

### Priority 6: Quality Baseline (2:45 - 3:00)
*Estimated: 15 minutes*

| Feature | Why Critical | Complexity | Time | Must-Have |
|---------|-------------|-----------|------|-----------|
| **Loading States** | Better UX + Requirement | Low | 5 min | 🔴 YES |
| **Empty States** | Better UX + Requirement | Low | 5 min | 🔴 YES |
| **Accessibility Audit** | Requirement | Medium | 5 min | 🔴 YES |

**What you'll have:** Professional user experience, WCAG AA compliant

---

## 🟡 HIGH PRIORITY (Do Next - Expected from Senior Engineers)

### Priority 7: Testing & Polish (3:00 - 4:00)
*Estimated: 60 minutes*

| Feature | Why Important | Complexity | Time | Impact |
|---------|--------------|-----------|------|--------|
| **Unit Tests (Services)** | Quality standard | Medium | 20 min | 🟡 HIGH |
| **Component Tests** | Quality standard | Medium | 20 min | 🟡 HIGH |
| **Error Handling** | Production readiness | Medium | 10 min | 🟡 HIGH |
| **Code Review Checklist** | Polish | Low | 10 min | 🟡 MEDIUM |

**What you'll have:** Production-grade code with 80% coverage

---

### Priority 8: Documentation (4:00 - 4:30)
*Estimated: 30 minutes*

| Feature | Why Important | Complexity | Time | Impact |
|---------|--------------|-----------|------|--------|
| **Meaningful Commits** | Professional | Low | 5 min | 🟡 HIGH |
| **README** | Setup instructions | Low | 5 min | 🟡 HIGH |
| **AI Journal** | Assessment requirement | Low | 15 min | 🟡 HIGH |
| **Code Comments** | Maintainability | Low | 5 min | 🟡 MEDIUM |

**What you'll have:** Professional deliverables ready for submission

---

## 🟢 BONUS (If Time Permits)

### Priority 9: Advanced Features (4:30 - 5:00)
*Estimated: 30 minutes*

| Feature | Why Nice | Complexity | Time | Impact |
|---------|---------|-----------|------|--------|
| **E2E Tests** | Confidence | High | 15 min | 🟢 LOW |
| **Storybook** | Documentation | Medium | 10 min | 🟢 LOW |
| **Advanced Error Recovery** | UX | Medium | 5 min | 🟢 LOW |
| **Performance Optimization** | Awareness | Medium | 5 min | 🟢 LOW |

---

## 📊 IMPLEMENTATION TIMELINE

### Ideal Scenario (Everything On Track)

```
0:00 ├─ Setup & scaffolding complete
     │
0:15 ├─ Mock server running with 200+ policies
     │
0:30 ├─ Table displaying policies (not yet sortable/filterable)
     │
0:45 ├─ Table + pagination + sorting works
     │
1:00 ├─ All filters working
     │  ├─ Status filter ✓
     │  ├─ LOB filter ✓
     │  └─ Date/Region filter ✓
     │
1:15 ├─ Free-text search working
     │
1:30 ├─ Statistics panel calculating correctly
     │  ├─ Status counts ✓
     │  ├─ Premium by LOB ✓
     │  └─ Expiring count ✓
     │
1:45 ├─ State management architecture in place
     │
2:00 ├─ Bulk actions working (select + flag)
     │
2:15 ├─ Theming implemented (light + dark)
     │
2:30 ├─ Local storage for preferences
     │
2:45 ├─ Loading/empty/error states
     │
3:00 ├─ Basic unit tests passing
     │
3:15 ├─ Documentation complete
     │
3:30 ├─ Code review + polish
     │
3:45 ├─ Ready for submission ✅
```

---

### If Running Behind (Cut In This Order)

```
KEEP (Non-negotiable):
  ✅ Table + filtering + sorting
  ✅ Statistics panel
  ✅ Theming
  ✅ Storage service
  ✅ Accessibility minimum (keyboard nav)
  ✅ Tests (at least some coverage)

CUT IF BEHIND (Still acceptable):
  ⚠️ Skeleton screens → Regular spinners OK
  ⚠️ Optimistic updates → Direct feedback OK
  ⚠️ Advanced error recovery → Basic errors OK
  ⚠️ E2E tests → Keep unit tests

NEVER CUT:
  ❌ Core table functionality
  ❌ State management
  ❌ Accessibility (minimum keyboard nav)
  ❌ Theming (required)
```

---

## 🎯 PER-FEATURE CHECKLIST

### ✅ Table Implementation Checklist

```
Policy Table Feature:
  [ ] Component created (PolicyTableComponent)
  [ ] Displays all columns from schema
  [ ] Rows clickable/hoverable for visual feedback
  [ ] Column headers visible and readable
  [ ] Responsive (works on different screen sizes)
  
Pagination:
  [ ] Previous/Next buttons work
  [ ] Page number display
  [ ] Configurable page size (show 10, 25, 50, 100)
  [ ] Total record count displayed
  [ ] Page size persisted to localStorage
  
Sorting:
  [ ] Click header to sort
  [ ] Sort indicator (▲▼) visible
  [ ] Multiple sorts not required (single column OK)
  [ ] Server-side sorting (send sort param to API)
  
Filtering:
  [ ] Status filter dropdown
  [ ] LOB filter (multi-select or dropdown)
  [ ] Date range picker (start/end dates)
  [ ] Region filter (multi-select or dropdown)
  [ ] Filters work independently and combined
  
Search:
  [ ] Search box for free-text
  [ ] Searches: Policy#, Holder, Underwriter
  [ ] Results update real-time or on Enter
  [ ] Search + Filter work together
  
Overall:
  [ ] No visual UI bugs
  [ ] Columns properly aligned
  [ ] Data formatting (dates, currency)
  [ ] Error handling if API fails
```

### ✅ Bulk Actions Checklist

```
Selection:
  [ ] Checkbox for each row
  [ ] Header checkbox to select all
  [ ] Visual indication of selected rows
  [ ] Selection count shown somewhere
  
Flag for Review Action:
  [ ] Button disabled when nothing selected
  [ ] Button enabled when items selected
  [ ] Clicking button flags selected policies
  [ ] Success message shown
  [ ] Error message if it fails
  [ ] Checkboxes clear after action
  
Feedback:
  [ ] Toast notification for success
  [ ] Toast notification for errors
  [ ] Visual state change (optional: strikethrough, opacity)
  [ ] No silent failures
```

### ✅ Statistics Checklist

```
Status Counts:
  [ ] Active count correct
  [ ] Expired count correct
  [ ] Pending count correct
  [ ] Cancelled count correct
  [ ] Counts update when filters change
  
Premium by LOB:
  [ ] Property total calculated
  [ ] Casualty total calculated
  [ ] A&H total calculated
  [ ] Marine total calculated
  [ ] Currency displayed (USD, SGD, etc.)
  [ ] Amounts formatted with commas/decimals
  
Expiring Alert:
  [ ] Count of policies expiring in 30 days
  [ ] Formula: today + 30 days >= expiryDate
  [ ] Updates when filters change
  
Responsiveness:
  [ ] Stats display on desktop
  [ ] Stats readable on tablet
  [ ] Stats degrade gracefully on mobile
```

### ✅ State Management Checklist

```
Architecture:
  [ ] Approach documented (NgRx/Akita/RxJS/Signals)
  [ ] Reasoning documented in file or comments
  [ ] Server state clearly separated
  [ ] Client state clearly separated
  [ ] URL state shareable (optional but good)
  
Implementation:
  [ ] No state directly in components
  [ ] State accessed through service/store
  [ ] Immutable state updates
  [ ] Proper TypeScript typing
  [ ] No memory leaks (unsubscribe pattern)
  
Loading:
  [ ] Loading flag in state
  [ ] Skeleton screen when loading
  [ ] Prevents user actions while loading
  
Error Handling:
  [ ] Error message stored in state
  [ ] Displayed to user with context
  [ ] Retry mechanism available
  [ ] Error clears on successful retry
  
Empty State:
  [ ] Message shown when no results
  [ ] Suggests clearing filters
  [ ] Different from error state
```

### ✅ Theming Checklist

```
Design Tokens:
  [ ] Primary color defined
  [ ] Secondary color defined
  [ ] Success/Error/Warning colors
  [ ] Neutral colors (grays, text, background)
  [ ] Spacing scale (8px, 16px, 24px, etc.)
  [ ] Typography (font family, sizes, weights)
  [ ] Border radius
  [ ] Shadows
  
Light Theme:
  [ ] All tokens defined for light mode
  [ ] Text readable on backgrounds
  [ ] Icons visible
  [ ] Buttons distinguishable
  
Dark Theme:
  [ ] All tokens defined for dark mode
  [ ] Text readable on backgrounds
  [ ] Icons visible
  [ ] Buttons distinguishable
  [ ] 4.5:1 contrast ratio met
  
Toggle:
  [ ] Toggle button visible (header recommended)
  [ ] Click changes all colors
  [ ] No page reload
  [ ] Smooth transition (optional)
  [ ] Current theme indicated
  
Persistence:
  [ ] Theme choice saved to localStorage
  [ ] Restored on refresh
  [ ] Different browsers have different themes OK
  
System Preference:
  [ ] Default to system preference if no saved value
  [ ] Change system theme, app respects it (first visit)
  [ ] User preference overrides system (after toggle)
```

### ✅ Local Storage Checklist

```
Service:
  [ ] StorageService created
  [ ] Encapsulates all localStorage access
  [ ] Simple get(key), set(key, value) methods
  [ ] No scattered localStorage.getItem calls
  [ ] Error handling (quota exceeded, etc.)
  
Usage:
  [ ] Theme saved/loaded via service
  [ ] Page size saved/loaded via service
  [ ] Other preferences saved/loaded via service
  [ ] Service used in components consistently
  
Robustness:
  [ ] Works if localStorage unavailable (graceful degradation)
  [ ] Proper error messages
  [ ] Sensible defaults if nothing stored
  [ ] No app crashes from storage issues
```

### ✅ Accessibility Checklist

```
HTML Structure:
  [ ] Semantic HTML (<button>, <nav>, <main>, etc.)
  [ ] Proper heading hierarchy (h1 > h2 > h3)
  [ ] Not <div role="button"> instead of <button>
  [ ] Form inputs have associated <label>
  
Keyboard Navigation:
  [ ] Tab order is logical
  [ ] Can operate all features without mouse
  [ ] Focus indicators visible
  [ ] No keyboard traps
  [ ] Enter/Space activate buttons
  
ARIA:
  [ ] aria-label on icon buttons
  [ ] aria-describedby for help text
  [ ] aria-live for toast notifications
  [ ] aria-expanded for expandable sections (if any)
  [ ] Proper roles where needed
  
Colors & Contrast:
  [ ] Text contrast ≥4.5:1 (normal text)
  [ ] Text contrast ≥3:1 (large text)
  [ ] Errors indicated by icon + color (not color alone)
  [ ] Links distinguishable from text
  
Motion:
  [ ] Respects prefers-reduced-motion
  [ ] Animations aren't required to use app
  [ ] No auto-playing animations
  [ ] Fast, subtle animations (not jolting)
  
Testing:
  [ ] axe DevTools run, no errors
  [ ] Keyboard-only navigation test passed
  [ ] Screen reader test (NVDA/JAWS simulator)
```

### ✅ Testing Checklist

```
Unit Tests (Services):
  [ ] PolicyService tested
  [ ] StorageService tested
  [ ] ThemeService tested
  [ ] Filter logic tested
  [ ] Calculate statistics tested
  [ ] 80%+ coverage
  
Component Tests:
  [ ] PolicyTableComponent behavior tested
  [ ] Sorting works correctly
  [ ] Pagination controls work
  [ ] Filters update table
  [ ] Search works
  [ ] Checkboxes select/deselect
  [ ] Flag action works
  
Integration Tests:
  [ ] Apply filter → table updates → stats update
  [ ] Sort + filter together work
  [ ] Pagination persists after filter
  [ ] Bulk action + checkbox state clear
  [ ] Theme toggle persists
  
Test Quality:
  [ ] Meaningful test names
  [ ] Arrange-Act-Assert structure
  [ ] Tests isolated (no interdependencies)
  [ ] No flaky tests (don't pass/fail randomly)
  [ ] Setup/cleanup proper
  
Execution:
  [ ] npm test runs all tests
  [ ] All tests pass before submission
  [ ] Coverage report generated
```

---

## ⏰ TIME BOXING STRATEGY

If at any point you're over time:

**At 1:30** (30 min remaining):
- Do you have table + filtering? → Continue
- Missing filtering? → Stop, focus on quality over completeness

**At 2:00** (60 min remaining):
- Do you have stats + filtering? → Continue
- Missing stats? → Add basic stats now

**At 2:30** (90 min remaining):
- Do you have bulk actions + theming? → Continue with testing
- Missing either? → Add now, skip some tests

**At 3:00** (120 min remaining):
- Do you have all mandatory features? → Start testing
- Missing features? → Finish features, minimal testing

**At 4:00** (240 min remaining):
- Is everything working? → Add E2E or documentation
- Still debugging? → Focus on stability over completeness

---

## 🎪 WALKTHROUGH PREP CHECKLIST

Before walkthrough, prepare answers to:

```
Architecture:
  [ ] "Why did you choose NgRx/Akita/RxJS?"
  [ ] "Walk me through your component hierarchy"
  [ ] "How do you separate concerns?"
  [ ] "Show me your state flow"
  
Implementation:
  [ ] "Why this folder structure?"
  [ ] "Tell me about your StorageService"
  [ ] "How do you handle errors?"
  [ ] "Why pagination instead of virtual scrolling?"
  
Testing:
  [ ] "What's your test coverage?"
  [ ] "Show me a meaningful test"
  [ ] "What didn't you test and why?"
  
Trade-offs:
  [ ] "What would you do with more time?"
  [ ] "What did you cut and why?"
  [ ] "What shortcuts did you take?"
  
AI Collaboration:
  [ ] "What did you accept from AI?"
  [ ] "What did you challenge?"
  [ ] "Show me where you overrode AI"
```

---

**Your goal:** Not perfection, but demonstrating you can architect, prioritize, and ship quality code under time pressure while directing AI effectively.

Good luck! 🚀
