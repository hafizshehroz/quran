const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('@playwright/test');

async function main() {
  const browser = await chromium.launch({ channel: 'chrome' });
  const page = await browser.newPage({ viewport: { width: 1024, height: 1024 }, deviceScaleFactor: 1 });
  const root = path.resolve(__dirname, '..');
  const svg = fs.readFileSync(path.join(root, 'assets/brand-mark.svg'), 'utf8').replace('rx="32"', 'rx="0"');
  const render = async (markup, name, size = 1024, transparent = false) => {
    await page.setViewportSize({ width: size, height: size });
    await page.setContent('<style>html,body{margin:0;padding:0;background:transparent}svg{display:block;width:100vw;height:100vh}</style>' + markup);
    await page.screenshot({ path: path.join(root, 'assets/images', name), omitBackground: transparent });
  };
  await render(svg, 'icon.png');
  await render(svg, 'favicon.png', 64);
  const foreground = svg.replace(/<rect[^>]+\/>/, '').replace('<g ', '<g transform="translate(16 16) scale(.8)" ');
  await render(foreground, 'android-icon-foreground.png', 1024, true);
  await render(foreground.replaceAll('#D7C48D', '#FFFFFF'), 'android-icon-monochrome.png', 1024, true);
  await render(foreground.replaceAll('#D7C48D', '#285E49'), 'splash-icon.png', 1024, true);
  await browser.close();
}
main().catch(error => { console.error(error); process.exitCode = 1; });
