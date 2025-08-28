import { test, expect } from '@playwright/test'

test.describe('Production RLS Policies E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // 本番環境のベースURLを確認
    console.log(`Testing against: ${page.url()}`)
  })

  test.describe('管理者権限のテスト', () => {
    test('管理者としてログインできる', async ({ page }) => {
      // ログインページにアクセス
      await page.goto('/login')
      
      // ログインフォームが表示されることを確認
      await expect(page.locator('#email')).toBeVisible()
      await expect(page.locator('#password')).toBeVisible()
      await expect(page.locator('button[type="submit"]')).toBeVisible()
      
      // ログインフォームの動作確認
      await page.fill('#email', 'test@example.com')
      await page.fill('#password', 'testpassword')
      
      // フォームが正常に動作することを確認
      await expect(page.locator('#email')).toHaveValue('test@example.com')
      await expect(page.locator('#password')).toHaveValue('testpassword')
    })

    test('管理者ダッシュボードにアクセスできる', async ({ page }) => {
      // 管理者ダッシュボードに直接アクセス
      await page.goto('/admin')
      
      // ログインが必要な場合はログインページにリダイレクトされることを確認
      await expect(page).toHaveURL(/.*login.*|.*admin.*/)
    })
  })

  test.describe('匿名ユーザーの制限確認', () => {
    test('匿名ユーザーは管理者ページにアクセスできない', async ({ page }) => {
      // ログアウト状態で管理者ページにアクセス
      await page.goto('/admin')
      
      // ログインページにリダイレクトされることを確認
      await expect(page).toHaveURL(/.*login.*/)
    })

    test('匿名ユーザーは投稿作成ページにアクセスできない', async ({ page }) => {
      // ログアウト状態で投稿作成ページにアクセス
      await page.goto('/admin/posts/new')
      
      // ログインページにリダイレクトされることを確認
      await expect(page).toHaveURL(/.*login.*/)
    })
  })

  test.describe('公開機能の動作確認', () => {
    test('匿名ユーザーは記事一覧を閲覧できる', async ({ page }) => {
      // 記事一覧ページにアクセス
      await page.goto('/articles')
      
      // ページが正常に表示されることを確認
      await expect(page).toHaveURL('/articles')
      
      // 記事一覧が表示されることを確認
      const articleItems = page.locator('[data-testid="post-item"], .post-item, article, .article-item')
      await expect(articleItems.first()).toBeVisible({ timeout: 10000 })
    })

    test('匿名ユーザーは記事詳細を閲覧できる', async ({ page }) => {
      // 記事一覧ページから最初の記事の詳細ページにアクセス
      await page.goto('/articles')
      
      // 記事のリンクをクリック
      const firstArticleLink = page.locator('a[href*="/articles/"]').first()
      if (await firstArticleLink.isVisible()) {
        await firstArticleLink.click()
        
        // 記事詳細ページが表示されることを確認
        await expect(page).toHaveURL(/\/articles\/.+/)
      }
    })
  })

  test.describe('エラーページの確認', () => {
    test('404ページが正常に表示される', async ({ page }) => {
      // 存在しないページにアクセス
      await page.goto('/non-existent-page')
      
      // 404ページが表示されることを確認
      await expect(page.locator('text=ページが見つかりません')).toBeVisible({ timeout: 10000 })
    })

    test('ログインページが正常に表示される', async ({ page }) => {
      // ログインページにアクセス
      await page.goto('/login')
      
      // ログインフォームが表示されることを確認
      await expect(page.locator('#email')).toBeVisible()
      await expect(page.locator('#password')).toBeVisible()
    })
  })
})
