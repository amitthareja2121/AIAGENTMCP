import { test, expect } from '@playwright/test';
import { testData } from './test-data';

test('Login -> Categories Nav -> Power Tools -> Circular Saw -> Add to Cart - Run 354', async ({ page }) => {
  test.setTimeout(90_000);

  // Step 1: Navigate and login (credentials from test-data.ts)
  await page.goto(testData.baseUrl, { waitUntil: 'domcontentloaded' });
  await page.locator('[data-test="nav-sign-in"]').click();
  await page.getByLabel(/email/i).fill(testData.signIn.email);
  await page.locator('[data-test="password"]').fill(testData.signIn.password);
  await page.locator('[data-test="login-submit"]').click();
  await page.waitForLoadState('networkidle');
  await expect(page.locator('body')).toContainText(testData.expectedUser, { timeout: 15000 });

  // Step 2: Open Categories dropdown -> Power Tools
  await page.locator('[data-test="nav-categories"]').click();
  await expect(page.locator('[data-test="nav-power-tools"]')).toBeVisible({ timeout: 10000 });
  await page.locator('[data-test="nav-power-tools"]').click();
  await page.waitForLoadState('networkidle');
  await expect(page).toHaveURL(/power-tools/i, { timeout: 15000 });

  // Step 3: Select Circular Saw product
  const circularSaw = page.locator('a').filter({ hasText: /circular saw/i }).first();
  await expect(circularSaw).toBeVisible({ timeout: 15000 });
  await circularSaw.click();
  await expect(page.getByRole('heading', { name: /circular saw/i })).toBeVisible({ timeout: 15000 });

  // Step 4: Add to cart
  await page.getByRole('button', { name: /add to cart/i }).click();

  // Step 5: Assert cart badge incremented (toast auto-dismisses)
  await expect(page.locator('[data-test="cart-quantity"]')).not.toHaveText('0', { timeout: 10000 });

  // Trace capture
  await page.context().tracing.start({ screenshots: false, snapshots: true, sources: true });
  await page.context().tracing.stop({ path: 'test-results/trace-354.zip' });
});
