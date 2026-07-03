import { test, expect } from '@playwright/test';

test('demo login and cart flow', async ({ page }) => {
  test.setTimeout(90_000);
  const targetUrl = 'https://practicesoftwaretesting.com';

  await page.goto(targetUrl, { waitUntil: 'domcontentloaded' });
  await page.getByRole('link', { name: /sign in/i }).click();

  await page.getByLabel(/email/i).fill('admin@practicesoftwaretesting.com');
  await page.locator('[data-test="password"]').fill('welcome01');
  await page.locator('[data-test="login-submit"]').click();

  await page.waitForLoadState('networkidle');
  await expect(page.locator('body')).toContainText('John Doe', { timeout: 15000 });

  await page.getByRole('link', { name: /^home$/i }).click();
  await expect(page).toHaveURL(/https:\/\/practicesoftwaretesting\.com\/?/, { timeout: 15000 });

  await page.mouse.wheel(0, 3000);
  const productLink = page.locator('a').filter({ hasText: 'Combination Pliers' }).first();
  await expect(productLink).toBeVisible({ timeout: 15000 });
  await productLink.click();

  await expect(page.getByRole('heading', { name: /combination pliers/i })).toBeVisible({ timeout: 15000 });
  await page.getByRole('button', { name: /add to cart/i }).click();
  await expect(page.getByText(/product added to cart/i)).toBeVisible({ timeout: 15000 });
});
