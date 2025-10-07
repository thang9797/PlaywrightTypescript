# Playwright Udemy Course

This is the repository created as part of Playwright Udemy Course

Udemy Course Link - https://www.udemy.com/course/master-playwright-docker-cucumber-jenkins/

Please enroll in this course to get the full knowledge about this repository

## 🧱 Framework Enhancements

- **Environment aware configuration** – declare reusable environment metadata in `config/environments.json` and switch between them by setting the `TEST_ENV` environment variable before running Playwright. The selected environment is surfaced in the Playwright HTML report metadata.
- **Reusable test fixtures** – consume the shared fixtures (environment, test data, storage manager, API client) by importing `test`/`expect` from `tests/fixtures/baseTest`. This keeps tests thin and promotes consistent data access patterns.
- **Centralised test data loading** – leverage `TestDataManager` (`framework/utils/testDataManager.ts`) to cache and serve JSON/CSV assets during a run, avoiding repetitive file IO and parsing logic in every test.
- **Storage state utilities** – `StorageManager` (`framework/utils/storageManager.ts`) standardises where storage states are kept, offering helpers to persist, fetch, list or clear the JSON snapshots that Playwright creates after authentication.
- **API client helpers** – `ApiClient` (`framework/utils/apiClient.ts`) builds on Playwright's `request` fixture to provide typed convenience wrappers for JSON CRUD operations with consistent error handling.
- **API keyword utilities** – `ApiKeywords` (`framework/utils/apiKeywords.ts`) offer reusable helpers to send requests, capture response bodies (including XML to JSON conversion), and assert headers or status codes with a single call.

```bash
# Example: execute login test against the QA configuration
TEST_ENV=qa npx playwright test tests/UITest/loginTest.spec.ts
```

### Working with storage state

```ts
import { test } from '../fixtures/baseTest';

test('reuse authentication', async ({ page, storageManager }) => {
  await page.goto('/');
  // ...perform login once
  const statePath = await storageManager.saveFromPage('orange-admin', page);

  // Later in another test file:
  test.use({ storageState: statePath });
});
```

### Calling backend APIs

```ts
import { test, expect } from '../fixtures/baseTest';

test('verify backend health', async ({ apiClient }) => {
  const status = await apiClient.get<{ status: string }>('/api/health');
  expect(status.status).toBe('ok');
});
```

### Using API keywords

```ts
import { test, expect } from '../fixtures/baseTest';

test('inspect JSON response', async ({ apiKeywords }) => {
  const response = await apiKeywords.sendApiRequest('GET', 'https://reqres.in/api/users?page=2');
  await apiKeywords.verifyResponseStatusCode(response, 200);
  const body = await apiKeywords.getResponseBody<{ data: unknown[] }>(response);
  expect(body.data.length).toBeGreaterThan(0);
});
```

## 🚀 About Me
I am an experienced Senior Automation Engineer with over 8+ years of expertise in Web automation, Mobile automation, API automation, and Performance testing.

I possess a strong command of programming languages such as Java, JavaScript, Kotlin, Python, and Scala.

I have acquired mastery in the following technical skills

- 𝐋𝐚𝐧𝐠𝐮𝐚𝐠𝐞𝐬 : Java, JavaScript, Kotlin, Python, Scala
- 𝐖𝐞𝐛: Selenium, WebdriverIO, Cypress, Playwright
- 𝐌𝐨𝐛𝐢𝐥𝐞: Appium
- 𝐀𝐏𝐈: RestAssured, Postman
- 𝐏𝐞𝐫𝐟𝐨𝐫𝐦𝐚𝐧𝐜𝐞 : Gatling, JMeter

As an experienced Online/Udemy Trainer, I have had the privilege of assisting over 1000+ students in their automation training journey. With a focus on providing comprehensive and practical knowledge, I am dedicated to empowering individuals with the skills necessary to excel in the field of automation.

Udemy Profile Link - https://www.udemy.com/user/vignesh-2698/


## 🔗 Links
[![linkedin](https://img.shields.io/badge/linkedin-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/vignesh-srinivasa-raghavan/)
