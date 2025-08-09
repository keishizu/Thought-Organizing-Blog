# 📦 個人ブログサイト用 データベース設計まとめ（Supabase）

---

## ✅ テーブル一覧

- `posts`：図書情報（管理者のみ操作可）  
- `comments`：図書への匿名コメント（誰でも投稿可）
- `likes`：図書へのいいね（匿名ユーザー対応）

---

## 📄 `posts` テーブル（図書）

| フィールド名      | 型                    | 必須 | 説明                                      |
|-------------------|-----------------------|------|-------------------------------------------|
| `id`              | `uuid`                | ✅   | 主キー（自動生成）                        |
| `title`           | `text`                | ✅   | 図書タイトル（検索対象）                  |
| `excerpt`         | `text`                | ✅   | 図書の抜粋・要約（検索・カード用）       |
| `content`         | `text`                | ✅   | 図書本文（Markdown／リッチテキスト形式） |
| `tags`            | `text[]`              | ✅   | タグ一覧（検索・絞り込み対象）           |
| `category`        | `text`                | ✅   | カテゴリー名（3分類から選択）               |
| `image_url`       | `text`                | ❌   | トップ画像URL（ローカルストレージ）        |
| `likes`           | `integer`             | ✅   | いいね数（初期値 0）                      |
| `author_id`       | `uuid`                | ✅   | 投稿者ID（Supabase Auth）                 |
| `created_at`      | `timestamp with time zone` | ✅ | 投稿日（`default now()`）                |
| `updated_at`      | `timestamp with time zone` | ✅ | 更新日（`default now()` + 更新時上書き） |
| `status`          | `text`                | ✅   | 図書ステータス（draft/published/private） |
| `allow_comments`  | `boolean`             | ✅   | コメント許可フラグ（初期値 true）         |
| `allow_likes`     | `boolean`             | ✅   | いいね許可フラグ（初期値 true）           |
| `is_recommended`  | `boolean`             | ❌   | おすすめ図書フラグ（初期値 false）        |

---

## 🔐 `posts` テーブルの RLS ポリシー

### SELECT（全ユーザーOK）

```sql
USING (true)
```

---

### INSERT（管理者のみ）

```sql
WITH CHECK (auth.uid() = '4ebc94e8-0d44-4417-acf1-f14f3555dbad'::uuid)
```

---

### UPDATE（管理者のみ）

```sql
USING (auth.uid() = '4ebc94e8-0d44-4417-acf1-f14f3555dbad'::uuid)
WITH CHECK (auth.uid() = '4ebc94e8-0d44-4417-acf1-f14f3555dbad'::uuid)
```

---

### DELETE（管理者のみ）

```sql
USING (auth.uid() = '4ebc94e8-0d44-4417-acf1-f14f3555dbad'::uuid)
```

---

## 💬 `comments` テーブル（匿名コメント）

| フィールド名   | 型                    | 必須 | 説明                                     |
|----------------|-----------------------|------|------------------------------------------|
| `id`           | `uuid`                | ✅   | コメントID（自動生成）                   |
| `post_id`      | `uuid`                | ✅   | 紐づく図書ID（`posts.id`）               |
| `username`     | `text`                | ✅   | 表示名（空欄なら「匿名」でもOK）        |
| `content`      | `text`                | ✅   | コメント本文                             |
| `created_at`   | `timestamp with time zone` | ✅ | 投稿日（`default now()`）               |

---

## 🔐 `comments` テーブルの RLS ポリシー

### SELECT（全ユーザーOK）

```sql
USING (true)
```

---

### INSERT（匿名ユーザーも投稿可）

```sql
WITH CHECK (true)
```

---

### DELETE（管理者のみ許可）

```sql
USING (auth.uid() = '4ebc94e8-0d44-4417-acf1-f14f3555dbad'::uuid)
```

---

## ❤️ `likes` テーブル（いいね）

| フィールド名   | 型                    | 必須 | 説明                                     |
|----------------|-----------------------|------|------------------------------------------|
| `id`           | `uuid`                | ✅   | いいねID（自動生成）                     |
| `post_id`      | `uuid`                | ✅   | 紐づく図書ID（`posts.id`）               |
| `user_id`      | `text`                | ✅   | ユーザーID（匿名ユーザーは生成ID）       |
| `created_at`   | `timestamp with time zone` | ✅ | いいね日時（`default now()`）           |

---

## 🔐 `likes` テーブルの RLS ポリシー

### SELECT（全ユーザーOK）

```sql
USING (true)
```

---

### INSERT（匿名ユーザーもいいね可）

```sql
WITH CHECK (true)
```

---

### DELETE（管理者のみ許可）

```sql
USING (auth.uid() = '4ebc94e8-0d44-4417-acf1-f14f3555dbad'::uuid)
```

---

## 📝 補足・運用方針

- `posts` は管理者（あなた）のみ作成・編集・削除可能
- `comments` は匿名投稿を許可し、削除は管理者だけに制限
- `likes` は匿名ユーザーもいいね可能（匿名ID生成）
- `image_url` はローカルストレージのURLを保存
- タグは `text[]` で保存 → 検索やクリックで絞り込み可能
- `status` で図書の公開状態を管理（draft/published/private）
- `allow_comments` と `allow_likes` で個別図書の機能制御
- `is_recommended` でおすすめ図書の管理
- 管理者のUUIDは実際のSupabase AuthのユーザーIDに基づいて設定
- 将来的に「コメント・いいねは認証ユーザー限定」にすることも可能（RLS差し替えだけでOK）
