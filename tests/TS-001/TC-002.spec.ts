import { test, expect } from '@playwright/test';
import { testData } from '../test-data';

test('TC-002 | Login → Sort Price Low to High → Slip Joint Pliers → Add to Cart', async ({ page }) => {

  // ── Tracing ──────────────────────────────────────────────────────────────
  await page.context().tracing.start({ screenshots: false, snapshots: true, sources: true });

  // ── LOGIN ────────────────────────────────────────────────────────────────
  await page.goto(testData.baseUrl);
  await page.getByRole('link', { name: /sign in/i }).click();
  await page.waitForLoadState('networkidle');
  await page.getByLabel(/email/i).fill(testData.signIn.email);
  await page.locator('[data-test="password"]').fill(testData.signIn.password);
  await page.locator('[data-test="login-submit"]').click();
  await page.goto(testData.baseUrl, { waitUntil: 'networkidle' });
  await expect(page.locator('[data-test="nav-categories"]')).toBeVisible();

  // ── SORT BY PRICE LOW TO HIGH ────────────────────────────────────────────
  await page.locator('[data-test="sort"]').selectOption('price,asc');
  await page.waitForLoadState('networkidle');

  // ── OPEN SLIP JOINT PLIERS ───────────────────────────────────────────────
  await page.getByRole('heading', { name: 'Slip Joint Pliers', exact: true }).first().click();
  await expect(page.locator('h1[data-test="product-name"]')).toContainText('Slip Joint Pliers');

  // ── ADD TO CART ──────────────────────────────────────────────────────────
  await page.getByRole('button', { name: /add to cart/i }).click();
  await expect(page.locator('[data-test="cart-quantity"]')).not.toHaveText('0');

  // ── STOP TRACE ───────────────────────────────────────────────────────────
  await page.context().tracing.stop({ path: 'test-results/trace-TS001-TC002.zip' });
});
