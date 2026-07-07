import { test, expect } from '@playwright/test';

const RUN_ID = '807';
const TARGET_URL = 'https://practicesoftwaretesting.com';

test('e2e-807: login, navigate home, add Combination Pliers to cart', async ({ page }, testInfo) => {
  test.setTimeout(90_000);

  // Start an execution trace saved to the workspace.
  await page.context().tracing.start({ screenshots: true, snapshots: true, sources: true });

  try {
    // Open the store front.
    await page.goto(TARGET_URL, { waitUntil: 'domcontentloaded' });

    // Log in as the admin user.
    await page.getByRole('link', { name: /sign in/i }).click();
    await page.getByLabel(/email/i).fill('admin@practicesoftwaretesting.com');
    await page.locator('[data-test="password"]').fill('welcome01');
    await page.locator('[data-test="login-submit"]').click();
    await expect(page.locator('body')).toContainText('John Doe', { timeout: 15_000 });

    // Explicitly click the Home navigation link and wait for URL resolution.
    await page.getByRole('link', { name: /^home$/i }).click();
    await expect(page).toHaveURL(/https:\/\/practicesoftwaretesting\.com\/?$/, { timeout: 15_000 });

    // Scroll down and open the Combination Pliers product.
    await page.mouse.wheel(0, 3000);
    const productLink = page.locator('a').filter({ hasText: 'Combination Pliers' }).first();
    await expect(productLink).toBeVisible({ timeout: 15_000 });
    await productLink.click();

    // Add to cart and assert the success notification.
    await expect(page.getByRole('heading', { name: /combination pliers/i })).toBeVisible({ timeout: 15_000 });
    await page.getByRole('button', { name: /add to cart/i }).click();

    // The success toast reads "Product added to shopping cart" and auto-dismisses,
    // so assert on the resilient, persistent cart quantity badge instead.
    const cartBadge = page.getByRole('link', { name: /cart/i });
    await expect(cartBadge).toContainText('1', { timeout: 15_000 });

    // Capture a full-page screenshot immediately after the successful assertion.
    await page.screenshot({ path: `cart_success-${RUN_ID}.png`, fullPage: true });
  } finally {
    // Persist the execution trace file into the workspace.
    await page.context().tracing.stop({ path: `trace-${RUN_ID}.zip` });
  }
});
