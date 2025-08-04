# Thought Organizing Blog

Next.js 13+ App Routerを使用したブログアプリケーションです。いいね機能とコメント機能を備えています。

## 機能

- ✅ いいね機能（追加・削除・状態表示）
- ✅ コメント機能（投稿・表示・削除）
- ✅ リアルタイムでのUI更新
- ✅ レスポンシブデザイン
- ✅ 型安全性（TypeScript）

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env.local`ファイルを作成し、以下の環境変数を設定してください：

```env
DATABASE_URL="postgresql://username:password@localhost:5432/your_database_name"
```

### 3. データベースのセットアップ

```bash
# Prismaクライアントの生成
npx prisma generate

# データベースマイグレーションの実行
npx prisma db push

# （オプション）Prisma Studioでデータベースを確認
npx prisma studio
```

### 4. 開発サーバーの起動

```bash
npm run dev
```

## 使用方法

### いいね機能

```tsx
import LikeButton from "@/components/likes/LikeButton";

<LikeButton
  postId={1}
  initialLikeCount={5}
  userId={1}
/>
```

### コメント機能

```tsx
import CommentSection from "@/components/comments/CommentSection";

<CommentSection
  postId={1}
  userId={1}
  initialCommentCount={3}
/>
```

## API エンドポイント

### いいね機能

- `POST /api/likes` - いいねの追加
- `DELETE /api/likes` - いいねの削除
- `GET /api/likes?postId=1&userId=1` - いいね状態の確認

### コメント機能

- `POST /api/comments` - コメントの作成
- `GET /api/comments?postId=1` - コメント一覧の取得
- `DELETE /api/comments` - コメントの削除

## 技術スタック

- **フレームワーク**: Next.js 13+ (App Router)
- **データベース**: PostgreSQL + Prisma
- **UI**: Tailwind CSS + Radix UI
- **言語**: TypeScript
- **アイコン**: Lucide React

## 注意事項

- 現在はダミーユーザーID（userId: 1）を使用しています
- 実際の運用では適切な認証システムを実装してください
- データベースのバックアップを定期的に取得してください
