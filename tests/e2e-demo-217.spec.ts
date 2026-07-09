import { test, expect } from '@playwright/test';

test('Login -> Power Tools -> Cordless Drill 12V -> Add to Cart -> Checkout - Run 217', async ({ page }) => {
  test.setTimeout(180_000);

  // Step 1: Navigate and login
  await page.goto('https://practicesoftwaretesting.com', { waitUntil: 'domcontentloaded' });
  await page.locator('[data-test="nav-sign-in"]').click();
  await page.getByLabel(/email/i).fill('admin@practicesoftwaretesting.com');
  await page.locator('[data-test="password"]').fill('welcome01');
  await page.locator('[data-test="login-submit"]').click();
  await page.waitForLoadState('networkidle');
  await expect(page.locator('body')).toContainText('John Doe', { timeout: 15000 });

  // Step 2: Categories nav -> Power Tools
  await page.locator('[data-test="nav-categories"]').click();
  await expect(page.locator('[data-test="nav-power-tools"]')).toBeVisible({ timeout: 10000 });
  await page.locator('[data-test="nav-power-tools"]').click();
  await page.waitForLoadState('networkidle');
  await expect(page).toHaveURL(/power-tools/i, { timeout: 15000 });

  // Step 3: Select Cordless Drill 12V
  const drill = page.locator('a').filter({ hasText: /cordless drill 12v/i }).first();
  await expect(drill).toBeVisible({ timeout: 15000 });
  await drill.click();
  await expect(page.getByRole('heading', { name: /cordless drill 12v/i })).toBeVisible({ timeout: 15000 });

  // Step 4: Add to cart and assert badge
  await page.getByRole('button', { name: /add to cart/i }).click();
  await expect(page.locator('[data-test="cart-quantity"]')).not.toHaveText('0', { timeout: 10000 });

  // Step 5: Go to checkout via cart nav
  await page.locator('[data-test="nav-cart"]').click();
  await expect(page).toHaveURL(/cart|checkout/i, { timeout: 15000 });

  // Step 6: Cart review -> proceed
  await page.locator('[data-test="proceed-1"]').click();

  // Step 7: Login step - already logged in, proceed
  await page.locator('[data-test="proceed-2"]').click();

  // Step 8: Billing address (sprint5 - auto-filled from admin profile then complete missing fields)
  await page.waitForLoadState('networkidle');
  await expect(page.locator('[data-test="street"]')).toBeVisible({ timeout: 15000 });
  await page.locator('[data-test="street"]').fill('Test street 123');
  await page.locator('[data-test="city"]').fill('Utrecht');
  await page.locator('[data-test="state"]').fill('Utrecht');
  await page.locator('[data-test="country"]').selectOption({ value: 'NL' });
  await page.locator('[data-test="postal_code"]').fill('3511AA');
  const houseNum = page.locator('[data-test="house_number"]');
  if (await houseNum.isVisible({ timeout: 3000 }).catch(() => false)) {
    await houseNum.fill('123');
  }

  // Step 9: Proceed to payment
  await page.locator('[data-test="proceed-3"]').click();

  // Step 10: Select Bank Transfer payment
  await page.waitForLoadState('networkidle');
  await page.locator('[data-test="payment-method"]').selectOption({ value: 'bank-transfer' });

  // Step 11: Fill bank transfer details (sprint5 uses underscores)
  await expect(page.locator('[data-test="bank_name"]')).toBeVisible({ timeout: 10000 });
  await page.locator('[data-test="bank_name"]').fill('ING Bank');
  await page.locator('[data-test="account_name"]').fill('John Doe');
  await page.locator('[data-test="account_number"]').fill('123456789');

  // Step 12: Confirm order
  await page.locator('[data-test="finish"]').click();

  // Step 13: Assert order confirmation
  await expect(page.locator('#order-confirmation')).toBeVisible({ timeout: 20000 });

  // Trace
  await page.context().tracing.start({ screenshots: false, snapshots: true, sources: true });
  await page.context().tracing.stop({ path: 'test-results/trace-217.zip' });
});
