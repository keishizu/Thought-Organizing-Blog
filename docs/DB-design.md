# 📦 個人ブログサイト用 データベース設計まとめ（Supabase）

---

## ✅ テーブル一覧

- `posts`：記事情報（管理者のみ操作可）  
- `comments`：記事への匿名コメント（誰でも投稿可）

---

## 📄 `posts` テーブル（記事）

| フィールド名   | 型         | 必須 | 説明                                      |
|----------------|------------|------|-------------------------------------------|
| `id`           | `uuid`     | ✅   | 主キー（自動生成）                        |
| `title`        | `text`     | ✅   | 記事タイトル（検索対象）                  |
| `excerpt`      | `text`     | ✅   | 記事の抜粋・要約（検索・カード用）       |
| `content`      | `text`     | ✅   | 記事本文（Markdown／リッチテキスト形式） |
| `tags`         | `text[]`   | ✅   | タグ一覧（検索・絞り込み対象）           |
| `category`     | `text`     | ✅   | カテゴリー名（3分類から選択）               |
| `image_url`    | `text`     | ❌   | トップ画像URL（Cloudflare Images）        |
| `likes`        | `integer`  | ✅   | いいね数（初期値 0）                      |
| `author_id`    | `uuid`     | ✅   | 投稿者ID（Supabase Auth）                 |
| `created_at`   | `timestamp`| ✅   | 投稿日（`default now()`）                |
| `updated_at`   | `timestamp`| ✅   | 更新日（`default now()` + 更新時上書き） |

---

## 🔐 `posts` テーブルの RLS ポリシー

### SELECT（全ユーザーOK）

```sql
USING (true)
```

---

### INSERT / UPDATE / DELETE（管理者のみ）

```sql
USING (auth.uid() = author_id)
WITH CHECK (auth.uid() = author_id)
```

---

## 💬 `comments` テーブル（匿名コメント）

| フィールド名   | 型         | 必須 | 説明                                     |
|----------------|------------|------|------------------------------------------|
| `id`           | `uuid`     | ✅   | コメントID（自動生成）                   |
| `post_id`      | `uuid`     | ✅   | 紐づく記事ID（`posts.id`）               |
| `username`     | `text`     | ✅   | 表示名（空欄なら「匿名」でもOK）        |
| `content`      | `text`     | ✅   | コメント本文                             |
| `created_at`   | `timestamp`| ✅   | 投稿日（`default now()`）               |

---

## 🔐 `comments` テーブルの RLS ポリシー

### SELECT（全ユーザーOK）

```sql
USING (true)
```

---

### INSERT（匿名ユーザーも投稿可）

```sql
USING (true)
WITH CHECK (true)
```

---

### DELETE（管理者のみ許可）

```sql
USING (auth.uid() = 'あなたのSupabase UID')
```

※ 将来的に `users` テーブルで管理者を判別したい場合は、RLSを調整してもOK

---

## 📝 補足・運用方針

- `posts` は管理者（あなた）のみ作成・編集・削除可能
- `comments` は匿名投稿を許可し、削除は管理者だけに制限
- `image_url` は Cloudflare Images のURLを保存するだけ
- タグは `text[]` で保存 → 検索やクリックで絞り込み可能
- 将来的に「コメントは認証ユーザー限定」にすることも可能（RLS差し替えだけでOK）
