import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false, // 並列実行を無効化
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1, // ワーカー数を1に制限
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/results.xml' }]
  ],
  
  use: {
    baseURL: 'http://localhost:3000', // ローカル環境用に変更
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    // タイムアウトを長めに設定（本番環境用）
    actionTimeout: 10000,
    navigationTimeout: 30000,
  },

  // 複数ブラウザとモバイルデバイスでのテスト
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],

  // ローカル環境用の設定
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
  
  // テストタイムアウトを長めに設定
  timeout: 60000,
})
