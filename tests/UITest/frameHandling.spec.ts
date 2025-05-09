import { test, expect } from '@playwright/test';

test('Frame Handling Using Page.Frame()', async ({ page }) => {
  await page.goto('https://ui.vision/demo/webtest/frames/');

  // To Find total number of Frames
  const allFrames = page.frames();
  console.log(allFrames);
  const allFramesCount = allFrames.length;
  console.log('Total Frames Count is ' + allFramesCount);
  const frame1 = page.frame({ url: 'https://ui.vision/demo/webtest/frames/frame_1.html' });
  // ✅ Dùng optional chaining để tránh lỗi nếu frame không tìm thấy
  await frame1?.locator('input[name="mytext1"]').fill('Playwright');

  await page.waitForTimeout(5000);
  await page.close();
})

test('Frame Handling Using Page.FrameLocator()', async ({ page }) => {
  await page.goto('https://ui.vision/demo/webtest/frames/');
  const frame1 = page.frameLocator('frame[src="frame_1.html"]');
  await frame1?.locator('input[name="mytext1"]').fill('Playwright');
  await page.waitForTimeout(5000);
  await page.close();
})

test('Nested Frame Handling', async ({ page }) => {
  await page.goto('https://ui.vision/demo/webtest/frames/');
  
  const frame3 = page.frame({url:'https://ui.vision/demo/webtest/frames/frame_3.html'});

  const childFrames = frame3?.childFrames();
  // optional chaining – tránh lỗi nếu frame3 là null hoặc undefined
  // .childFrames(): là method của Playwright, trả về mảng các frame con (nếu có)
  // frame3: là một đối tượng frame (iframe) – ví dụ: lấy từ page.frame(...)
  console.log(childFrames);
  console.log("Number of Child Frames "+childFrames?.length);

  await childFrames[0].locator('//*[@id="i9"]/div[3]/div').check({force:true});
  await childFrames[0].locator('//*[@id="i19"]/div[3]').check({force:true});

  await page.waitForTimeout(5000);
  await page.close();
})

// In Playwright, you don’t need to "switch" to an iframe like in Selenium — instead, 
// you get a reference to the frame and use that to interact with elements inside it.
// const frame = page.frame({ name: 'my-frame-name' });
// const frame = page.frame({ url: /partial-url/ });
// or loop through page.frames() to find it
