# 思整図書館 - 思考を整える、静かな空間。

Next.js 15+ App Routerを使用したブログアプリケーションです。思考整理をテーマにした記事の投稿・管理、いいね機能、コメント機能を備えています。

## 概要

思整図書館は、心のモヤモヤや迷いを少しずつ言葉に変え、思考を整える場所です。日々感じる小さな気づきや内省を言葉にして、読者の方々と共有するブログプラットフォームです。

## 主な機能

### 📚 ブログ機能
- ✅ 記事の投稿・編集・削除
- ✅ カテゴリー別記事表示（思整術、仕事と分岐点、日常と気づき）
- ✅ リッチテキストエディター（TipTap）
- ✅ ファイルインポート機能（Markdown、Word、HTML）
- ✅ 画像アップロード・管理
- ✅ 記事の下書き・公開・非公開管理

### 💝 インタラクション機能
- ✅ いいね機能（追加・削除・状態表示）
- ✅ コメント機能（投稿・表示・削除）
- ✅ リアルタイムでのUI更新

### 🔐 認証・管理機能
- ✅ Supabase認証システム
- ✅ 管理者ダッシュボード
- ✅ 記事管理画面
- ✅ プロフィール管理

### 📱 ユーザー体験
- ✅ レスポンシブデザイン
- ✅ アクセシビリティ対応
- ✅ ダークモード対応
- ✅ 検索・フィルタリング機能

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env.local`ファイルを作成し、以下の環境変数を設定してください：

```env
# Supabase設定
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# データベース設定
DATABASE_URL=your_database_connection_string

# メール設定（お問い合わせ機能用）
SMTP_HOST=your_smtp_host
SMTP_PORT=your_smtp_port
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password

# Google Tag Manager設定
NEXT_PUBLIC_GTM_ID=GTM-xxxxxxx
```

### 3. Supabaseプロジェクトの設定

1. [Supabase](https://supabase.com)でプロジェクトを作成
2. 認証設定を有効化
3. データベーステーブルの作成（`posts`, `comments`, `likes`など）
4. ストレージバケットの設定（画像アップロード用）

### 4. 開発サーバーの起動

```bash
npm run dev
```

## 使用方法

### 管理者としてログイン

```bash
# 管理者アカウントでログイン
http://localhost:3000/login

# ダッシュボードにアクセス
http://localhost:3000/admin
```

### 記事の投稿

1. 管理者ダッシュボードにアクセス
2. 「新規図書投稿」を選択
3. TipTapエディターで記事を作成
4. カテゴリー、タグ、画像を設定
5. 下書き保存または公開

### ファイルインポート

以下のファイル形式から記事をインポートできます：
- Markdown (.md, .mdx)
- Microsoft Word (.docx)
- HTML (.html)

## 技術スタック

### フロントエンド
- **Next.js** (v15.4.1) - React フレームワーク
- **React** (v18.3.1) - UI ライブラリ
- **TypeScript** (v5.2.2) - 型付き JavaScript

### UI コンポーネント
- **Shadcn/ui** - モダンなUIコンポーネントライブラリ
- **Tailwind CSS** (v3.3.3) - ユーティリティファースト CSS フレームワーク
- **Radix UI** - アクセシブルなヘッドレス UI コンポーネント
- **Lucide React** (v0.446.0) - アイコンライブラリ

### バックエンド・データベース
- **Supabase** - 認証・データベース・ストレージ
- **PostgreSQL** - リレーショナルデータベース

### エディター・コンテンツ管理
- **TipTap** - リッチテキストエディター
- **Marked** - Markdown to HTML変換
- **Mammoth** - Word文書処理
- **DOMPurify** - HTMLサニタイゼーション

### フォーム・バリデーション
- **React Hook Form** - フォーム管理
- **Zod** - スキーマバリデーション
- **Hookform Resolvers** - フォームバリデーション統合

### その他のライブラリ
- **date-fns** - 日付操作
- **gray-matter** - フロントマター解析
- **recharts** - チャート・グラフ
- **sonner** - トースト通知

## プロジェクト構造

```
src/
├── app/                    # App Router ページ
│   ├── (marketing)/       # マーケティングページ
│   │   ├── about/         # 思整図書館について
│   │   ├── contact/       # お問い合わせ
│   │   └── privacy/       # プライバシーポリシー
│   ├── (dashboard)/       # 管理者機能
│   │   ├── admin/         # 管理者ダッシュボード
│   │   └── login/         # 管理者ログイン
│   ├── articles/          # 記事一覧・詳細
│   ├── categories/        # カテゴリー別記事
│   └── api/               # API エンドポイント
│       ├── auth/          # 認証関連
│       ├── posts/         # 記事管理
│       ├── comments/      # コメント機能
│       ├── likes/         # いいね機能
│       ├── contact/       # お問い合わせ
│       ├── upload/        # ファイルアップロード
│       └── import-post/   # ファイルインポート
├── components/            # React コンポーネント
│   ├── admin/            # 管理者用コンポーネント
│   ├── blog/             # ブログ関連コンポーネント
│   ├── comments/         # コメント機能
│   ├── editor/           # エディター関連
│   ├── likes/            # いいね機能
│   ├── layout/           # レイアウトコンポーネント
│   └── ui/               # 共通UIコンポーネント
├── lib/                  # ユーティリティ・設定
│   ├── supabase/         # Supabase設定
│   ├── utils/            # ヘルパー関数
│   └── data.ts           # データ取得関数
├── hooks/                # カスタムフック
└── types/                # TypeScript型定義
```

## API エンドポイント

### 認証
- `POST /api/auth/login` - 管理者ログイン
- `POST /api/auth/logout` - ログアウト

### 記事管理
- `GET /api/posts` - 記事一覧取得
- `POST /api/posts` - 新規記事作成
- `PUT /api/posts/[id]` - 記事更新
- `DELETE /api/posts/[id]` - 記事削除

### インタラクション
- `POST /api/likes` - いいねの追加
- `DELETE /api/likes` - いいねの削除
- `GET /api/likes` - いいね状態の確認
- `POST /api/comments` - コメントの作成
- `GET /api/comments` - コメント一覧の取得
- `DELETE /api/comments` - コメントの削除

### ファイル管理
- `POST /api/upload` - 画像アップロード
- `POST /api/import-post` - ファイルインポート

### その他
- `POST /api/contact` - お問い合わせ送信
- `GET /api/admin/profile` - 管理者プロフィール取得

## 開発・ビルド

### 開発環境

```bash
# 開発サーバー起動
npm run dev

