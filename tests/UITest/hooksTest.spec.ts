import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('https://www.saucedemo.com/');
  await page.locator('#user-name').fill('standard_user');
  await page.locator('#password').fill('secret_sauce');
  await page.locator('#login-button').click();
  await expect(page.locator('.title')).toHaveText('Products');
});

test.afterEach(async ({ page }) => {
  await page.locator('#react-burger-menu-btn').click();
  await page.locator('#logout_sidebar_link').click();
});

test('Add Items and Check out test', async ({ page }) => {
  await page.locator('#add-to-cart-sauce-labs-backpack').click();
  await page.locator('.shopping_cart_link').click();
  await page.locator('#checkout').click();
  await expect(page).toHaveURL(/checkout-step-one/);
});

test('Add Items and remove from Cart test', async ({ page }) => {
  await page.locator('#add-to-cart-sauce-labs-backpack').click();
  await page.locator('.shopping_cart_link').click();
  await page.locator('#remove-sauce-labs-backpack').click();
  await expect(page.locator('.cart_item')).toHaveCount(0);
});
