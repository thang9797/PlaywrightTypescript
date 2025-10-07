import { test as base } from '@playwright/test';
import { getEnvironmentConfig, EnvironmentConfig } from '../../framework/config/environment';
import { TestDataManager } from '../../framework/utils/testDataManager';
import { StorageManager } from '../../framework/utils/storageManager';
import { ApiClient } from '../../framework/utils/apiClient';

type Fixtures = {
  environment: EnvironmentConfig;
  testDataManager: TestDataManager;
  storageManager: StorageManager;
  apiClient: ApiClient;
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
  storageManager: async ({}, use) => {
    const manager = new StorageManager();
    await use(manager);
  },
  apiClient: async ({ request, environment }, use) => {
    const client = new ApiClient(request, environment.baseURL);
    await use(client);
  },
});

export const expect = test.expect;
