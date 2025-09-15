# 📝 個人ブログサイト制作 ToDoリスト（最新版）

## フェーズ1：企画・要件定義
- [x] サイトの目的を明確化（思考整理 × 雑記型でアフィリエイト収益を狙う）
- [x] 想定ユーザー／読者のペルソナを定義（内省・行動変容に関心のある読者）
- [x] 収益導線の方向性を明確にする（書評・ツール紹介・自己分析支援など）
- [x] サイト構成案を作成（TOP／図書一覧／図書詳細／管理者ページなど）
- [x] 要件定義書を作成する

---

## フェーズ2：技術選定・基盤構築
- [x] 使用技術の決定（Next.js, Tailwind CSS, Supabaseなど）
- [x] GitHubリポジトリ作成
- [x] ローカル開発環境セットアップ（Cursor利用）
- [x] Supabase MCPとの連携設定（Cursor経由）
- [x] `rules` ディレクトリを作成し、プロジェクトルールファイルを設置（Cursor用）
- [x] `doc` ディレクトリを作成し、要件定義書・テーブル設計書などの保管スペースを準備

---

## フェーズ3：公開ページの実装（UI）
- [x] トップページ実装（サイト概要、図書一覧、など）
- [x] 図書一覧ページの実装
- [x] 図書詳細ページ実装（Markdown or HTML表示対応）
- [x] このサイトについての詳細ページ実装
- [x] Vercel開発環境へのデプロイ確認（UIの表示テスト）

---

## フェーズ4：DBテーブル設計（Supabase）
- [x] 図書テーブル `posts` の設計・作成（画像URL対応、検索対応、タグ・カテゴリー設計済）
- [x] コメントテーブル `comments` の設計・作成（匿名投稿／管理者削除対応）
- [x] 外部キー／インデックス設計（GINインデックス・CASCADE削除など）
- [x] Supabase RLSポリシー設計（管理者限定操作／匿名投稿許可など）
- [x] TypeScript型定義の生成

---

## フェーズ5：認証・アクセス制御（Supabase Auth）
- [x] Supabase Auth によるログイン機能の導入
- [x] 認証は管理者（自分）に限定／他ユーザーはログイン不可に設定
- [x] 認証状態による画面制御（ログイン画面／管理ページなど）

---

## フェーズ6：図書管理機能の実装（UI & CRUD）

- [x] 投稿・更新・削除のバリデーション処理  
  - `postFormSchema` による Zod バリデーション済み

- [x] Markdownまたはリッチテキスト対応のエディター導入（例：TipTap）  
  - `TipTapEditor` を導入し、本文入力に使用済み

- [x] 管理者ページ（図書投稿／編集／削除）画面の実装  
  - [x] 投稿画面 `/admin/posts/new`（PostForm使用可）  
  - [x] 編集画面 `/admin/posts/[id]/edit`（初期値読み込み＋更新処理 実装済み）  
  - [x] 一覧画面 `/admin/posts`（図書一覧・編集・削除ボタン UI 実装済み）  
  - [x] 削除機能の実装（Supabase `delete` 処理済み／ローカルストレージ側の削除も実装済み）

- [x] ローカルストレージ画像アップロード機能の実装  
  - [x] `ImageUpload.tsx` によるアップロードUI完成  
  - [x] `/api/upload-image` API エンドポイントの実装（ローカルストレージ版）
  - [x] 画像リサイズ機能の実装
  - [x] ファイルサイズ・形式チェック機能の実装

- [x] posts への新規登録処理（画像URL含む）  
  - [x] `PostForm.tsx` の `onSubmit()` 経由で Supabase に `insert`  
  - [x] 投稿完了時に `/admin/posts` へリダイレクト  
  - [x] エラー時にトースト表示（`use-toast.ts` 使用済み）

