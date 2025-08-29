# セキュリティ・監視機能

## 概要

このドキュメントでは、実装されたセキュリティ・監視機能について説明します。

## 実装された機能

### 1. CSP（Content Security Policy）

#### 設定内容
- **default-src**: `'self'` - デフォルトで同一オリジンのみ許可
- **script-src**: `'self' 'unsafe-eval' 'unsafe-inline'` - スクリプトの実行制限
- **style-src**: `'self' 'unsafe-inline'` - スタイルシートの制限
- **font-src**: `'self' https://fonts.gstatic.com` - フォントの制限
- **img-src**: `'self' data: https: blob:` - 画像の制限
- **connect-src**: `'self' https://qprlaprnzqewcgpcvzme.supabase.co` - 接続先の制限
- **frame-src**: `'none'` - iframeの無効化
- **object-src**: `'none'` - オブジェクトの無効化

#### 環境別設定
- **開発環境**: `reportOnly: true` - 警告のみ、ブロックしない
- **本番環境**: `reportOnly: false` - 実際にブロック

### 2. エラーログ監視

#### 機能
- 未処理のJavaScriptエラーの自動キャッチ
- 未処理のPromise拒否の自動キャッチ
- エラー情報の詳細記録（メッセージ、スタックトレース、タイムスタンプ、URL、ユーザーエージェント）
- 本番環境での外部サービスへの送信準備

#### 実装場所
- `src/components/common/ErrorLogger.tsx`
- `src/app/layout.tsx`でグローバルに統合

### 3. パフォーマンス監視

#### 機能
- Core Web Vitals（FCP、LCP、FID、CLS、TTFB）の監視
- バンドル情報の監視
- メモリ使用量の監視
- 本番環境での外部サービスへの送信準備

#### 実装場所
- `src/components/common/PerformanceMonitor.tsx`
- 既存のパフォーマンス監視機能を拡張

### 4. セキュリティ監視

#### 機能
- 疑わしいリクエストの自動検出
- セキュリティイベントの記録
- 認証・認可失敗の記録
- レート制限超過の記録

#### 検出パターン
- ディレクトリトラバーサル攻撃（`../`）
- XSS攻撃（`<script`）
- JavaScriptインジェクション（`javascript:`）
- イベントハンドラーインジェクション（`onclick=`）
- SQLインジェクション（`union select`）
- iframeインジェクション（`<iframe`）
- eval関数の使用（`eval(`）

#### 実装場所
- `src/lib/utils/security.ts`
- `middleware.ts`でリクエストレベルでの監視

### 5. 管理者API

#### セキュリティイベント取得
```
GET /api/admin/security-events
```

#### セキュリティイベントクリア
```
DELETE /api/admin/security-events
```

#### パフォーマンスデータ取得
```
GET /api/admin/performance
```

## 設定

### 環境変数

```bash
# CSPレポートURI（本番環境）
CSP_REPORT_URI=https://your-domain.com/csp-report

# 外部監視サービス（本番環境）
ERROR_TRACKING_SERVICE=https://sentry.io/your-project
PERFORMANCE_MONITORING_SERVICE=https://analytics.google.com
SECURITY_MONITORING_SERVICE=https://your-security-service.com
```

### 設定ファイル

`src/lib/config/security.ts`で環境別の設定を管理

## 使用方法

### 1. エラーログの確認

開発環境では、ブラウザのコンソールでエラーログを確認できます。

### 2. セキュリティイベントの確認

管理者権限を持つユーザーが`/api/admin/security-events`にアクセスして確認できます。

### 3. パフォーマンスデータの確認

管理者権限を持つユーザーが`/api/admin/performance`にアクセスして確認できます。

## 今後の拡張予定

### 1. 外部監視サービスの統合
- **Sentry**: エラー追跡
- **Google Analytics**: パフォーマンス監視
- **Vercel Analytics**: パフォーマンス監視
- **LogRocket**: セッション録画・エラー追跡

### 2. レート制限の実装
- APIエンドポイントへのレート制限
- ログイン試行の制限
- スパム対策

### 3. セキュリティスキャン
- 依存関係の脆弱性チェック
- 定期的なセキュリティ監査
- セキュリティヘッダーの自動テスト

## 注意事項

### 1. 開発環境
- CSPは`reportOnly`モードで動作
- エラーはコンソールに出力
- 外部サービスへの送信は無効

### 2. 本番環境
- CSPは実際にブロックを実行
- エラーは外部サービスに送信
- セキュリティイベントは外部サービスに送信

### 3. パフォーマンス
- 監視機能は軽量に設計
- ユーザー体験への影響を最小化
- 必要に応じて監視レベルを調整可能

## トラブルシューティング

### 1. CSPエラーが発生する場合
- ブラウザのコンソールでCSP違反を確認
- 必要に応じてCSPポリシーを調整
- 開発環境では`reportOnly`モードを使用

### 2. 監視データが取得できない場合
- 認証・認可の確認
- 管理者権限の確認
- APIエンドポイントの動作確認

### 3. パフォーマンスに影響がある場合
- 監視レベルを下げる
- 外部サービスへの送信を無効化
- 必要に応じて監視機能を一時停止
