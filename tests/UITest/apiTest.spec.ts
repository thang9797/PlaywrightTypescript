import { test, expect } from '@playwright/test';

const reqresBaseUrl = 'https://reqres.in/api';

test('Get user Details using GET API', async ({ request }) => {
  const response = await request.get(`${reqresBaseUrl}/users`, { params: { page: 2 } });
  const responseJson = await response.json();
  console.log(responseJson);
  expect(response.status()).toBe(200);
  expect(responseJson.data[0].first_name).toBe('Michael');
});

test.describe.serial('Reqres user lifecycle', () => {
  let userId: string;

  test('Create User using POST API', async ({ request }) => {
    const user = {
      name: 'playwright',
      job: 'udemy',
    };

    const response = await request.post(`${reqresBaseUrl}/users`, {
      data: user,
      headers: { ACCEPT: 'application/json' },
    });

    const responseJson = await response.json();
    console.log(responseJson);
    expect(response.status()).toBe(201);
    expect(responseJson.name).toBe(user.name);
    expect(responseJson.job).toBe(user.job);
    userId = responseJson.id;
  });

  test('Update User using PUT API', async ({ request }) => {
    const user = {
      name: 'automation',
      job: 'course',
    };

    expect(userId, 'userId should be captured from the create user test').toBeTruthy();

    const response = await request.put(`${reqresBaseUrl}/users/${userId}`, {
      data: user,
      headers: { ACCEPT: 'application/json' },
    });

    const responseJson = await response.json();
    console.log(responseJson);
    expect(response.status()).toBe(200);
    expect(responseJson.name).toBe(user.name);
    expect(responseJson.job).toBe(user.job);
  });

  test('Delete User using DELETE API', async ({ request }) => {
    expect(userId, 'userId should be captured from the create user test').toBeTruthy();

    const response = await request.delete(`${reqresBaseUrl}/users/${userId}`);
    expect(response.status()).toBe(204);

    const response2 = await request.get(`${reqresBaseUrl}/users/${userId}`);
    console.log(await response2.json());
  });
});