# ビルド
npm run build

# 本番サーバー起動
npm start

# リント
npm run lint
```

### 環境変数

開発環境では`.env.local`、本番環境では適切な環境変数管理サービスを使用してください。

## デプロイ

### Vercel（推奨）

1. GitHubリポジトリとVercelを連携
2. 環境変数を設定
3. 自動デプロイの設定

### その他のプラットフォーム

- Netlify
- Railway
- AWS Amplify

## 注意事項

- 管理者アカウントの認証情報は適切に管理してください
- 画像ファイルのサイズ制限は5MBです
- インポート可能なファイルサイズは10MBまでです
- 本番環境では適切なセキュリティ設定を行ってください

## Google Tag Manager (GTM) 設定

### 概要
このプロジェクトには Google Tag Manager (GTM) が統合されており、GTM ID: `GTM-5NXSS574` で設定されています。

### 実装内容
- **開始タグ**: `<head>` 内の上部に配置
- **noscript タグ**: `<body>` の直後に配置
- **自動ページビュートラッキング**: ルート変更時に自動で `page_view` イベントを送信
- **CSP 設定**: `security-headers.js` で GTM ドメインを許可

### 検証方法

#### 1. ブラウザでの確認
1. 開発者ツール（F12）を開く
2. Console タブで CSP エラーがないことを確認
3. Network タブで `gtm.js` が正常に読み込まれていることを確認

#### 2. GTM プレビューモードでの確認
1. [Google Tag Manager](https://tagmanager.google.com/) にアクセス
2. プレビューモードを有効化
3. サイトにアクセスしてイベントが正しく送信されていることを確認

#### 3. データレイヤーの確認
1. ブラウザのコンソールで以下を実行：
```javascript
console.log(window.dataLayer);
```
2. `gtm.js` イベントと `page_view` イベントが含まれていることを確認

### カスタムイベントの送信
必要に応じて、以下のようにカスタムイベントを送信できます：

```typescript
import { trackEvent } from '@/lib/gtm';

// ボタンクリックイベントの例
trackEvent('button_click', {
  button_name: 'submit',
  page_location: '/contact'
});
```

### トラブルシューティング
- **CSP エラーが発生する場合**: `security-headers.js` の設定を確認
- **イベントが送信されない場合**: GTM の設定とデータレイヤーの状態を確認
- **noscript タグが表示される場合**: JavaScript が無効になっている可能性

## ライセンス

このプロジェクトはプライベートプロジェクトです。

## サポート

技術的な質問や問題がございましたら、お気軽にお問い合わせください。
