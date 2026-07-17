import { test, expect } from '@playwright/test';
import { testData } from '../test-data';

test('TC-001 | Login → Hand Tools → Claw Hammer → Add to Cart', async ({ page }) => {

  // ── Tracing ──────────────────────────────────────────────────────────────
  await page.context().tracing.start({ screenshots: false, snapshots: true, sources: true });

  // ── 1. Navigate & Login ──────────────────────────────────────────────────
  await page.goto(testData.baseUrl);
  await page.getByRole('link', { name: /sign in/i }).click();
  await page.waitForLoadState('networkidle');
  await page.getByLabel(/email/i).fill(testData.signIn.email);
  await page.locator('[data-test="password"]').fill(testData.signIn.password);
  await page.locator('[data-test="login-submit"]').click();

  // Admin lands on /dashboard — go back to store
  await page.goto(testData.baseUrl, { waitUntil: 'networkidle' });
  await expect(page.locator('[data-test="nav-categories"]')).toBeVisible();

  // ── 2. Categories → Hand Tools ───────────────────────────────────────────
  await page.locator('[data-test="nav-categories"]').click();
  await page.locator('[data-test="nav-hand-tools"]').click();
  await page.waitForLoadState('networkidle');
  await expect(page).toHaveURL(/hand-tools/);

  // ── 3. Open Claw Hammer ──────────────────────────────────────────────────
  await page.getByRole('heading', { name: 'Claw Hammer', exact: true }).first().click();
  await expect(page.locator('h1[data-test="product-name"]')).toContainText('Claw Hammer');

  // ── 4. Add to Cart ───────────────────────────────────────────────────────
  await page.getByRole('button', { name: /add to cart/i }).click();
  await expect(page.locator('[data-test="cart-quantity"]')).not.toHaveText('0');

  // ── Stop Trace ───────────────────────────────────────────────────────────
  await page.context().tracing.stop({ path: 'test-results/trace-TS001-TC001.zip' });
});
