import { test, expect } from '@playwright/test';

test('Login -> Categories Nav -> Rentals -> Power Tools -> Contact Form - Run 779', async ({ page }) => {
  test.setTimeout(120_000);
  const targetUrl = 'https://practicesoftwaretesting.com';

  await page.goto(targetUrl, { waitUntil: 'domcontentloaded' });

  await page.getByRole('link', { name: /sign in/i }).click();
  await page.getByLabel(/email/i).fill('admin@practicesoftwaretesting.com');
  await page.locator('[data-test="password"]').fill('welcome01');
  await page.locator('[data-test="login-submit"]').click();

  await page.waitForLoadState('networkidle');
  await expect(page.locator('body')).toContainText('John Doe', { timeout: 15000 });

  await page.locator('[data-test="nav-categories"]').click();
  await expect(page.locator('[data-test="nav-rentals"]')).toBeVisible({ timeout: 10000 });
  await page.locator('[data-test="nav-rentals"]').click();
  await page.waitForLoadState('networkidle');
  await expect(page).toHaveURL(/rentals/i, { timeout: 15000 });

  await page.locator('[data-test="nav-categories"]').click();
  await expect(page.locator('[data-test="nav-power-tools"]')).toBeVisible({ timeout: 10000 });
  await page.locator('[data-test="nav-power-tools"]').click();
  await page.waitForLoadState('networkidle');
  await expect(page).toHaveURL(/power-tools/i, { timeout: 15000 });

  await page.locator('[data-test="nav-contact"]').click();
  await expect(page).toHaveURL(/\/contact/, { timeout: 15000 });
  await expect(page.getByRole('heading', { name: /contact/i })).toBeVisible({ timeout: 15000 });

  await page.locator('[data-test="first-name"]').fill('Demo');
  await page.locator('[data-test="last-name"]').fill('User');
  await page.locator('[data-test="email"]').fill('demo.user@toolshop-test.com');
  await page.locator('[data-test="subject"]').selectOption({ label: 'Customer service' });
  await page.locator('[data-test="message"]').fill('Demo contact form submission. Automated test run 779. Navigated via Categories dropdown through Rentals and Power Tools sections.');

  await page.locator('[data-test="contact-submit"]').click();
  await expect(page.locator('body')).toContainText(/thanks for your message|message has been sent|we will get back to you/i, { timeout: 15000 });

  await page.context().tracing.start({ screenshots: false, snapshots: true, sources: true });
  await page.context().tracing.stop({ path: 'test-results/trace-779.zip' });
});
