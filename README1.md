1. clone project
2. npm install 
3. install playwright by cmd : npx playwright install  
4.
async/await là gì?
async và await là cú pháp của JavaScript giúp xử lý bất đồng bộ (asynchronous) dễ đọc hơn.
Thay vì dùng .then() / .catch(), bạn có thể viết code giống như đồng bộ:

5. Handle Alert 
page.on("dialog", async (alert) => {...}): Thiết lập trình xử lý sự kiện để lắng nghe bất kỳ hộp thoại (alert, confirm, prompt) nào xuất hiện trên trang.
page.on("dialog",async(alert) 
dialog : fix event 
alert : parameter , it may be can change to other  ex: al.message();
alert.accept();
alert.dismiss();
OK with text => alert prompt : accept("playwright")
6. AssertionTest 
Visible/Hidden Assertion
use async({page})
page.locator 
In Playwright, you don’t need @ like you often do in Selenium with XPath.
//input[@name='username']
page.locator('input[name="username"]')
page.locator('.btn-primary')
page.locator('#login-button')
page.locator('text=Submit')
page.getByRole('button', { name: 'Submit' });
7. button : click: right ,left,middle , dbclick
8. xem lại bắt locator vẫn works
cssSelector
div[class="datepicker-days"] th[class="datepicker-switch"]

====
API Testing
request là một instance của APIRequestContext
async ({ request })
const response = await request.get
.post
.put
.delete
=> returns a Response object
=> parse to json response.json()
expect(responseJson.data[0].first_name).toBe('Michael');
use console.log(responseJson); to see log


