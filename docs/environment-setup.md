# 環境変数設定ガイド

## 概要

このプロジェクトでSupabaseを使用するために必要な環境変数の設定方法を説明します。

## 必要な環境変数

### 1. Supabase設定

プロジェクトルートに`.env.local`ファイルを作成し、以下の環境変数を設定してください：

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://qprlaprnzqewcgpcvzme.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFwcmxhcHJuenFld2NncGN2em1lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3NDQyNDIsImV4cCI6MjA2ODMyMDI0Mn0.QqFJqSj8aSWdkHKDjieNjcGyU5hBdrK3y9o7gCXtJIc

# Supabase Service Role Key (Server-side only)
# 注意: このキーはサーバーサイドでのみ使用し、クライアントサイドでは使用しないでください
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Database Configuration
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.qprlaprnzqewcgpcvzme.supabase.co:5432/postgres

# Next.js Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-key-here

# Application Configuration
NODE_ENV=development
```

## 環境変数の取得方法

### 1. Supabase URL と Anon Key

これらの値は既に設定済みです：
- **URL**: `https://qprlaprnzqewcgpcvzme.supabase.co`
- **Anon Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFwcmxhcHJuenFld2NncGN2em1lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3NDQyNDIsImV4cCI6MjA2ODMyMDI0Mn0.QqFJqSj8aSWdkHKDjieNjcGyU5hBdrK3y9o7gCXtJIc`

### 2. Service Role Key

1. [Supabase Dashboard](https://supabase.com/dashboard) にログイン
2. 「Thought-Organizing-Blog」プロジェクトを選択
3. 左サイドバーから「Settings」→「API」をクリック
4. 「service_role」キーをコピー
5. `.env.local`の`SUPABASE_SERVICE_ROLE_KEY`に設定

### 3. Database URL

1. Supabase Dashboardで「Settings」→「Database」をクリック
2. 「Connection string」セクションの「URI」をコピー
3. `[YOUR-PASSWORD]`部分を実際のデータベースパスワードに置き換え
4. `.env.local`の`DATABASE_URL`に設定

### 4. NextAuth Secret

セキュリティのため、強力なランダム文字列を生成してください：

```bash
# ターミナルで実行
openssl rand -base64 32
```

生成された文字列を`.env.local`の`NEXTAUTH_SECRET`に設定してください。

## セキュリティ注意事項

1. **`.env.local`ファイルは絶対にGitにコミットしないでください**
2. **Service Role Keyはサーバーサイドでのみ使用してください**
3. **本番環境では、より強力なシークレットキーを使用してください**
4. **環境変数は定期的に見直し、必要に応じて更新してください**

## 動作確認

環境変数を設定後、以下のコマンドでアプリケーションを起動してください：

```bash
npm run dev
```

正常に起動すれば、環境変数の設定は完了です。

## トラブルシューティング

### よくある問題

1. **環境変数が読み込まれない**
   - `.env.local`ファイルがプロジェクトルートにあることを確認
   - ファイル名のスペルミスがないことを確認

2. **Supabase接続エラー**
   - URLとAnon Keyが正しく設定されていることを確認
   - ネットワーク接続を確認

3. **データベース接続エラー**
   - Database URLのパスワードが正しいことを確認
   - Supabaseプロジェクトがアクティブであることを確認 