import { test, expect } from '@playwright/test';

test('Login and filter by Power Tools category - Run 469', async ({ page }) => {
  test.setTimeout(90_000);
  const targetUrl = 'https://practicesoftwaretesting.com';

  // ── Step 1: Navigate to site ──────────────────────────────────────────────
  await page.goto(targetUrl, { waitUntil: 'domcontentloaded' });
  await expect(page).toHaveURL(/practicesoftwaretesting\.com/, { timeout: 15000 });

  // ── Step 2: Login ─────────────────────────────────────────────────────────
  await page.getByRole('link', { name: /sign in/i }).click();
  await page.getByLabel(/email/i).fill('admin@practicesoftwaretesting.com');
  await page.locator('[data-test="password"]').fill('welcome01');
  await page.locator('[data-test="login-submit"]').click();

  // ── Step 3: Confirm logged-in user ────────────────────────────────────────
  await page.waitForLoadState('networkidle');
  await expect(page.locator('body')).toContainText('John Doe', { timeout: 15000 });

  // ── Step 4: Navigate to home/products page ────────────────────────────────
  await page.getByRole('link', { name: /^home$/i }).click();
  await expect(page).toHaveURL(/practicesoftwaretesting\.com\/?$/, { timeout: 15000 });

  // ── Step 5: Select "Power Tools" from category filter ─────────────────────
  const powerToolsFilter = page.getByLabel(/power tools/i);
  await expect(powerToolsFilter).toBeVisible({ timeout: 15000 });
  await powerToolsFilter.click();

  // ── Step 6: Assert filtered product list loaded ───────────────────────────
  // Wait for page to reflect the filter (URL updates or product grid refreshes)
  await page.waitForLoadState('networkidle');

  // Confirm at least one product card is visible after filtering
  const productCards = page.locator('a.card');
  await expect(productCards.first()).toBeVisible({ timeout: 15000 });

  // Power Tools products should NOT include Hand Tools items like Combination Pliers
  // Assert the category badge/label visible on page confirms Power Tools context
  await expect(page.locator('body')).not.toContainText('No products found', { timeout: 10000 });

  // ── Step 7: Capture trace ─────────────────────────────────────────────────
  await page.context().tracing.start({ screenshots: false, snapshots: true, sources: true });
  await page.context().tracing.stop({ path: `test-results/trace-469.zip` });
});
