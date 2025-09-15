# パフォーマンス監視システム ガイド

## 概要

このプロジェクトには包括的なパフォーマンス監視システムが実装されています。自動Lighthouseテスト、CSP違反検出、パフォーマンス劣化の継続監視機能を提供します。

## 🚀 機能一覧

### 1. 自動Lighthouseテスト
- **複数ページの一括監査**: トップページ、図書一覧、About、CSPテストページ
- **閾値ベースの品質チェック**: Performance ≥90、Accessibility ≥95、Best Practices ≥90、SEO ≥90
- **継続的な品質保証**: CI/CDパイプラインでの自動実行
- **詳細レポート生成**: HTML、JSON形式でのレポート出力

### 2. CSP違反検出システム
- **リアルタイム監視**: ブラウザコンソールでのCSP違反を自動検出
- **E2Eテスト統合**: Playwrightテストでの自動CSP違反チェック
- **コンポーネント別テスト**: 動的スタイル、CSS Rule Manager、パフォーマンス最適化コンポーネントの検証

### 3. パフォーマンス監視システム
- **Core Web Vitals測定**: LCP、FID、CLS、FCP、TTFBの継続監視
- **メモリ使用量監視**: JavaScriptヒープサイズの追跡
- **劣化検出アルゴリズム**: ベースラインとの比較による自動劣化検出
- **アラートシステム**: 重要度別のアラート生成と通知

### 4. 統合監視ダッシュボード
- **リアルタイム表示**: 現在のパフォーマンス指標
- **履歴管理**: 過去のLighthouseレポートとパフォーマンス履歴
- **アラート管理**: アクティブなパフォーマンスアラートの表示

## 📋 使用方法

### 基本的なテスト実行

```bash
# 開発環境でのLighthouseテスト
npm run lighthouse:dev

# 本番環境でのLighthouseテスト
npm run lighthouse:prod

# CSP違反検出テスト
npm run test:e2e -- tests/e2e/csp-violation-detection.spec.ts

# 統合監視テスト
npm run monitoring:integrated

# フル監視テストスイート
npm run monitoring:full
```

### 継続的監視の設定

```bash
# 監視システムのセットアップ
npm run monitoring:setup

# システムヘルスチェック
npm run monitoring:health
```

### パフォーマンスダッシュボードの確認

```bash
# 開発サーバー起動
npm run dev

# ブラウザで以下にアクセス
http://localhost:3000/performance-dashboard
```

## 🔧 設定とカスタマイズ

### 環境変数設定

`.env.local`に以下の設定を追加：

```env
# パフォーマンス監視設定
USE_CSP_NONCE=true
CSP_REPORT_URI=/api/csp-report
PERFORMANCE_MONITORING_ENABLED=true

# アラート設定
PERFORMANCE_ALERT_EMAIL=admin@yourdomain.com
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK
```

### Lighthouse閾値の調整

`scripts/lighthouse-audit.js`で閾値をカスタマイズ：

```javascript
const CONFIG = {
  thresholds: {
    performance: 90,    // パフォーマンススコア
    accessibility: 95,  // アクセシビリティスコア
    bestPractices: 90,  // ベストプラクティススコア
    seo: 90,           // SEOスコア
  }
}
```

### パフォーマンス劣化の閾値設定

`src/lib/monitoring/regression-detector.ts`で劣化検出の閾値を調整：

```typescript
private regressionThresholds = {
  performance: { medium: -5, high: -10, critical: -15 },
  lcp: { medium: 500, high: 1000, critical: 2000 },
  // その他の閾値...
}
```

## 📊 レポートとログ

### 生成されるファイル

```
lighthouse-reports/          # Lighthouseレポート
├── overall-summary.json     # 全体サマリー
├── home-[timestamp]/        # ページ別レポート
│   ├── report.html
│   ├── report.json
│   └── summary.json
└── ...

performance-metrics/         # パフォーマンスメトリクス
├── metrics-[sessionId]-[timestamp].json
└── ...

performance-alerts/          # パフォーマンスアラート
├── alert-[severity]-[date]-[timestamp].json
├── alert-history.json
└── ...

test-results/               # テスト結果
├── integrated-monitoring/  # 統合監視テスト結果
└── ...
```

### レポートの見方

#### Lighthouseサマリー例
```json
{
  "timestamp": "2024-01-15T10:30:00.000Z",
  "totalPages": 4,
  "passedPages": 3,
  "failedPages": 1,
  "averageScores": {
    "performance": 92,
    "accessibility": 96,
    "bestPractices": 89,
    "seo": 94
  },
  "criticalFailures": [
    {
      "pageName": "posts",
      "failedCategories": ["bestPractices"]
    }
  ]
}
```

