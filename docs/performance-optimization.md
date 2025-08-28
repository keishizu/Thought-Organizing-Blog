# パフォーマンス最適化実装ガイド

## 概要

このドキュメントでは、思整図書館プロジェクトで実装されたパフォーマンス最適化の詳細について説明します。

## 実装された最適化

### 1. Lighthouse スコアの確認と改善

#### Core Web Vitals の測定
- `src/lib/utils/performance.ts` - パフォーマンス指標の測定ユーティリティ
- `src/hooks/usePerformance.ts` - パフォーマンス監視用カスタムフック
- FCP, LCP, FID, CLS, TTFB の自動測定

#### パフォーマンス監視ダッシュボード
- `src/components/admin/PerformanceDashboard.tsx` - 管理者用パフォーマンス監視
- リアルタイムでのパフォーマンス指標表示
- 警告と改善提案の自動生成

### 2. Core Web Vitals の最適化

#### 画像最適化
- `src/lib/utils/imageOptimization.ts` - 画像最適化ユーティリティ
- WebP/AVIF 形式のサポート
- レスポンシブ画像の自動生成
- プレースホルダー画像の生成

#### 遅延読み込み
- Intersection Observer API を使用した画像の遅延読み込み
- スクロールパフォーマンスの最適化
- メモリ使用量の監視と最適化

### 3. 画像の遅延読み込み確認

#### 実装された機能
- `LazyImage` コンポーネント
- 自動的な遅延読み込み
- プレースホルダー画像の表示
- エラーハンドリング

#### 使用方法
```tsx
import { LazyImage } from '@/components/common/PerformanceOptimizer';

<LazyImage
  src="/path/to/image.jpg"
  alt="説明"
  width={800}
  height={600}
  priority={false} // 遅延読み込み
/>
```

### 4. バンドルサイズの最適化

#### Next.js 設定の最適化
- `next.config.js` での Webpack 最適化
- コード分割の設定
- パッケージインポートの最適化

#### 実装された最適化
```javascript
experimental: {
  optimizeCss: true,
  optimizePackageImports: [
    '@radix-ui/react-icons',
    'lucide-react',
    // その他のRadix UIコンポーネント
  ],
  bundlePagesRouterDependencies: true,
}
```

#### Webpack 最適化
- ベンダーチャンクの分離
- Radix UI と Lucide アイコンの個別チャンク化
- キャッシュグループの最適化

### 5. キャッシュ戦略の確認

#### メモリキャッシュ
- `src/lib/utils/cache.ts` - キャッシュ戦略ユーティリティ
- LRU キャッシュの実装
- 有効期限と stale-while-revalidate のサポート

#### HTTP キャッシュ
- 静的アセットの長期キャッシュ（1年）
- 条件付きリクエストのサポート
- ETag と Last-Modified の自動生成

#### ローカルストレージキャッシュ
- ブラウザローカルストレージの活用
- キャッシュサイズの制限
- 自動的な有効期限管理

## 使用方法

### パフォーマンス監視の有効化

1. 開発環境での自動監視
   - コンソールでのパフォーマンス指標表示
   - 警告の自動表示

2. 本番環境での監視
   - パフォーマンスダッシュボードの利用
   - 定期的な指標の確認

### 画像最適化の適用

```tsx
import { generateImageOptimizationConfig } from '@/lib/utils/imageOptimization';

const optimizedImage = generateImageOptimizationConfig(
  '/path/to/image.jpg',
  '説明',
  1920,
  1080,
  { quality: 80, format: 'webp' }
);
```

### キャッシュの活用

```tsx
import { globalCache, LocalStorageCache } from '@/lib/utils/cache';

// メモリキャッシュ
globalCache.set('key', data, { maxAge: 300 });

// ローカルストレージキャッシュ
const cache = new LocalStorageCache('app');
cache.set('key', data, 300);
```

## パフォーマンス指標

### 目標値
- **FCP (First Contentful Paint)**: < 1800ms
- **LCP (Largest Contentful Paint)**: < 2500ms
- **FID (First Input Delay)**: < 100ms
- **CLS (Cumulative Layout Shift)**: < 0.1
- **TTFB (Time to First Byte)**: < 600ms

### 測定方法
1. ブラウザの開発者ツール
2. Lighthouse レポート
3. パフォーマンスダッシュボード
4. コンソールログ（開発環境）

## 今後の改善点

### 短期（1-2週間）
- [ ] 画像の WebP/AVIF 変換の自動化
- [ ] クリティカルCSS の抽出
- [ ] Service Worker の実装

### 中期（1-2ヶ月）
- [ ] CDN の導入
- [ ] 画像のプログレッシブ読み込み
- [ ] プリロード戦略の最適化

### 長期（3-6ヶ月）
- [ ] Edge Computing の活用
- [ ] 高度なキャッシュ戦略
- [ ] パフォーマンス監視の自動化

## トラブルシューティング

### よくある問題

1. **画像が表示されない**
   - 遅延読み込みの設定を確認
   - プレースホルダー画像の表示を確認

2. **パフォーマンス指標が取得できない**
   - ブラウザの互換性を確認
   - 開発者ツールでのエラーを確認

3. **キャッシュが効かない**
   - キャッシュキーの生成を確認
   - 有効期限の設定を確認

### デバッグ方法

1. コンソールログの確認
2. ネットワークタブでのリクエスト確認
3. パフォーマンスタブでの測定
4. Lighthouse レポートの実行

## 参考資料

- [Next.js Performance Optimization](https://nextjs.org/docs/advanced-features/measuring-performance)
- [Core Web Vitals](https://web.dev/vitals/)
- [Web Performance Best Practices](https://web.dev/fast/)
- [Image Optimization](https://web.dev/fast/#optimize-your-images)
