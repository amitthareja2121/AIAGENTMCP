import { test, expect } from '@playwright/test';

test('demo login and cart flow', async ({ page }) => {
  const targetUrl = 'https://practicesoftwaretesting.com';

  await page.goto(targetUrl, { waitUntil: 'domcontentloaded' });
  await page.getByRole('link', { name: /sign in/i }).click();

  await page.getByLabel(/email/i).fill('admin@practicesoftwaretesting.com');
  await page.locator('[data-test="password"]').fill('welcome01');
  await page.locator('[data-test="login-submit"]').click();

  await expect(page.getByRole('button', { name: /john doe/i })).toBeVisible({ timeout: 10000 });

  await page.getByRole('link', { name: /^home$/i }).click();
  await page.waitForURL(/https:\/\/practicesoftwaretesting\.com\/?/);

  await page.mouse.wheel(0, 3000);
  await page.getByRole('link', { name: /combination pliers/i }).first().click();

  await page.getByRole('button', { name: /add to cart/i }).click();
  await expect(page.getByText(/product added to cart/i)).toBeVisible({ timeout: 10000 });
});
