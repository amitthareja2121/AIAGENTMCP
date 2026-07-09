import { test, expect } from '@playwright/test';
import { testData } from './test-data';

test('Login -> Hand Tools -> Measuring Tape -> Add to Cart -> Checkout - Run 632', async ({ page }) => {
  test.setTimeout(180_000);

  // Step 1: Navigate to site (URL from test-data.ts)
  await page.goto(testData.baseUrl, { waitUntil: 'domcontentloaded' });

  // Step 2: Login (credentials from test-data.ts)
  await page.getByRole('link', { name: /sign in/i }).click();
  await page.getByLabel(/email/i).fill(testData.signIn.email);
  await page.locator('[data-test="password"]').fill(testData.signIn.password);
  await page.locator('[data-test="login-submit"]').click();
  await page.waitForLoadState('networkidle');
  await expect(page.locator('body')).toContainText(testData.expectedUser, { timeout: 15000 });

  // Step 3: Open Categories dropdown and select Hand Tools
  await page.locator('[data-test="nav-categories"]').click();
  await expect(page.locator('[data-test="nav-hand-tools"]')).toBeVisible({ timeout: 10000 });
  await page.locator('[data-test="nav-hand-tools"]').click();
  await page.waitForLoadState('networkidle');
  await expect(page).toHaveURL(/hand-tools/i, { timeout: 15000 });

  // Step 4: Select Measures subcategory from the sidebar filter (label-based, resilient to ID changes)
  const measuresFilter = page.getByLabel(/measures/i).first();
  await expect(measuresFilter).toBeVisible({ timeout: 10000 });
  await measuresFilter.click();
  await page.waitForLoadState('networkidle');

  // Step 5: Find and click Measuring Tape product card
  const measuringTape = page.locator('a').filter({ hasText: /measuring tape/i }).first();
  await expect(measuringTape).toBeVisible({ timeout: 15000 });
  await measuringTape.click();

  // Step 6: Assert product detail page and add to cart
  await expect(page.getByRole('heading', { name: /measuring tape/i })).toBeVisible({ timeout: 15000 });
  await page.getByRole('button', { name: /add to cart/i }).click();
  await expect(page.locator('[data-test="cart-quantity"]')).not.toHaveText('0', { timeout: 10000 });

  // Step 7: Go to checkout
  await page.locator('[data-test="nav-cart"]').click();
  await expect(page).toHaveURL(/cart|checkout/i, { timeout: 15000 });

  // Step 8: Cart review -> proceed
  await page.locator('[data-test="proceed-1"]').click();

  // Step 9: Login step (already logged in) -> proceed
  await page.locator('[data-test="proceed-2"]').click();

  // Step 10: Billing address (from test-data.ts)
  await page.waitForLoadState('networkidle');
  await expect(page.locator('[data-test="street"]')).toBeVisible({ timeout: 15000 });
  await page.locator('[data-test="street"]').fill(testData.billing.street);
  await page.locator('[data-test="city"]').fill(testData.billing.city);
  await page.locator('[data-test="state"]').fill(testData.billing.state);
  await page.locator('[data-test="country"]').selectOption({ value: testData.billing.country });
  await page.locator('[data-test="postal_code"]').fill(testData.billing.postalCode);
  const houseNum = page.locator('[data-test="house_number"]');
  if (await houseNum.isVisible({ timeout: 3000 }).catch(() => false)) {
    await houseNum.fill(testData.billing.houseNumber);
  }

  // Step 11: Proceed to payment
  await page.locator('[data-test="proceed-3"]').click();

  // Step 12: Select payment method (from test-data.ts)
  await page.waitForLoadState('networkidle');
  await page.locator('[data-test="payment-method"]').selectOption({ value: testData.payment.method });

  // Step 13: Fill bank transfer details (from test-data.ts)
  await expect(page.locator('[data-test="bank_name"]')).toBeVisible({ timeout: 10000 });
  await page.locator('[data-test="bank_name"]').fill(testData.payment.bankName);
  await page.locator('[data-test="account_name"]').fill(testData.payment.accountName);
  await page.locator('[data-test="account_number"]').fill(testData.payment.accountNumber);

  // Step 14: Confirm order
  await page.locator('[data-test="finish"]').click();

  // Step 15: Assert order confirmation
  await expect(page.locator('body')).toContainText(
    /payment was successful|order.*confirmed|thank you|invoice/i,
    { timeout: 20000 }
  );

  // Trace capture
  await page.context().tracing.start({ screenshots: false, snapshots: true, sources: true });
  await page.context().tracing.stop({ path: 'test-results/trace-632.zip' });
});