- [x] いいね、コメント機能の実装（Supabase + RLS対応）  
  - [x] UI側のリアクションコンポーネント設計（`PostInteractions.tsx` 実装済み）
  - [x] Supabase側の `likes`, `comments` テーブルと RLS 設定（実装済み）
  - [x] いいね機能のAPI実装（`/api/likes` 実装済み）
  - [x] コメント機能のAPI実装（`/api/comments` 実装済み）
  - [x] 匿名ユーザー対応（いいね・コメント機能で匿名ID生成済み）

- [x] オススメ図書管理機能の実装  
  - [x] 投稿／編集画面に「おすすめ図書に設定」トグルを追加  
  - [x] 設定済みオススメ図書が3件以上ある場合、トグルをオンにするとトーストでエラーを表示  
  - [x] 図書一覧画面 `/admin/posts` にて、オススメ図書には ★ マークを表示（視覚的に区別）  
  - [x] Supabase `posts` テーブルに `is_recommended: boolean` カラムを追加  
  - [x] トップページの「おすすめ図書」セクションに `is_recommended = true` の図書を最大3件表示

- [x] 画像削除機能の実装
  - [x] `/api/delete-image` API エンドポイントの実装
  - [x] 図書削除時の画像自動削除機能
  - [x] 図書編集時の古い画像削除機能

- [x] プレビュー機能の実装
  - [x] 図書投稿・編集画面でのプレビュー機能
  - [x] プレビューページ `/admin/posts/preview` の実装

- [x] プロフィール画像管理機能の実装
  - [x] `/api/upload-profile-image` API エンドポイントの実装
  - [x] `/api/delete-profile-image` API エンドポイントの実装
  - [x] 管理者アカウントページでのプロフィール画像管理機能

- [x] アカウント管理機能の実装
  - [x] アカウント管理画面 `/admin/account` の実装
  - [x] 管理者名の編集・更新機能（Supabase Auth user_metadata対応）
  - [x] プロフィール画像のアップロード・表示機能
  - [x] アカウント情報の表示（メールアドレス、最終ログイン日時）
  - [x] 管理者ダッシュボードからのアカウント管理画面への導線

---

## フェーズ7：本番デプロイ（Vercel）

### 7.1 コンテンツ・品質チェック
- [x] サイト内の文言を再確認し、適切な表現に変更する
- [x] 記事の作成（最低3枚）
  - [x] サンプル記事1：技術書の書評
  - [x] サンプル記事2：自己啓発本の感想
  - [x] サンプル記事3：ツール紹介記事
- [x] 画像・アイコンの最適化（WebP形式対応、適切なサイズ設定）
- [x] 404ページ、エラーページのカスタマイズ
- [x] ローディング状態の確認と改善

### 7.2 本番環境構築
- [x] Vercelにて本番用プロジェクトを作成
- [x] Vercel側で環境変数を設定
  - [x] **Supabase関連（必須）**
    - [x] `NEXT_PUBLIC_SUPABASE_URL`
    - [x] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - [x] **メール送信関連（必須）**
    - [x] `SMTP_HOST` (例: smtp.gmail.com)
    - [x] `SMTP_PORT` (例: 587)
    - [x] `SMTP_USER` (Gmailアドレス)
    - [x] `SMTP_PASS` (Gmailアプリパスワード)
    - [x] `CONTACT_EMAIL` (管理者宛メールアドレス)
- [x] 本番ドメインのSSL設定確認
  - [x] VercelダッシュボードでSSL証明書が「Valid」状態
  - [x] ブラウザで🔒アイコンが表示される
  - [x] 証明書の詳細で正しいドメイン名が表示される
  - [x] 混合コンテンツエラーがない
  - [x] オンラインツールでSSLテストが通る

### 7.3 Supabase本番設定
- [x] Supabase Auth本番設定の確認
  - [x] 本番環境のredirect URL設定
  - [x] 本番環境のSite URL設定
  - [x] メール認証の設定確認（パスワード認証のみ実装済み）
