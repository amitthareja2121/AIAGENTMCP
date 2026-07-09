# CLAUDE.md

Guidance for AI coding agents working in the **AIAgentMCP** project.

## Project Overview

An AI-driven end-to-end test automation accelerator. It exercises the
[Practice Software Testing](https://practicesoftwaretesting.com) demo store using
Playwright (TypeScript), performs backend pre-checks (REST API + MySQL), and logs
execution results to Excel summaries.

## Corporate Automation Agent Guidelines & Pipeline Enforcement

Whenever the user asks to create, modify, or run a test case scenario via a short chat prompt, always wrap the execution inside our standard enterprise pipeline seamlessly:

1. **Sequential ID Generation:** Before creating a new spec, scan `tests/e2e-demo-*.spec.ts` to find the highest existing number, then use `highest + 1` as the run ID. If no specs exist yet, start at `1`. Use this ID to name the generated test file (`tests/e2e-demo-[ID].spec.ts`) and to coordinate logging. Use this PowerShell command to derive the next ID:
   ```powershell
   $files = Get-ChildItem tests\e2e-demo-*.spec.ts -ErrorAction SilentlyContinue
   $id = if ($files) { ($files | ForEach-Object { [int](($_.Name -replace 'e2e-demo-','') -replace '\.spec\.ts','') } | Measure-Object -Maximum).Maximum + 1 } else { 1 }
   Write-Host "RUN ID: $id"
   ```
2. **Execution Mode:** Always execute Playwright tests in HEADED mode (`headless: false`) so the UI actions are physically visible on screen.
3. **Smart Data Logging:** Append execution metrics and the sequential ID directly into the spreadsheet matching the pattern `C:\Users\1000528\files_claude\E2E_Test_Execution_Summary-[ID].xlsx`. Maintain historical data integrity.

## Test Data Rule (Automatic — No Need to Mention in Prompt)
The file `tests/test-data.ts` is the single source of truth for all credentials, billing, and payment details.
- **Always** add `import { testData } from './test-data';` to every new spec.
- **Sign-in:** Use `testData.signIn.email`, `testData.signIn.password`, `testData.expectedUser` — never hardcode credentials.
- **Billing address:** If the flow goes to checkout/billing, use `testData.billing.*` fields automatically.
- **Payment:** If the flow reaches the payment step, use `testData.payment.*` fields automatically.
- The user does **not** need to ask for this — apply it by default whenever any of these steps are present.

## Live Confirmation Rule
Always print step-by-step confirmation banners in the terminal as each tool finishes so the user can easily take manual milestone screenshots for presentations.

## Project Structure

```
package.json              # npm scripts + Playwright dependency
playwright.config.ts      # Playwright config (headed by default)
tests/                    # Playwright *.spec.ts test files
update_excel_summary.py   # Excel summary writer (zip-based, no deps)
verify_excel.py           # Excel content verifier
test-results/             # Playwright run artifacts (gitignored-worthy)
```

## Commands

- Install browsers: `npx playwright install`
- Run all tests (headed): `npx playwright test --headed --project=chromium`
- Run a single test: `npx playwright test tests/<file>.spec.ts --headed --project=chromium`
- List reporter output: add `--reporter=list`

> On Windows PowerShell, the `npx.ps1` shim may be blocked by execution policy.
> Invoke via `cmd /c "npx playwright test ..."` to bypass it.

## Test Authoring Conventions

- **No hardcoded waits.** Never use `page.waitForTimeout` / sleeps. Rely on
  Playwright auto-waiting and web-first assertions (`expect(locator).toBeVisible()`).
- **Resilient locators.** Prefer `getByRole`, `getByLabel`, and `[data-test="..."]`
  attributes over brittle CSS/XPath.
- **Assert persistent state.** The add-to-cart success toast reads
  "Product added to shopping cart" and auto-dismisses — assert the cart quantity
  badge (`getByRole('link', { name: /cart/i })` contains the count) instead.
- **Artifacts.** Capture an execution trace on success (screenshots disabled for now):
  ```ts
  await page.context().tracing.start({ screenshots: false, snapshots: true, sources: true });
  // ... test steps ...
  await page.context().tracing.stop({ path: `trace-<id>.zip` });
  ```

## Demo Scenarios

Two primary flows are pre-built for the demo. If the audience requests anything beyond these, generate it on the spot from the site structure.

### Scenario 1 — Login + Add to Cart
The core happy-path flow shown in every run:
1. Navigate to `https://practicesoftwaretesting.com`
2. Sign in with admin credentials
3. Confirm user `John Doe` is shown in the header
4. Browse the home page, scroll to a product (e.g. Combination Pliers)
5. Open product page → click **Add to cart**
6. Assert cart badge count increments (toast auto-dismisses, so assert badge not toast)

### Scenario 2 — Product Search & Category Filter
Demonstrates the search and browse capabilities — commonly asked in demos:
1. Navigate to the home page (no login required)
2. Type a product name (e.g. "Pliers") into the search bar → assert results appear
3. Apply a category filter (e.g. "Hand Tools") → assert filtered list updates
4. Open a product from results → assert the product detail page loads with correct title
5. Log result (pass/fail) to Excel summary

### Ad-hoc Flows (on-the-spot generation)
If the demo audience requests a flow not listed above, I will:
- Live-inspect the site structure to discover the relevant page/form
- Generate a new spec file on the spot following the same pipeline (pre-check → generate → run → log → push)
- Common examples: user registration, checkout, contact form, admin panel access

## Excel Reporting

Every test run appends one row to `C:\Users\1000528\files_claude\E2E_Test_Execution_Summary-[ID].xlsx`.

| Column | What it contains |
|--------|------------------|
| Test Name | Scenario name + run ID |
| Target URL | `https://practicesoftwaretesting.com` |
| Status | `Passed` or `Failed` |
| Execution Date | ISO date of the run |
| Notes | Branch, flow type, or failure reason |

- If the file does not exist, `update_excel_summary.py` creates it with headers automatically.
- If it already exists, the row is **appended** — historical data is never overwritten.
- Use `verify_excel.py` to inspect the file contents from the terminal.

## Demo Credentials

- Store: `admin@practicesoftwaretesting.com` / `welcome01`
- REST API health check: `GET https://api.practicesoftwaretesting.com/products`
- Local DB: MySQL `compunneltestdatabase` (read-only `SELECT` checks only)

## Safety Guardrails

- Database operations must be **read-only** (`SELECT`); never emit schema/data mutations.
- Never commit secrets. Do not pass DB passwords on the command line where avoidable.
- Confirm before destructive git operations (force-push, history rewrite, branch deletion).
