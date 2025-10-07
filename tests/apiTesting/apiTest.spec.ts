import { test, expect } from '../fixtures/baseTest';

test.describe('API keyword utilities', () => {
  test('captures JSON response details', async ({ apiKeywords }) => {
    const response = await apiKeywords.sendApiRequest(
      'GET',
      'https://reqres.in/api/users?page=2'
    );
const reqresBaseUrl = 'https://reqres.in/api';

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
test.describe.serial('Reqres user lifecycle', () => {
    let userId: string;

    test.beforeAll(async ({ request }) => {
        const response = await request.post(`${reqresBaseUrl}/users`, {
            data: {
                name: 'automation',
                job: 'course'
            },
            headers: { ACCEPT: 'application/json' }
        });

        const responseJson = await response.json();
        expect(response.status()).toBe(201);
        userId = responseJson.id;
    });

    test('Update User using PUT API', async ({ request }) => {
        const user = {
            name: 'automation',
            job: 'course'
        };

        const response = await request.put(`${reqresBaseUrl}/users/${userId}`, {
            data: user,
            headers: { ACCEPT: 'application/json' }
        });
        const responseJson = await response.json();
        console.log(responseJson);
        expect(response.status()).toBe(200);
        expect(responseJson.name).toBe(user.name);
        expect(responseJson.job).toBe(user.job);
    });

    test('Delete User using DELETE API', async ({ request }) => {
        const response = await request.delete(`${reqresBaseUrl}/users/${userId}`);
        expect(response.status()).toBe(204);

        const response2 = await request.get(`${reqresBaseUrl}/users/${userId}`);
        console.log(await response2.json());
    });
});
