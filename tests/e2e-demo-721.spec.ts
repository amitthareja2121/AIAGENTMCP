import { test, expect } from '@playwright/test';

test('Login → Hand Tools → Combination Pliers → Contact Form - Run 721', async ({ page }) => {
  test.setTimeout(120_000);
  const targetUrl = 'https://practicesoftwaretesting.com';

  // ── Step 1: Navigate to site ──────────────────────────────────────────────
  await page.goto(targetUrl, { waitUntil: 'domcontentloaded' });

  // ── Step 2: Login ─────────────────────────────────────────────────────────
  await page.getByRole('link', { name: /sign in/i }).click();
  await page.getByLabel(/email/i).fill('admin@practicesoftwaretesting.com');
  await page.locator('[data-test="password"]').fill('welcome01');
  await page.locator('[data-test="login-submit"]').click();

  // ── Step 3: Confirm logged-in user ────────────────────────────────────────
  await page.waitForLoadState('networkidle');
  await expect(page.locator('body')).toContainText('John Doe', { timeout: 15000 });

  // ── Step 4: Go to Home and filter by Hand Tools category ──────────────────
  await page.getByRole('link', { name: /^home$/i }).click();
  await page.waitForLoadState('networkidle');

  const handToolsFilter = page.getByLabel(/hand tools/i);
  await expect(handToolsFilter).toBeVisible({ timeout: 15000 });
  await handToolsFilter.click();
  await page.waitForLoadState('networkidle');

  // ── Step 5: Click on Combination Pliers ───────────────────────────────────
  const combinationPliers = page.locator('a').filter({ hasText: /combination pliers/i }).first();
  await expect(combinationPliers).toBeVisible({ timeout: 15000 });
  await combinationPliers.click();

  // ── Step 6: Assert product detail page loaded ─────────────────────────────
  await expect(page.getByRole('heading', { name: /combination pliers/i })).toBeVisible({ timeout: 15000 });

  // ── Step 7: Navigate to Contact page ─────────────────────────────────────
  await page.getByRole('link', { name: /contact/i }).click();
  await expect(page).toHaveURL(/\/contact/, { timeout: 15000 });
  await expect(page.getByRole('heading', { name: /contact/i })).toBeVisible({ timeout: 15000 });

  // ── Step 8: Fill in contact form ──────────────────────────────────────────
  await page.locator('[data-test="first-name"]').fill('John');
  await page.locator('[data-test="last-name"]').fill('Doe');
  await page.locator('[data-test="email"]').fill('john.doe@toolshop-demo.com');

  // Subject is a dropdown — select "Customer service"
  await page.locator('[data-test="subject"]').selectOption({ label: 'Customer service' });

  await page.locator('[data-test="message"]').fill(
    'This is an automated test message submitted via Playwright. Run ID: 721. Testing the contact form as part of the AI Automation Accelerator demo.'
  );

  // ── Step 9: Submit the form ───────────────────────────────────────────────
  await page.locator('[data-test="contact-submit"]').click();

  // ── Step 10: Assert success confirmation ──────────────────────────────────
  await expect(page.locator('body')).toContainText(
    /thanks for your message|message has been sent|we will get back to you/i,
    { timeout: 15000 }
  );

  // ── Trace capture ─────────────────────────────────────────────────────────
  await page.context().tracing.start({ screenshots: false, snapshots: true, sources: true });
  await page.context().tracing.stop({ path: 'test-results/trace-721.zip' });
});
