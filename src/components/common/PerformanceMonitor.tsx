"use client";

import { useEffect } from 'react';
import { usePerformance } from '@/hooks/usePerformance';
import { logPerformanceData } from '@/lib/utils/performance';
import { optimizeImageLoading } from '@/lib/utils/imageOptimization';

export function PerformanceMonitor() {
  const { metrics, bundleInfo, memoryInfo } = usePerformance();

  useEffect(() => {
    // 画像の遅延読み込み最適化
    optimizeImageLoading();

    // パフォーマンスログが無効化されていない場合のみ実行
    const isLoggingDisabled = process.env.NEXT_PUBLIC_DISABLE_PERFORMANCE_LOGS === 'true';

    // パフォーマンスデータのログ出力（開発環境のみ）
    // 一時的に無効化: コンソール表示を無効にしたい場合は以下の行をコメントアウト
    if (process.env.NODE_ENV === 'development' && metrics && !isLoggingDisabled) {
      logPerformanceData(metrics);
    }

    // パフォーマンス警告の表示（開発環境のみ）
    // 一時的に無効化: コンソール表示を無効にしたい場合は以下の行をコメントアウト
    if (process.env.NODE_ENV === 'development' && !isLoggingDisabled) {
      if (metrics) {
        const warnings = [];
        if (metrics.fcp > 1800) warnings.push('FCPが1800msを超えています');
        if (metrics.lcp > 2500) warnings.push('LCPが2500msを超えています');
        if (metrics.fid > 100) warnings.push('FIDが100msを超えています');
        if (metrics.cls > 0.1) warnings.push('CLSが0.1を超えています');
        if (metrics.ttfb > 600) warnings.push('TTFBが600msを超えています');

        if (warnings.length > 0) {
          console.group('⚠️ パフォーマンス警告');
          warnings.forEach(warning => console.warn(warning));
          console.groupEnd();
        }
      }

      if (bundleInfo) {
        console.log('📦 バンドル情報:', {
          合計サイズ: `${(bundleInfo.totalSize / 1024).toFixed(1)}KB`,
          JSリソース数: bundleInfo.jsResources,
          平均サイズ: `${(bundleInfo.averageSize / 1024).toFixed(1)}KB`,
        });
      }

      if (memoryInfo) {
        console.log('💾 メモリ使用量:', {
          使用率: `${memoryInfo.usagePercentage.toFixed(1)}%`,
          使用中: `${(memoryInfo.usedJSHeapSize / 1024 / 1024).toFixed(1)}MB`,
          割り当て済み: `${(memoryInfo.totalJSHeapSize / 1024 / 1024).toFixed(1)}MB`,
          制限: `${(memoryInfo.jsHeapSizeLimit / 1024 / 1024).toFixed(1)}MB`,
        });
      }
    }
  }, [metrics, bundleInfo, memoryInfo]);



  // このコンポーネントは何もレンダリングしない
  return null;
}
