/**
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║              AI AGENT MCP — TEST CATALOGUE                              ║
 * ║  Single source of truth for all verified prompt scenarios.              ║
 * ║  This file survives TS suite deletions — always read this first         ║
 * ║  before generating any spec file.                                       ║
 * ║                                                                         ║
 * ║  Verified: 2026-07-17 | Site: practicesoftwaretesting.com               ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 *
 * HOW TO USE (for AI agent):
 *   1. Receive prompt from user
 *   2. Match prompt to a scenario below
 *   3. Use the EXACT locators and step sequence recorded here
 *   4. Generate spec — no guessing, no inspecting again
 */

// ─────────────────────────────────────────────────────────────────────────────
// SHARED: LOGIN BLOCK
// Copy this block into every spec that requires authentication.
// ─────────────────────────────────────────────────────────────────────────────
export const LOGIN_STEPS = `
  // LOGIN — verified 2026-07-17
  await page.goto(testData.baseUrl);
  await page.getByRole('link', { name: /sign in/i }).click();
  await page.waitForLoadState('networkidle');          // REQUIRED — login page must fully load
  await page.getByLabel(/email/i).fill(testData.signIn.email);
  await page.locator('[data-test="password"]').fill(testData.signIn.password);
  await page.locator('[data-test="login-submit"]').click();
  // Admin redirects to /dashboard — navigate back to store
  await page.goto(testData.baseUrl, { waitUntil: 'networkidle' });
  await expect(page.locator('[data-test="nav-categories"]')).toBeVisible();
`;

