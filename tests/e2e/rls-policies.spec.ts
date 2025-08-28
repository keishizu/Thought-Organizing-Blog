import { test, expect } from '@playwright/test'

test.describe('RLS Policies E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // テスト用のデータベースクリーンアップ
    // 実際の実装では、テスト用のデータベースを使用
  })

  test.describe('管理者権限のテスト', () => {
    test('管理者としてログインして投稿を作成できる', async ({ page }) => {
      // ログインページにアクセス
      await page.goto('/login')
      
      // ログイン情報を入力
      await page.fill('[name="email"]', process.env.TEST_ADMIN_EMAIL || 'admin@example.com')
      await page.fill('[name="password"]', process.env.TEST_ADMIN_PASSWORD || 'password')
      await page.click('button[type="submit"]')
      
      // ログイン成功の確認
      await expect(page).toHaveURL('/admin')
      
      // 投稿作成ページにアクセス
      await page.goto('/admin/posts/new')
      
      // 投稿情報を入力
      await page.fill('[name="title"]', 'E2Eテスト投稿')
      await page.fill('[name="content"]', 'E2Eテストの内容です')
      
      // 投稿を作成
      await page.click('button[type="submit"]')
      
      // 投稿一覧ページにリダイレクトされることを確認
      await expect(page).toHaveURL('/admin/posts')
      
      // 作成した投稿が表示されることを確認
      await expect(page.locator('text=E2Eテスト投稿')).toBeVisible()
    })

    test('管理者として投稿を編集できる', async ({ page }) => {
      // ログイン
      await page.goto('/login')
      await page.fill('[name="email"]', process.env.TEST_ADMIN_EMAIL || 'admin@example.com')
      await page.fill('[name="password"]', process.env.TEST_ADMIN_PASSWORD || 'password')
      await page.click('button[type="submit"]')
      
      // 投稿一覧ページにアクセス
      await page.goto('/admin/posts')
      
      // 最初の投稿の編集ボタンをクリック
      await page.click('[data-testid="edit-post"]:first')
      
      // 編集ページでタイトルを変更
      await page.fill('[name="title"]', '編集された投稿タイトル')
      await page.click('button[type="submit"]')
      
      // 変更が反映されることを確認
      await expect(page.locator('text=編集された投稿タイトル')).toBeVisible()
    })
  })

  test.describe('匿名ユーザーのテスト', () => {
    test('匿名ユーザーは管理者ページにアクセスできない', async ({ page }) => {
      // ログアウト状態で管理者ページにアクセス
      await page.goto('/admin')
      
      // ログインページにリダイレクトされることを確認
      await expect(page).toHaveURL('/login')
    })

    test('匿名ユーザーは投稿作成ページにアクセスできない', async ({ page }) => {
      // ログアウト状態で投稿作成ページにアクセス
      await page.goto('/admin/posts/new')
      
      // ログインページにリダイレクトされることを確認
      await expect(page).toHaveURL('/login')
    })

    test('匿名ユーザーは公開投稿を閲覧できる', async ({ page }) => {
      // ログアウト状態で記事一覧ページにアクセス
      await page.goto('/articles')
      
      // 公開投稿が表示されることを確認
      await expect(page.locator('[data-testid="post-item"]')).toBeVisible()
    })

    test('匿名ユーザーはコメントを投稿できる', async ({ page }) => {
      // 記事詳細ページにアクセス
      await page.goto('/articles/test-post')
      
      // コメントフォームが表示されることを確認
      await expect(page.locator('[data-testid="comment-form"]')).toBeVisible()
      
      // コメントを投稿
      await page.fill('[name="comment"]', '匿名ユーザーのコメント')
      await page.click('button[type="submit"]')
      
      // コメントが投稿されることを確認
      await expect(page.locator('text=匿名ユーザーのコメント')).toBeVisible()
    })
  })

  test.describe('いいね機能のテスト', () => {
    test('匿名ユーザーはいいねを追加できる', async ({ page }) => {
      // 記事詳細ページにアクセス
      await page.goto('/articles/test-post')
      
      // いいねボタンをクリック
      await page.click('[data-testid="like-button"]')
      
      // いいねが追加されることを確認
      await expect(page.locator('[data-testid="like-count"]')).toContainText('1')
    })

    test('匿名ユーザーはいいねを削除できる', async ({ page }) => {
      // 記事詳細ページにアクセス
      await page.goto('/articles/test-post')
      
      // いいねボタンを再度クリック（削除）
      await page.click('[data-testid="like-button"]')
      
      // いいねが削除されることを確認
      await expect(page.locator('[data-testid="like-count"]')).toContainText('0')
    })
  })
})
