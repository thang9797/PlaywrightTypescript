import { test, expect } from '@playwright/test';

const reqresBaseUrl = 'https://reqres.in/api';

test('Get All Products List', async ({ request }) => {
    const response = await request.get('https://automationexercise.com/api/productsList');
    var responseJson = await response.json();
    console.log(responseJson);
    expect(response.status()).toBe(200);
    // expect(responseJson.data[0].first_name).toBe('Michael');
});

test('POST To All Products List', async ({ request }) => {
    const response = await request.post('https://automationexercise.com/api/productsList');
    var responseJson = await response.json();
    console.log(responseJson);
    expect(response.status()).toBe(200);
    expect(responseJson.responseCode).toBe(405);
});

// use when need to input body
test('POST To Search Product', async ({ request }) => {
    const response = await request.post('https://automationexercise.com/api/searchProduct', {
        form: {
          search_product: 'jean'
        }
      });
    var responseJson = await response.json();
    console.log(responseJson);
    expect(response.status()).toBe(200);
    expect(responseJson.products.length).toBeGreaterThan(0); // check co ket qua tra ve
    console.log(responseJson.products[0])
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