// ─────────────────────────────────────────────────────────────────────────────
// SCENARIO CATALOGUE
// ─────────────────────────────────────────────────────────────────────────────
export const catalogue = {

  /**
   * PROMPT 1 — Search Flow
   * "Login with credentials. On the home page type Pliers in the search bar
   *  and click Search. From the results open Combination Pliers and add it to
   *  the cart."
   */
  searchFlow: {
    id:          'PROMPT-1',
    title:       'Login → Search Pliers → Combination Pliers → Add to Cart',
    verified:    '2026-07-17',
    inStock:     true,

    locators: {
      searchInput:       '[data-test="search-query"]',
      searchSubmit:      '[data-test="search-submit"]',
      productHeading:    { role: 'heading', name: 'Combination Pliers', exact: true },
      productH1:         'h1[data-test="product-name"]',
      addToCart:         { role: 'button', name: /add to cart/i },
      cartQty:           '[data-test="cart-quantity"]',
    },

    steps: [
      'LOGIN (use shared LOGIN_STEPS block)',
      'await page.locator(\'[data-test="search-query"]\').fill(\'Pliers\')',
      'await page.locator(\'[data-test="search-submit"]\').click()',
      'await page.waitForLoadState(\'networkidle\')',
      'await expect(page.getByRole(\'heading\', { name: \'Combination Pliers\', exact: true }).first()).toBeVisible()',
      'await page.getByRole(\'heading\', { name: \'Combination Pliers\', exact: true }).first().click()',
      'await expect(page.locator(\'h1[data-test="product-name"]\')).toContainText(\'Combination Pliers\')',
      'await page.getByRole(\'button\', { name: /add to cart/i }).click()',
      'await expect(page.locator(\'[data-test="cart-quantity"]\')).not.toHaveText(\'0\')',
    ],
  },

  /**
   * PROMPT 2 — Category Navigation Flow
   * "Login with credentials. Click the Categories dropdown in the navigation
   *  and select Hand Tools. Open the Claw Hammer product and add it to the cart."
   */
  categoryNavFlow: {
    id:          'PROMPT-2',
    title:       'Login → Categories → Hand Tools → Claw Hammer → Add to Cart',
    verified:    '2026-07-17',
    inStock:     true,

    locators: {
      navCategories:  '[data-test="nav-categories"]',
      navHandTools:   '[data-test="nav-hand-tools"]',
      productHeading: { role: 'heading', name: 'Claw Hammer', exact: true },
      productH1:      'h1[data-test="product-name"]',
      addToCart:      { role: 'button', name: /add to cart/i },
      cartQty:        '[data-test="cart-quantity"]',
    },

    steps: [
      'LOGIN (use shared LOGIN_STEPS block)',
      'await page.locator(\'[data-test="nav-categories"]\').click()',
      'await page.locator(\'[data-test="nav-hand-tools"]\').click()',
      'await page.waitForLoadState(\'networkidle\')',
      'await expect(page).toHaveURL(/hand-tools/)',
      'await page.getByRole(\'heading\', { name: \'Claw Hammer\', exact: true }).first().click()',
      'await expect(page.locator(\'h1[data-test="product-name"]\')).toContainText(\'Claw Hammer\')',
      'await page.getByRole(\'button\', { name: /add to cart/i }).click()',
      'await expect(page.locator(\'[data-test="cart-quantity"]\')).not.toHaveText(\'0\')',
    ],
  },

  /**
   * PROMPT 3 — Sidebar Filter Flow
   * "Login with credentials. On the home page check the Hammer filter in the
   *  sidebar. From the filtered results open Thor Hammer and add it to the cart."
   */
  sidebarFilterFlow: {
    id:          'PROMPT-3',
    title:       'Login → Hammer Sidebar Filter → Thor Hammer → Add to Cart',
    verified:    '2026-07-17',
    inStock:     true,

    locators: {
      // Sidebar filter uses icheck label — getByLabel works in headed Playwright
      hammerFilter:   { label: 'Hammer' },
      productHeading: { role: 'heading', name: 'Thor Hammer', exact: true },
      productH1:      'h1[data-test="product-name"]',
      addToCart:      { role: 'button', name: /add to cart/i },
      cartQty:        '[data-test="cart-quantity"]',
    },

    steps: [
      'LOGIN (use shared LOGIN_STEPS block)',
      'await page.getByLabel(\'Hammer\').click()       // icheck sidebar checkbox',
      'await page.waitForLoadState(\'networkidle\')',
      'await page.getByRole(\'heading\', { name: \'Thor Hammer\', exact: true }).first().click()',
      'await expect(page.locator(\'h1[data-test="product-name"]\')).toContainText(\'Thor Hammer\')',
      'await page.getByRole(\'button\', { name: /add to cart/i }).click()',
      'await expect(page.locator(\'[data-test="cart-quantity"]\')).not.toHaveText(\'0\')',
    ],
  },

  /**
   * PROMPT 4 — Sort by Price Flow
   * "Login with credentials. On the home page sort the products by Price Low
   *  to High. Open Slip Joint Pliers from the sorted list and add it to the cart."
   */
  sortByPriceFlow: {
    id:          'PROMPT-4',
    title:       'Login → Sort Price Low to High → Slip Joint Pliers → Add to Cart',
    verified:    '2026-07-17',
    inStock:     true,
    note:        'Slip Joint Pliers ($9.17) appears on page 1 after sort asc — confirmed',

    locators: {
      sortDropdown:   '[data-test="sort"]',
      sortOption:     'price,asc',
      productHeading: { role: 'heading', name: 'Slip Joint Pliers', exact: true },
      productH1:      'h1[data-test="product-name"]',
      addToCart:      { role: 'button', name: /add to cart/i },
      cartQty:        '[data-test="cart-quantity"]',
    },

    steps: [
      'LOGIN (use shared LOGIN_STEPS block)',
      'await page.locator(\'[data-test="sort"]\').selectOption(\'price,asc\')',
      'await page.waitForLoadState(\'networkidle\')',
      'await page.getByRole(\'heading\', { name: \'Slip Joint Pliers\', exact: true }).first().click()',
      'await expect(page.locator(\'h1[data-test="product-name"]\')).toContainText(\'Slip Joint Pliers\')',
      'await page.getByRole(\'button\', { name: /add to cart/i }).click()',
      'await expect(page.locator(\'[data-test="cart-quantity"]\')).not.toHaveText(\'0\')',
    ],
  },

} as const;

// ─────────────────────────────────────────────────────────────────────────────
// CRITICAL ANTI-PATTERNS (do NOT use these — they have caused repeated failures)
// ─────────────────────────────────────────────────────────────────────────────
export const ANTI_PATTERNS = {
  emailField: [
    'page.getByTestId("email")',          // ❌ does NOT exist on this site
    'page.locator("input[type=email]")',  // ❌ fragile, not used
  ],
  productSelection: [
    'page.getByTestId("product-name").filter({ hasText: /name/i })',  // ❌ anchored regex never matches full card text
    'page.locator("a").filter({ hasText: "Claw Hammer" })',           // ❌ card text includes CO2 + price — never exact match
  ],
  loginPage: [
    // ❌ Missing waitForLoadState after sign-in click causes 30s timeout on email fill
    // ❌ Missing second page.goto after login — admin lands on /dashboard not store
  ],
};