- [x] 本番環境のRLSポリシー動作確認
- [x] 本番環境のデータベース接続確認

### 7.4 SEO・メタ情報最適化
- [x] メタ情報の追加（タイトル・ディスクリプション・OGP対応）
  - [x] 個別ページのメタ情報設定
    - [x] 図書詳細ページ
    - [x] 図書一覧ページ
    - [x] カテゴリーページ
  - [x] OGP画像の設定
    - [x] デフォルトOGP画像（1200x630px）
    - [x] 図書別OGP画像生成機能
  - [x] Twitter Card対応
  - [x] 構造化データ（JSON-LD）の実装
- [x] robots.txtの設定
- [x] sitemap.xmlの生成・設定

### 7.5 パフォーマンス最適化
- [x] Lighthouse スコアの確認と改善
- [x] Core Web Vitalsの最適化
- [x] 画像の遅延読み込み確認
- [x] バンドルサイズの最適化
- [x] キャッシュ戦略の確認

### 7.6 セキュリティ・監視
- [x] セキュリティヘッダーの設定確認
- [x] CSP（Content Security Policy）の設定
- [x] 本番環境でのエラーログ監視設定
- [x] 本番環境でのパフォーマンス監視設定

### 7.7 最終確認・テスト
- [x] 本番環境での全機能動作確認
  - [x] 認証機能（Production RLS Policiesテスト完了）
  - [x] 図書投稿・編集・削除（基本機能テスト完了）
  - [x] 画像アップロード・削除（基本機能テスト完了）
  - [x] いいね・コメント機能（インタラクション機能テスト完了）
  - [x] レスポンシブデザイン（基本機能テスト完了）
- [x] クロスブラウザテスト（ChromiumとFirefoxでテスト完了）
  - [x] Chromium（Desktop Chrome）テスト完了
  - [x] Firefox（Desktop Firefox）テスト完了
- [x] モバイルデバイステスト（Mobile Chromeで全機能テスト完了）
  - [x] Mobile Chrome（Pixel 5）全機能テスト完了
  - [x] Mobile Safari（iPhone 12）は環境制約によりスキップ
- [x] 本番環境での画像表示確認（基本機能テスト完了）
- [x] パフォーマンス・セキュリティテスト（8個すべて完了）
  - [x] ページ読み込み速度確認
  - [x] 画像遅延読み込み確認
  - [x] セキュリティヘッダー確認
  - [x] CSP設定確認
  - [x] HTTPSリダイレクト確認
  - [x] 404ページ処理確認
  - [x] エラーページ処理確認
  - [x] フォームCSRF保護確認
  - [x] 外部リンク安全性確認

---

## フェーズ8：分析・収益導線強化
- [ ] Google Analytics導入（PV分析）
- [ ] Google Search Console登録・サイトマップ送信
- [ ] アフィリエイトリンク／図書下CTAの導線設計


---

## フェーズ9：検索＆回遊導線の実装
- [ ] トップページに検索フォーム設置（自由入力対応）
- [ ] `/search?q=キーワード` の検索結果ページ実装
- [ ] タグクリック時に `/tags/[slug]` に遷移するタグ別一覧ページ実装
- [ ] タグ付き図書のフィルタ＆導線の最適化
- [ ] （任意）タグクラウド or 人気タグ表示UIの検討
- [ ] SNSや外部メディアとの連携設計（X, noteなど）

### 9.x CSP厳格化対応（段階的実施 - 95%完了）

- [x] 環境変数設定（CSP厳格化の基盤）
  - [x] `.env.local` に `USE_CSP_NONCE=true` を追加（必須環境変数）
  - [x] `.env.local` に `CSP_REPORT_URI=/api/csp-report` を追加（必須環境変数）
  - [x] `.env.local` に `CSP_DEBUG_MODE=true` を追加（開発用）

