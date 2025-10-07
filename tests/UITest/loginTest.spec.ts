import { expect, test } from '../fixtures/baseTest';

interface OrangeCredentials {
  validUsername: string;
  validPassword: string;
}

test('Login Test for Orange HRM', async ({ page, environment, testDataManager, storageManager }, testInfo) => {
  const credentials = testDataManager.readJSON<OrangeCredentials>('tests/testData/orangeHRMCredentials.json');

  await page.goto('/');
  await page.locator('input[placeholder="Username"]').fill(credentials.validUsername);
  await page.locator('input[placeholder="Password"]').fill(credentials.validPassword);
  await page.locator('button[type="submit"]').click();

  await expect(page.locator('.oxd-userdropdown-tab')).toBeVisible();

  // Capture the authenticated session so other tests can re-use it without logging in again.
  await storageManager.saveFromPage('orange-admin', page);

  await page.locator('.oxd-userdropdown-tab').click();
  await page.locator('text=Logout').click();

  await expect(page).toHaveURL(/auth\/login$/);

  testInfo.annotations.push({ type: 'environment', description: environment.name });
});
