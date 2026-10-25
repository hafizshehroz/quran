import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/web',
  timeout: 60000,
  expect: { timeout: 20000 },
  fullyParallel: false,
  workers: 1,
  use: {
    baseURL: 'http://127.0.0.1:8083',
    ...devices['iPhone 13'],
    defaultBrowserType: 'chromium',
    channel: 'chrome',
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'CI=1 npx expo start --web --port 8083',
    url: 'http://127.0.0.1:8083',
    reuseExistingServer: !process.env.CI,
    timeout: 180000,
  },
});
