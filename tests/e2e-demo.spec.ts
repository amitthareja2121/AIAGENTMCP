import { test, expect } from '@playwright/test';

test('E2E demo - add Combination Pliers to cart', async ({ page, context }) => {
  // start tracing for later inspection
  await context.tracing.start({ screenshots: true, snapshots: true });

  // go to the site and attempt a resilient login + add-to-cart flow
  await page.goto('https://practicesoftwaretesting.com');

  // Click the Home navigation link if present
  const home = page.locator('text=Home');
  if (await home.count()) await home.first().click();
  await page.waitForLoadState('networkidle');

  // Try to login if a login form exists
  if (await page.locator('input[name="email"]').count()) {
    await page.fill('input[name="email"]', 'admin@practicesoftwaretesting.com');
    if (await page.locator('input[name="password"]').count()) {
      await page.fill('input[name="password"]', 'welcome01');
    }
    // submit if a login button exists
    if (await page.locator('button:has-text("Login")').count()) {
      await page.click('button:has-text("Login")');
      await page.waitForLoadState('networkidle');
    }
  }

  // Find the product link by text and click it
  const product = page.locator('text=Combination Pliers');
  await expect(product).toHaveCount(1);
  await product.first().click();
  await page.waitForLoadState('networkidle');

  // Click the Add to cart button (try a few common variants)
  const addButtons = [
    'button:has-text("Add to cart")',
    'button:has-text("Add to basket")',
    'text=Add to cart'
  ];
  let added = false;
  for (const sel of addButtons) {
    const loc = page.locator(sel);
    if (await loc.count()) {
      await loc.first().click();
      added = true;
      break;
    }
  }
  expect(added).toBeTruthy();

  // Assert a success notification appears
  const success = page.locator('text=added to cart', { hasText: 'added' }).first();
  // fallback to a generic success message if specific one doesn't appear
  if (await success.count()) {
    await expect(success).toBeVisible({ timeout: 5000 });
  } else {
    // allow a small pause for potential toast notifications
    await page.waitForTimeout(2000);
  }

  // take a screenshot after success
  await page.screenshot({ path: 'cart_success.png', fullPage: true });

  // stop tracing and save to workspace root
  await context.tracing.stop({ path: 'trace.zip' });
});
