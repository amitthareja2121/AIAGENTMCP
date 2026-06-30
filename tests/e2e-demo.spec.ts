import { test, expect, Page } from '@playwright/test';

test.describe('E2E Demo: Login and Add Combination Pliers to Cart', () => {
  let page: Page;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
  });

  test.afterEach(async () => {
    await page?.close();
  });

  test('User logs in, navigates home, finds Combination Pliers, and adds to cart', async () => {
    const BASE_URL = 'https://practicesoftwaretesting.com';
    const LOGIN_EMAIL = 'admin@practicesoftwaretesting.com';
    const LOGIN_PASSWORD = 'welcome01';

    // Step 1: Navigate to the login page
    await page.goto(`${BASE_URL}/auth/login`, { waitUntil: 'networkidle' });
    console.log('✓ Navigated to login page');

    // Step 2: Enter credentials and login
    await page.fill('input[name="email"]', LOGIN_EMAIL);
    await page.fill('input[name="password"]', LOGIN_PASSWORD);
    console.log('✓ Credentials entered');

    // Step 3: Click login button and wait for navigation
    await page.click('button[type="submit"]');
    await page.waitForURL(`${BASE_URL}/**`, { waitUntil: 'networkidle' });
    console.log('✓ Successfully logged in');

    // Step 4: Click Home navigation link
    const homeLink = page.locator('a:has-text("Home")').first();
    await homeLink.click();
    await page.waitForURL(`${BASE_URL}`, { waitUntil: 'networkidle' });
    console.log('✓ Clicked Home link and navigated');

    // Step 5: Scroll down to find Combination Pliers
    await page.evaluate(() => {
      window.scrollBy(0, window.innerHeight);
    });
    await page.waitForTimeout(500); // Wait for scroll animation
    console.log('✓ Scrolled down to view products');

    // Step 6: Find and click Combination Pliers product
    const plierLink = page.locator('a:has-text("Combination Pliers")').first();
    await plierLink.scrollIntoViewIfNeeded();
    await plierLink.click();
    await page.waitForURL('**/product/*', { waitUntil: 'networkidle' });
    console.log('✓ Clicked on Combination Pliers product');

    // Step 7: Add to cart
    const addToCartButton = page.locator('button:has-text("Add to cart")').first();
    await addToCartButton.scrollIntoViewIfNeeded();
    await addToCartButton.click();
    await page.waitForTimeout(1000); // Wait for notification to appear
    console.log('✓ Clicked Add to Cart button');

    // Step 8: Assert success notification appears
    const successNotification = page.locator('.swal2-success, [role="alert"]:has-text("Success"), .alert-success');
    const notificationVisible = await successNotification.first().isVisible({ timeout: 5000 }).catch(() => false);
    
    if (notificationVisible) {
      console.log('✓ Success notification confirmed');
      expect(notificationVisible).toBe(true);
    } else {
      // Fallback: Check for product in cart page
      const cartLink = page.locator('a[href*="/cart"]').first();
      await cartLink.click();
      await page.waitForURL('**/cart', { waitUntil: 'networkidle' });
      const plierInCart = page.locator('text=Combination Pliers');
      await expect(plierInCart).toBeVisible({ timeout: 5000 });
      console.log('✓ Product confirmed in cart');
    }

    console.log('✅ E2E Test Passed: Combination Pliers successfully added to cart!');
  });
});