#### パフォーマンスアラート例
```json
{
  "alertId": "alert-1642248600000-abc123",
  "severity": "high",
  "url": "/posts",
  "regressions": [
    "lcp: 2800 (threshold: 2500)",
    "cls: 0.12 (threshold: 0.1)"
  ],
  "metrics": {
    "lcp": 2800,
    "fid": 120,
    "cls": 0.12
  }
}
```

## 🔄 CI/CD統合

### GitHub Actionsワークフロー

`.github/workflows/performance-monitoring.yml`が自動実行されます：

- **プルリクエスト時**: パフォーマンス劣化チェック
- **メインブランチプッシュ時**: フルLighthouseテスト
- **毎日午前2時**: 本番環境の定期監視
- **手動実行**: 必要に応じてワークフローを手動実行

### 本番環境での継続監視

#### crontabでの設定例
```bash
# 毎時間Lighthouseテストを実行
0 * * * * cd /path/to/project && npm run lighthouse:prod >> logs/monitoring/lighthouse.log 2>&1

# 毎日午前2時にフルテストを実行
0 2 * * * cd /path/to/project && npm run monitoring:full >> logs/monitoring/full-test.log 2>&1
```

#### systemdサービスでの設定例
```ini
[Unit]
Description=Performance Monitor Service
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/path/to/project
Environment=NODE_ENV=production
ExecStart=/usr/bin/npm run monitoring:full
Restart=on-failure
RestartSec=30

[Install]
WantedBy=multi-user.target
```

## 🚨 アラートと通知

### 重要度レベル

- **Critical**: Core Web Vitalsの大幅な劣化、重要ページでの致命的なエラー
- **High**: パフォーマンススコアの大幅な低下、複数の指標での劣化
- **Medium**: 軽微なパフォーマンス劣化、非重要ページでの問題
- **Low**: 軽微な変動、改善の余地がある項目

### 通知方法

1. **コンソールログ**: 開発環境での即座な確認
2. **ファイル出力**: アラート履歴の永続化
3. **GitHub Issues**: CI/CDでの自動Issue作成
4. **Slack通知**: 本番環境でのリアルタイム通知（設定が必要）
5. **メール通知**: 重要なアラートの管理者通知（設定が必要）

## 🔍 トラブルシューティング

### よくある問題と解決方法

#### Lighthouseテストが失敗する
```bash
# Chrome/Chromiumが見つからない場合
npx playwright install chromium

# ポートが使用中の場合
lsof -ti:3000 | xargs kill -9
npm run dev
```

#### CSP違反が検出される
```bash
# CSPレポートを確認
cat performance-alerts/alert-*.json | jq '.regressions'

# CSPテストページで詳細確認
http://localhost:3000/csp-test
```

#### メモリ使用量が多すぎる
```bash
# Node.jsのメモリ制限を増加
export NODE_OPTIONS="--max-old-space-size=4096"
npm run monitoring:full
```

### ログファイルの確認

```bash
# 監視ログの確認
tail -f logs/monitoring/lighthouse.log
tail -f logs/monitoring/performance.log

# エラーログの確認
grep -i error logs/monitoring/*.log
```

## 📈 パフォーマンス改善のガイドライン

### Core Web Vitalsの最適化

1. **LCP (Largest Contentful Paint)**
   - 画像の最適化とWebP形式の使用
   - 重要なリソースのプリロード
   - サーバーレスポンス時間の改善

2. **FID (First Input Delay)**
   - JavaScriptの最適化と分割
   - 重い処理の遅延実行
   - Web Workersの活用

3. **CLS (Cumulative Layout Shift)**
   - 画像とiframeのサイズ指定
   - フォントの最適化
   - 動的コンテンツの適切な配置

### 継続的な改善

1. **定期的な監視**: 週次でのパフォーマンスレビュー
2. **ベースライン更新**: 改善後の新しいベースライン設定
3. **閾値調整**: プロジェクトの成長に応じた閾値の見直し
4. **チーム共有**: パフォーマンス指標の定期的な共有

## 🔗 関連リンク

- [Lighthouse Documentation](https://developers.google.com/web/tools/lighthouse)
- [Core Web Vitals](https://web.dev/vitals/)
- [Playwright Testing](https://playwright.dev/)
- [Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)

## 📞 サポート

質問や問題がある場合は、以下の方法でサポートを受けることができます：

1. **GitHub Issues**: バグレポートや機能要求
2. **ドキュメント**: このガイドとコード内コメント
3. **ログファイル**: 詳細なエラー情報とデバッグ情報

---

**注意**: このシステムは継続的な監視と調整が必要です。定期的にレポートを確認し、プロジェクトの成長に応じて設定を調整してください。
