import { test, expect } from '@playwright/test';

// var userId;

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

test('Update User using PUT API', async ({ request }) => {
    var user = {
        "name": "automation",
        "job": "course"
    }

    const response = await request.put('https://reqres.in/api/users/' + userId, {
        data: user,
        headers: { "ACCEPT": "applications/JSON" }
    });
    var responseJson = await response.json();
    console.log(responseJson);
    expect(response.status()).toBe(200);
    expect(responseJson.name).toBe(`${user.name}`);
    expect(responseJson.job).toBe(`${user.job}`);
    userId = responseJson.id;
});

test('Delete User using DELETE API', async ({ request }) => {
    const response = await request.delete('https://reqres.in/api/users/' + userId);
    expect(response.status()).toBe(204);

    const response2 = await request.get('https://reqres.in/api/users/' + userId);
    console.log(await response2.json())
});