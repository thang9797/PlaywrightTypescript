import { test, expect } from '../fixtures/baseTest';

test.describe('API keyword utilities', () => {
  test('captures JSON response details', async ({ apiKeywords }) => {
    const response = await apiKeywords.sendApiRequest(
      'GET',
      'https://reqres.in/api/users?page=2'
    );

    await apiKeywords.verifyResponseStatusCode(response, 200);
    await apiKeywords.verifyResponseHeaderValue(response, 'content-type', /application\/json/i);

    const body = await apiKeywords.getResponseBody<{
      data: Array<{ first_name: string }>;
    }>(response);

    expect(body.data.length).toBeGreaterThan(0);
    expect(body.data[0]?.first_name).toBe('Michael');
  });

  test('converts XML responses into JSON', async ({ apiKeywords }) => {
    const response = await apiKeywords.sendApiRequest(
      'GET',
      'https://www.w3schools.com/xml/note.xml'
    );

    await apiKeywords.verifyResponseStatusCode(response, 200);

    const xmlJson = await apiKeywords.getResponseBodyXmlToJson(response);

    expect(xmlJson).toMatchObject({
      note: {
        to: 'Tove',
      },
    });
  });
});
