# テストガイド

このディレクトリには、プロジェクトの品質を保証するためのテストファイルが含まれています。

## ディレクトリ構造

```
tests/
├── unit/           # ユニットテスト（個別コンポーネント・関数）
├── integration/    # 統合テスト（API・データベース連携）
├── e2e/           # E2Eテスト（ブラウザ操作）
├── utils/         # テスト用ユーティリティ
└── setup.ts       # テスト環境セットアップ
```

## テストの種類

### 1. ユニットテスト (Jest)
- **目的**: 個別のコンポーネントや関数の動作確認
- **実行**: `npm run test`
- **監視モード**: `npm run test:watch`
- **カバレッジ**: `npm run test:coverage`

### 2. 統合テスト (Jest)
- **目的**: APIエンドポイントとデータベースの連携確認
- **実行**: `npm run test`
- **対象**: RLSポリシー、認証、データ操作

### 3. E2Eテスト (Playwright)
- **目的**: 実際のブラウザでのユーザー操作シミュレーション
- **実行**: `npm run test:e2e`
- **UIモード**: `npm run test:e2e:ui`
- **ヘッド付き**: `npm run test:e2e:headed`

## テストの実行

### 全テストの実行
```bash
npm run test
```

### E2Eテストの実行
```bash
npm run test:e2e
```

### 特定のテストファイルの実行
```bash
npm run test -- tests/unit/components/LoadingSpinner.test.tsx
```

## テストデータの管理

### テスト用データベース
- 本番環境とは別のテスト用データベースを使用
- テスト実行前にデータをクリーンアップ
- テスト用の環境変数を設定

### テスト用ユーティリティ
- `tests/utils/test-helpers.ts` に共通関数を定義
- データの作成・削除・クリーンアップ
- 認証状態のシミュレーション

## RLSポリシーのテスト

### テスト項目
1. **管理者権限**
   - 投稿の作成・編集・削除
   - コメント・いいねの管理

2. **匿名ユーザー**
   - 公開投稿の閲覧
   - コメント・いいねの投稿
   - 制限された機能へのアクセス拒否

3. **認証ユーザー**
   - 適切な権限での操作
   - 権限外の操作の拒否

## テストの追加

### 新しいコンポーネントのテスト
```typescript
// tests/unit/components/NewComponent.test.tsx
import { render, screen } from '@testing-library/react'
import NewComponent from '@/components/NewComponent'

describe('NewComponent', () => {
  it('正しくレンダリングされる', () => {
    render(<NewComponent />)
    expect(screen.getByText('期待するテキスト')).toBeInTheDocument()
  })
})
```

### 新しいAPIのテスト
```typescript
// tests/integration/api/new-api.test.ts
import { createServerSupabaseClient } from '@/lib/supabase-server'

describe('New API', () => {
  it('正常に動作する', async () => {
    // テスト実装
  })
})
```

## 注意事項

### 環境変数
- テスト用の環境変数を適切に設定
- 本番環境の環境変数を使用しない

### データベース
- テスト用のデータベースを使用
- 本番データを変更しない

### モック
- 外部サービスは適切にモック
- テストの独立性を保つ

## CI/CD連携

### GitHub Actions
- プルリクエスト時にテストを自動実行
- テスト失敗時はマージをブロック

### デプロイ前チェック
- 本番デプロイ前にテストを実行
- 品質保証の最終チェック