- [x] nonce配線の基盤実装（厳格CSP運用の前提）
  - [x] `middleware.ts` でリクエスト毎に `nonce` 生成
  - [x] `request headers` 経由で `app/layout.tsx` に `nonce` を受け渡し
  - [x] `<style nonce={...}>` を使えるヘルパ/プロバイダ作成
  - [x] `security-headers.js` を更新し、`style-src` に `nonce-<dynamic>` を許可（`'unsafe-inline'` は未使用）
  - [x] Report-Only で検証、問題なければ本番適用

- [x] 動的style排除（クラス切替 or nonce付き<style>注入へ移行）
  - [x] `src/components/ui/progress.tsx` の `transform` をクラス/ルール注入に置換
  - [x] `src/components/ui/chart.tsx` の `style` オブジェクトをルール注入に置換
  - [x] `src/components/common/PerformanceOptimizer.tsx` の `opacity/height/position/transform/overflow` をルール注入・クラス切替で再設計
  - [x] スクロール/仮想リストの再描画時にCSSルールをバッチ更新（パフォーマンス確保）

- [x] ルール注入の実装詳細
  - [x] `<style nonce>` ノードを1つだけ保持し、CSS文字列を差し替え（重複増殖の防止）
  - [x] セレクタは `data-*` 属性 or 安全な固有IDでスコープ
  - [x] 大量ノード更新時は文字列連結で一括反映（reflowコスト最小化）
  - [x] バッチ更新の最適化（複数ルール変更時の効率化）
  - [x] エラーハンドリングとCSS検証の追加
  - [x] メモリ管理とクリーンアップの改善

- [x] 段階移行の運用
  - [x] 現行：`style-src` の `'unsafe-inline'` を暫定許可（安定稼働）
  - [x] 各コンポーネントの移行完了ごとにCSP違反が0であることを確認
    - [x] `PerformanceOptimizer.tsx` の全コンポーネント（LazyImage、VirtualizedList）をCSPルール注入方式に移行完了
    - [x] `chart.tsx` の ChartStyle コンポーネントをCSPルール注入方式に移行完了
    - [x] `progress.tsx` のプログレスバー動的スタイルをCSPルール注入方式に移行完了
    - [x] CSPレポート分析ページ `/csp-report-analyzer` の実装完了（違反監視体制構築）
    - [x] CSS Rule Manager システムの完全実装（nonce対応、バッチ更新、エラーハンドリング）
  - [x] 最終段：`'unsafe-inline'` をCSPから削除し、`nonce` のみで本番運用
  - [x] 本番環境用設定の適用（`CSP_UPGRADE_INSECURE=true` 等）

- [ ] E2E/監視
  - [ ] Lighthouse/Best Practices でCSPエラーが無いことを確認
    - [ ] 自動Lighthouseテストの実装
    - [ ] パフォーマンススコアの継続監視
    - [ ] Best Practicesスコアの継続監視
  - [x] 主要ページでCSP違反ログが出ないことを手動/自動テストで検証
    - [x] CSPレポート収集API `/api/csp-report` の実装
    - [x] CSPレポート分析ダッシュボード `/csp-report-analyzer` の実装
    - [x] 違反タイプ別フィルタリング機能（Style/Script/コンポーネント別）
    - [x] リアルタイム違反監視とサマリー表示機能
    - [x] CSPテストページ `/csp-test` と `/csp-component-test` の実装
    - [ ] 自動E2EテストでのCSP違反検出の実装
  - [ ] 回帰テスト（スクロール・仮想リスト・チャート表示のパフォーマンス劣化が無い）
    - [x] CSS Rule Manager のバッチ更新によるパフォーマンス最適化
    - [x] 動的スタイル注入時のreflow最小化対応
    - [x] メモリ管理とクリーンアップの自動化
    - [x] パフォーマンステスト用コンポーネントの実装
    - [ ] 自動パフォーマンステストの実装（Playwright + Lighthouse）
    - [ ] パフォーマンス劣化の継続監視体制
