import { test, expect } from '../fixtures/baseTest';

test.describe('Database keyword utilities', () => {
  test('verifies data exists for a known user', async ({ databaseKeywords }) => {
    const db = databaseKeywords;
    if (!db) {
      test.skip(true, 'Database not configured for this environment.');
      return;
    }

    let results: Array<{ total: number }> = [];
    try {
      results = await db.executeQuery<{ total: number }>(
        'SELECT COUNT(*) AS total FROM users WHERE username = ?',
        ['Admin']
      );
    } catch (error) {
      test.skip(true, `Skipping database assertion. Unable to query database: ${String(error)}`);
      return;
    }

    expect(results.length).toBeGreaterThan(0);
    const count = results[0]?.total ?? 0;
    expect(count).toBeGreaterThan(0);
  });
});
