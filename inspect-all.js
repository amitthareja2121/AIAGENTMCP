const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const results = {};

  // ── LOGIN ──────────────────────────────────────────────────────
  await page.goto('https://practicesoftwaretesting.com');
  await page.getByRole('link', { name: /sign in/i }).click();
  await page.waitForLoadState('networkidle');
  results.login = {
    emailLabel:  await page.getByLabel(/email/i).count(),
    pwField:     await page.locator('[data-test="password"]').count(),
    submitBtn:   await page.locator('[data-test="login-submit"]').count(),
  };
  await page.getByLabel(/email/i).fill('admin@practicesoftwaretesting.com');
  await page.locator('[data-test="password"]').fill('welcome01');
  await page.locator('[data-test="login-submit"]').click();
  await page.goto('https://practicesoftwaretesting.com', { waitUntil: 'networkidle' });
  results.login.navCategoriesVisible = await page.locator('[data-test="nav-categories"]').count();

  // ── PROMPT 1: Search → Combination Pliers ─────────────────────
  results.p1 = {
    searchInput:  await page.locator('[data-test="search-query"]').count(),
    searchSubmit: await page.locator('[data-test="search-submit"]').count(),
  };
  await page.locator('[data-test="search-query"]').fill('Pliers');
  await page.locator('[data-test="search-submit"]').click();
  await page.waitForLoadState('networkidle');
  results.p1.combinationPliersFound = await page.getByRole('heading', { name: 'Combination Pliers', exact: true }).count();
  await page.getByRole('heading', { name: 'Combination Pliers', exact: true }).first().click();
  await page.waitForLoadState('networkidle');
  results.p1.productH1 = await page.locator('h1[data-test="product-name"]').count();
  results.p1.addToCart  = await page.getByRole('button', { name: /add to cart/i }).count();
  results.p1.cartQty    = await page.locator('[data-test="cart-quantity"]').count();

  // ── PROMPT 2: Categories → Hand Tools → Claw Hammer ──────────
  await page.goto('https://practicesoftwaretesting.com', { waitUntil: 'networkidle' });
  await page.locator('[data-test="nav-categories"]').click();
  results.p2 = { handToolsLink: await page.locator('[data-test="nav-hand-tools"]').count() };
  await page.locator('[data-test="nav-hand-tools"]').click();
  await page.waitForLoadState('networkidle');
  results.p2.urlHasHandTools = page.url().includes('hand-tools');
  results.p2.clawHammerFound = await page.getByRole('heading', { name: 'Claw Hammer', exact: true }).count();
  await page.getByRole('heading', { name: 'Claw Hammer', exact: true }).first().click();
  await page.waitForLoadState('networkidle');
  results.p2.productH1 = await page.locator('h1[data-test="product-name"]').count();
  results.p2.addToCart  = await page.getByRole('button', { name: /add to cart/i }).count();

  // ── PROMPT 3: Sidebar Hammer filter → Thor Hammer ─────────────
  await page.goto('https://practicesoftwaretesting.com', { waitUntil: 'networkidle' });
  results.p3 = { hammerFilter: await page.getByLabel('Hammer').count() };
  await page.getByLabel('Hammer').click();
  await page.waitForLoadState('networkidle');
  results.p3.thorHammerFound = await page.getByRole('heading', { name: 'Thor Hammer', exact: true }).count();
  await page.getByRole('heading', { name: 'Thor Hammer', exact: true }).first().click();
  await page.waitForLoadState('networkidle');
  results.p3.productH1 = await page.locator('h1[data-test="product-name"]').count();
  results.p3.addToCart  = await page.getByRole('button', { name: /add to cart/i }).count();

  // ── PROMPT 4: Sort Price Low→High → Slip Joint Pliers ─────────
  await page.goto('https://practicesoftwaretesting.com', { waitUntil: 'networkidle' });
  results.p4 = { sortDropdown: await page.locator('[data-test="sort"]').count() };
  await page.locator('[data-test="sort"]').selectOption('price,asc');
  await page.waitForLoadState('networkidle');
  results.p4.slipJointFound = await page.getByRole('heading', { name: 'Slip Joint Pliers', exact: true }).count();
  await page.getByRole('heading', { name: 'Slip Joint Pliers', exact: true }).first().click();
  await page.waitForLoadState('networkidle');
  results.p4.productH1 = await page.locator('h1[data-test="product-name"]').count();
  results.p4.addToCart  = await page.getByRole('button', { name: /add to cart/i }).count();

  await browser.close();
  console.log(JSON.stringify(results, null, 2));
})().catch(e => { console.error(e.message); process.exit(1); });
