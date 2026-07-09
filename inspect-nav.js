const { chromium } = require('@playwright/test');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto('https://practicesoftwaretesting.com', { waitUntil: 'domcontentloaded' });
  await page.waitForLoadState('networkidle');
  // Get all nav links and buttons
  const items = await page.locator('nav a, nav button').allInnerTexts();
  console.log('NAV ITEMS:', JSON.stringify(items, null, 2));
  // Also get data-test attributes
  const dataTests = await page.locator('nav [data-test]').evaluateAll(els => els.map(e => ({ tag: e.tagName, dt: e.getAttribute('data-test'), text: e.innerText.trim() })));
  console.log('DATA-TEST:', JSON.stringify(dataTests, null, 2));
  await browser.close();
})();
