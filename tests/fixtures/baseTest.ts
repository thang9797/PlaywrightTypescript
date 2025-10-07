import { test as base } from '@playwright/test';
import {
  getEnvironmentConfig,
  EnvironmentConfig,
  EnvironmentDatabaseConfig,
} from '../../framework/config/environment';
import { TestDataManager } from '../../framework/utils/testDataManager';
import { StorageManager } from '../../framework/utils/storageManager';
import { ApiClient } from '../../framework/utils/apiClient';
import { ApiKeywords } from '../../framework/utils/apiKeywords';
import { DatabaseKeywords } from '../../framework/utils/databaseKeywords';

type Fixtures = {
  environment: EnvironmentConfig;
  testDataManager: TestDataManager;
  storageManager: StorageManager;
  apiClient: ApiClient;
  apiKeywords: ApiKeywords;
  databaseKeywords: DatabaseKeywords | null;
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
  apiKeywords: async ({ request, environment }, use) => {
    const keywords = new ApiKeywords(request, environment.baseURL);
    await use(keywords);
  },
  databaseKeywords: async ({ environment }, use) => {
    const databaseConfig: EnvironmentDatabaseConfig | undefined = environment.database;

    if (!databaseConfig) {
      await use(null);
      return;
    }

    const keywords = new DatabaseKeywords(databaseConfig);
    try {
      await use(keywords);
    } finally {
      await keywords.dispose();
    }
  },
});

export const expect = test.expect;
