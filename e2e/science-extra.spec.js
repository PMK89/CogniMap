// @ts-check
'use strict';

const { test, expect } = require('@playwright/test');

test('code editor saves complete source through the real UI', async ({ page }) => {
  const originalDoc = await (await page.request.get('/api/cme/id/37513')).json();
  const originalSettings = await (await page.request.get('/api/settings/1')).json();
  const source = Array.from({ length: 500 }, (_, i) => `line ${i + 1}: const value${i + 1} = ${i + 1};`).join('\n');
  try {
    const settings = JSON.parse(JSON.stringify(originalSettings));
    settings.mode = 'edit';
    settings.widget0 = 'codeeditor';
    settings.wlayout0 = settings.wlayout0 || {};
    settings.wlayout0.display = 'block';
    await page.request.put('/api/settings', { data: settings });

    await page.goto('/');
    await page.waitForSelector('#cmsvg');
    await page.getByRole('button', { name: /Search and workspace tools/i }).click();
    const search = page.getByRole('searchbox', { name: 'Search knowledge map' });
    await search.fill('Hydroxylgruppe');
    const result = page.getByRole('button', { name: /Hydroxylgruppe.*#37513/i });
    await expect(result).toBeVisible();
    await result.click();
    await expect(page.locator('app-codeeditor')).toBeVisible();

    const editor = page.locator('.CodeMirror textarea');
    let settingsWritesWhileTyping = 0;
    page.on('request', (request) => {
      if (request.method() === 'PUT' && new URL(request.url()).pathname === '/api/settings') settingsWritesWhileTyping++;
    });
    await editor.focus();
    // The Ctrl key may have been pressed while the canvas had focus and then
    // released after CodeMirror receives focus. Its editable keyup must still
    // clear the shared shortcut state before the following character arrives.
    await page.locator('#cmsvg').evaluate((canvas) => {
      canvas.setAttribute('tabindex', '-1');
      canvas.focus();
    });
    await page.keyboard.down('Control');
    await editor.focus();
    await page.keyboard.up('Control');
    await page.keyboard.type('n');
    await expect.poll(() => settingsWritesWhileTyping).toBe(0);
    await page.keyboard.type('sndqumx');
    await expect.poll(() => settingsWritesWhileTyping).toBe(0);
    await page.keyboard.press('Control+A');
    await page.keyboard.press('Backspace');
    await page.keyboard.insertText(source);
    await expect.poll(() => settingsWritesWhileTyping).toBe(0);
    await page.getByRole('button', { name: 'Save code to selected node' }).click();

    await expect.poll(async () => {
      const doc = await (await page.request.get('/api/cme/id/37513')).json();
      const content = JSON.parse(doc.cmobject).content.find((item) => item.cat === 'html');
      return content && content.info;
    }, { timeout: 15000 }).toBe(source);

    const saved = await (await page.request.get('/api/cme/id/37513')).json();
    const content = JSON.parse(saved.cmobject).content.find((item) => item.cat === 'html');
    expect(content.info).toBe(source);
    expect(content.object).toContain('value500');
  } finally {
    await page.request.put('/api/cme', { data: originalDoc });
    await page.request.put('/api/settings', { data: originalSettings });
  }
});
