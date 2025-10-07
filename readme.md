# Playwright Udemy Course

This is the repository created as part of Playwright Udemy Course

Udemy Course Link - https://www.udemy.com/course/master-playwright-docker-cucumber-jenkins/

Please enroll in this course to get the full knowledge about this repository

## 🧱 Framework Enhancements

- **Environment aware configuration** – declare reusable environment metadata in `config/environments.json` and switch between them by setting the `TEST_ENV` environment variable before running Playwright. The selected environment is surfaced in the Playwright HTML report metadata.
- **Reusable test fixtures** – consume `environment` and `testDataManager` fixtures by importing `test`/`expect` from `tests/fixtures/baseTest`. This keeps tests thin and promotes consistent data access patterns.
- **Centralised test data loading** – leverage `TestDataManager` (`framework/utils/testDataManager.ts`) to cache and serve JSON/CSV assets during a run, avoiding repetitive file IO and parsing logic in every test.

```bash
# Example: execute login test against the QA configuration
TEST_ENV=qa npx playwright test tests/UITest/loginTest.spec.ts
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
