import { test, expect } from '@playwright/test';

test('Sauce Demo E2E', async ({ page }) => {
  await page.goto('https://www.saucedemo.com', { waitUntil: 'domcontentloaded' });
  await expect(page).toHaveURL('https://www.saucedemo.com/');

  await page.fill('[data-test="username"]', 'standard_user');
  await page.fill('[data-test="password"]', 'secret_sauce');
  await page.click('[data-test="login-button"]');

  await page.waitForURL('**/inventory.html', { timeout: 10000 });
  await expect(page.locator('.inventory_list')).toBeVisible();
  await expect(page.locator('.title')).toHaveText('Products');

  const addToCartButton = page.locator('[data-test="add-to-cart-sauce-labs-backpack"]');
  await addToCartButton.scrollIntoViewIfNeeded();
  await expect(addToCartButton).toBeVisible({ timeout: 5000 });
  await addToCartButton.click();

  await page.click('.shopping_cart_link');
  await page.waitForURL('**/cart.html', { timeout: 10000 });
  await expect(page.locator('.cart_list')).toBeVisible();

  await page.click('[data-test="checkout"]');
  await page.waitForURL('**/checkout-step-one.html', { timeout: 10000 });

  await page.fill('[data-test="firstName"]', 'Demo');
  await page.fill('[data-test="lastName"]', 'User');
  await page.fill('[data-test="postalCode"]', '12345');
  await page.click('[data-test="continue"]');

  await page.waitForURL('**/checkout-step-two.html', { timeout: 10000 });
  await page.click('[data-test="finish"]');

  await page.waitForURL('**/checkout-complete.html', { timeout: 10000 });
  await expect(page.locator('.complete-header')).toHaveText('Thank you for your order!');
});
