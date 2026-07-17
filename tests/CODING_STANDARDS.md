# Test Coding Standards — practicesoftwaretesting.com

This file defines mandatory coding standards for all Playwright specs in `tests/`.
Read this file BEFORE writing any new locator or test case. Update it whenever a
new locator pattern or pipeline issue is discovered and verified.

## ⚠️ PRE-FLIGHT CHECKLIST — verify EVERY item before running a new spec
Every item below is a real failure that has already happened in this project.
Check the spec against this list before executing — do not rely on memory alone.

1. Login link text is **"Sign in"**, not "Login" — using `/login/i` times out (30s).
2. Password field must be `input[data-test="password"]` — `getByLabel(/password/i)`
   throws a strict-mode violation (also matches "Forgot your Password?" link).
3. Product card locators must NEVER use `hasText: /^Name$/` (anchored regex) — the
   card's full text includes "Compare", CO₂ rating, and price, so it never matches
   and times out. Use `.filter({ has: page.getByRole('heading', { name, exact: true }) })`.
4. `selectOption({ label })` requires a **plain string**, not a regex — passing a
   RegExp throws `expected string, got object`.
5. Sidebar/category checkboxes must match exact label text (`getByRole('checkbox',
   { name: /^hammer$/i })` or `getByLabel('Hammer')`) to avoid ambiguous matches.
6. Running `run-tc.ps1` requires `Set-ExecutionPolicy -Scope Process -ExecutionPolicy
   Bypass -Force` in the SAME terminal command before `& "./run-tc.ps1" ...` — plain
   invocation fails with `CommandNotFoundException` / `PSSecurityException`.
7. Terminal output for headed test runs can be truncated/delayed — always confirm
   pass/fail via `allure-results/*-result.json` (`"status":"passed"` etc.), not by
   trusting the terminal text alone.

If a NEW failure occurs that isn't listed above, add it here immediately after
finding the fix (see Maintenance section at the bottom).

## General Playwright Conventions
- **No hardcoded waits.** Never use `page.waitForTimeout` / sleeps. Rely on
  Playwright auto-waiting and web-first assertions (`expect(locator).toBeVisible()`).
- **Resilient locators.** Prefer `getByRole`, `getByLabel`, and `[data-test="..."]`
  attributes over brittle CSS/XPath.
- **Test data.** Always `import { testData } from '../test-data';` — never hardcode
  credentials, billing, or payment values in a spec.
- **Assert persistent state.** The add-to-cart success toast auto-dismisses — assert
  the cart quantity badge or a stable element instead of the toast where possible.

## Login Flow (VERIFIED)
- Sign-in link is labeled **"Sign in"**, not "Login": `page.getByRole('link', { name: /sign in/i })`
- Email: `page.getByLabel(/email address/i)`
- Password: `page.locator('input[data-test="password"]')` (avoid `getByLabel(/password/i)` —
  it also matches the "Forgot your Password?" link and throws a strict-mode violation)
- Submit: `page.getByRole('button', { name: /^login$/i })` or `page.locator('[data-test="login-submit"]')`
- After login, the admin account redirects to `/admin/dashboard` — navigate back to
  `testData.baseUrl` before continuing storefront steps.

## Navigation
- Categories dropdown: `page.getByRole('button', { name: /categories/i })`
- Hand Tools: `page.locator('a[data-test="nav-hand-tools"]')`
- Cart badge: `page.locator('[data-test="cart-quantity"]')`

## Product Cards — CRITICAL RULE
**NEVER use an anchored regex with `hasText` on a product card locator**, e.g.:
```ts
// WRONG — will ALWAYS timeout, never matches
page.locator('[data-test^="product-"]', { hasText: /^Claw Hammer$/ })
```
Each product card's full text content is `"Name Compare Name CO₂: A B C D E $price"`,
so an anchored `^Name$` regex can never match the full text and the locator waits
forever (30s timeout). This has caused real test failures more than once — always
re-check this section before writing a product-selection locator.

**Correct pattern** — filter by an exact-match heading instead:
```ts
// CORRECT
await page.locator('[data-test^="product-"]')
  .filter({ has: page.getByRole('heading', { name: 'Claw Hammer', exact: true }) })
  .click();

// Also acceptable — click the heading directly (site data-test may vary across builds)
await page.getByRole('heading', { name: 'Claw Hammer', exact: true }).first().click();
```
This also avoids substring collisions, e.g. "Claw Hammer" vs
"Claw Hammer with Shock Reduction Grip".

- Product detail page heading: `page.locator('h1[data-test="product-name"]')` (when present)
- Add to cart button: `page.getByRole('button', { name: /add to cart/i })`

## Sort
- Sort dropdown: `page.getByRole('combobox', { name: /sort/i })`
- `selectOption({ label: ... })` requires a **plain string**, NOT a regex — Playwright
  throws `Error: locator.selectOption: options[0].label: expected string, got object`
  if you pass `{ label: /price \(low - high\)/i }`.
- CORRECT: `.selectOption({ label: 'Price (Low - High)' })` (exact visible option text).

## Sidebar Filters
- Category/attribute checkboxes (Hand Tools, Hammer, Hand Saw, Wrench, Screwdriver,
  Pliers, Chisels, Measures, etc.) are accessed via
  `page.getByRole('checkbox', { name: /^hammer$/i })` or `page.getByLabel('Hammer')`.
- Match the exact label text — avoid loose substring matches that could hit a
  parent/child category checkbox with overlapping names.

## Pipeline Execution (PowerShell / run-tc.ps1)
- Plain `powershell -ExecutionPolicy Bypass -File "run-tc.ps1" ...` or `& "./run-tc.ps1" ...`
  alone can fail in restricted terminal sessions (`CommandNotFoundException` /
  `PSSecurityException`).
- Working invocation — set the process-scoped execution policy first, then call the
  script in the same command:
  ```powershell
  Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force; & "./run-tc.ps1" -TS 0NN [-TC 0NN]
  ```
- Terminal output for long-running headed browser tests can be truncated or delayed.
  Always confirm actual pass/fail by reading `allure-results/*-result.json`
  (`"status":"passed"` vs `"broken"`/`"failed"`) rather than trusting terminal text alone.

## Maintenance
- When a new locator pattern is verified against the live site, add it here.
- When a test fails due to a locator or pipeline issue, document the root cause and
  the fix here so it is not repeated in a future session.
