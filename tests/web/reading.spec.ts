import { expect, test } from '@playwright/test';

test('reader jumps, boundaries, bookmarks, resume and restart persistence', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  await expect(page.getByRole('button', { name: 'Read Quran', exact: true })).toBeVisible();
  await page.screenshot({ path: '/tmp/holy-quran-home-light.png', fullPage: true });
  await page.getByRole('button', { name: 'Read Quran', exact: true }).click();
  await expect(page.getByRole('button', { name: /PDF page 2 of 549/ })).toBeVisible();
  await page.getByRole('button', { name: /PDF page 2 of 549/ }).click();
  await page.getByRole('textbox', { name: 'PDF page number' }).fill('550');
  await page.getByRole('button', { name: 'Open page', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('1 to 549');
  await page.getByRole('textbox', { name: 'PDF page number' }).fill('42');
  await page.getByRole('button', { name: 'Open page', exact: true }).click();
  await expect(page.getByRole('button', { name: /PDF page 42 of 549/ })).toBeVisible();
  await expect(page.getByRole('img', { name: /Original Quran PDF page 42\./ })).toBeVisible();
  await expect(page.getByText('Opening page 42…')).toBeHidden();
  await page.screenshot({ path: '/tmp/holy-quran-reader.png', fullPage: true });
  await page.getByRole('button', { name: 'Bookmark this page', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Remove bookmark', exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('button', { name: /PDF page 42 of 549/ })).toBeVisible();
  await page.getByRole('button', { name: 'Close reader' }).click();
  await page.getByRole('tab', { name: 'Bookmarks', exact: true }).click();
  await page.getByRole('button', { name: 'Read bookmarked PDF page 42' }).click();
  await expect(page.getByRole('button', { name: /PDF page 42 of 549/ })).toBeVisible();
  await page.getByRole('button', { name: /PDF page 42 of 549/ }).click();
  await page.getByRole('textbox', { name: 'PDF page number' }).fill('549');
  await page.getByRole('button', { name: 'Open page', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Next PDF page' })).toBeDisabled();
  await page.getByRole('button', { name: /PDF page 549 of 549/ }).click();
  await page.getByRole('textbox', { name: 'PDF page number' }).fill('1');
  await page.getByRole('button', { name: 'Open page', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Previous PDF page' })).toBeDisabled();
  expect(errors).toEqual([]);
});

test('search, confirmed mappings, theme and side drawer work after reload', async ({ page }) => {
  await page.goto('/surahs');
  await page.getByRole('textbox', { name: 'Search by Arabic or English name' }).fill('Al-Fatihah');
  await page.getByRole('button', { name: /Al-Fatihah, .*PDF page 2/ }).click();
  await expect(page.getByRole('button', { name: /PDF page 2 of 549/ })).toBeVisible();
  await page.getByRole('button', { name: 'Close reader' }).click();
  await page.getByRole('textbox', { name: 'Search by Arabic or English name' }).fill('Ali Imran');
  await page.getByRole('button', { name: /Edit starting page for Ali/ }).click();
  await expect(page.getByRole('button', { name: /Confirm start: PDF page/ })).toBeVisible();
  // Confirm the actual reviewed page again to exercise local-link persistence.
  await page.getByRole('button', { name: /Confirm start: PDF page/ }).click();
  await expect(page.getByText('Your link', { exact: false })).toBeVisible();
  await page.reload();
  await page.getByRole('textbox', { name: 'Search by Arabic or English name' }).fill('Ali Imran');
  await expect(page.getByText('Your link', { exact: false })).toBeVisible();
  await page.getByRole('button', { name: 'Open settings' }).click();
  await page.getByRole('radio', { name: /Dark A softer interface/ }).click();
  await page.reload();
  await expect(page.getByRole('radio', { name: /Dark A softer interface/ })).toBeChecked();
  await page.getByRole('button', { name: 'Go back' }).click();
  await page.getByRole('button', { name: 'Open navigation menu' }).click();
  await page.getByRole('button', { name: 'Privacy policy', exact: true }).click();
  await expect(page.getByText('FOR THE CURRENT VERSION', { exact: true })).toBeVisible();
});

test('touch swipes turn pages and rotation preserves the visible page', async ({ page, context }) => {
  await page.goto('/reader?page=10');
  await expect(page.getByRole('button', { name: /PDF page 10 of 549/ })).toBeVisible();
  const session = await context.newCDPSession(page);
  const swipe = async (from: number, to: number) => {
    const timestamp = Date.now() / 1000;
    await session.send('Input.dispatchTouchEvent', {
      type: 'touchStart', touchPoints: [{ x: from, y: 300 }], timestamp,
    });
    for (let step = 1; step <= 12; step++) {
      await session.send('Input.dispatchTouchEvent', {
        type: 'touchMove',
        touchPoints: [{ x: from + (to - from) * step / 12, y: 300 }],
        timestamp: timestamp + step * 0.04,
      });
    }
    await session.send('Input.dispatchTouchEvent', {
      type: 'touchEnd', touchPoints: [], timestamp: timestamp + 0.52,
    });
  };
  await swipe(70, 320);
  await expect(page.getByRole('button', { name: /PDF page 11 of 549/ })).toBeVisible();
  await swipe(320, 70);
  await expect(page.getByRole('button', { name: /PDF page 10 of 549/ })).toBeVisible();
  await page.setViewportSize({ width: 844, height: 390 });
  await expect(page.getByRole('button', { name: /PDF page 10 of 549/ })).toBeVisible();
  await expect(page.getByRole('img', { name: /Original Quran PDF page 10\./ })).toBeInViewport({ ratio: 0.95 });
  await page.screenshot({ path: '/tmp/holy-quran-reader-landscape.png' });
  await page.getByRole('button', { name: 'Fit page to width', exact: true }).click();
  const enlargedPage = page.getByRole('img', { name: /Original Quran PDF page 10\./ });
  await expect.poll(async () => (await enlargedPage.boundingBox())?.width ?? 0).toBeGreaterThan(780);
  const verticalReader = page.getByTestId('reader-width-scroll');
  await verticalReader.evaluate(element => { element.scrollTop = 250; });
  await expect.poll(() => verticalReader.evaluate(element => element.scrollTop)).toBeGreaterThan(200);
  await page.screenshot({ path: '/tmp/holy-quran-reader-landscape-width.png' });
  await page.getByRole('button', { name: 'Next PDF page', exact: true }).click();
  await expect(page.getByRole('button', { name: /PDF page 11 of 549/ })).toBeVisible();
  await expect.poll(() => verticalReader.evaluate(element => element.scrollTop)).toBe(0);
  await page.reload();
  await expect(page.getByRole('button', { name: 'Fit whole page to screen', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: /PDF page 11 of 549/ })).toBeVisible();
  await page.getByRole('button', { name: 'Previous PDF page', exact: true }).click();
  await page.getByRole('button', { name: 'Fit whole page to screen', exact: true }).click();
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.getByRole('img', { name: /Original Quran PDF page 10\./ })).toBeInViewport({ ratio: 0.95 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});
