import { test as base } from '@playwright/test';
import { getEnvironmentConfig, EnvironmentConfig } from '../../framework/config/environment';
import { TestDataManager } from '../../framework/utils/testDataManager';

type Fixtures = {
  environment: EnvironmentConfig;
  testDataManager: TestDataManager;
};

export const test = base.extend<Fixtures>({
  environment: async ({}, use) => {
    const environmentName = process.env.TEST_ENV ?? 'dev';
    const environmentConfig = getEnvironmentConfig(environmentName);
    await use(environmentConfig);
  },
  testDataManager: async ({}, use) => {
    const manager = new TestDataManager();
    await use(manager);
    manager.clearCache();
  },
});

export const expect = test.expect;
