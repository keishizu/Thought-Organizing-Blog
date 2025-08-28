// パフォーマンス監視ユーティリティ

export interface PerformanceMetrics {
  fcp: number; // First Contentful Paint
  lcp: number; // Largest Contentful Paint
  fid: number; // First Input Delay
  cls: number; // Cumulative Layout Shift
  ttfb: number; // Time to First Byte
}

// Core Web Vitalsの測定
export function measureCoreWebVitals(): Promise<PerformanceMetrics> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve({
        fcp: 0,
        lcp: 0,
        fid: 0,
        cls: 0,
        ttfb: 0,
      });
      return;
    }

    const metrics: Partial<PerformanceMetrics> = {};
    let metricsCount = 0;

    const checkComplete = () => {
      metricsCount++;
      if (metricsCount >= 5) { // 5つの指標が揃ったら完了
        setTimeout(() => {
          resolve(metrics as PerformanceMetrics);
        }, 1000); // 1秒待ってから完了
      }
    };

    // FCP (First Contentful Paint)
    try {
      new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const fcpEntry = entries.find((entry) => entry.name === 'first-contentful-paint');
        if (fcpEntry) {
          metrics.fcp = fcpEntry.startTime;
          checkComplete();
        }
      }).observe({ entryTypes: ['paint'] });
    } catch (error) {
      console.warn('FCP measurement failed:', error);
      checkComplete();
    }

    // LCP (Largest Contentful Paint)
    try {
      new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const lcpEntry = entries[entries.length - 1];
        if (lcpEntry) {
          metrics.lcp = lcpEntry.startTime;
          checkComplete();
        }
      }).observe({ entryTypes: ['largest-contentful-paint'] });
    } catch (error) {
      console.warn('LCP measurement failed:', error);
      checkComplete();
    }

    // FID (First Input Delay)
    try {
      new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const fidEntry = entries[0] as PerformanceEventTiming;
        if (fidEntry && 'processingStart' in fidEntry) {
          metrics.fid = fidEntry.processingStart - fidEntry.startTime;
          checkComplete();
        }
      }).observe({ entryTypes: ['first-input'] });
    } catch (error) {
      console.warn('FID measurement failed:', error);
      checkComplete();
    }

    // CLS (Cumulative Layout Shift)
    try {
      let clsValue = 0;
      new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          const layoutShiftEntry = entry as LayoutShift;
          if (!layoutShiftEntry.hadRecentInput) {
            clsValue += layoutShiftEntry.value;
          }
        }
        metrics.cls = clsValue;
        checkComplete();
      }).observe({ entryTypes: ['layout-shift'] });
    } catch (error) {
      console.warn('CLS measurement failed:', error);
      checkComplete();
    }

    // TTFB (Time to First Byte)
    try {
      const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigationEntry) {
        metrics.ttfb = navigationEntry.responseStart - navigationEntry.requestStart;
      } else {
        metrics.ttfb = 0;
      }
      checkComplete();
    } catch (error) {
      console.warn('TTFB measurement failed:', error);
      metrics.ttfb = 0;
      checkComplete();
    }

    // フォールバック: 10秒後に強制完了
    setTimeout(() => {
      if (metricsCount < 5) {
        console.warn('Performance measurement timeout, using fallback values');
        resolve({
          fcp: metrics.fcp || 0,
          lcp: metrics.lcp || 0,
          fid: metrics.fid || 0,
          cls: metrics.cls || 0,
          ttfb: metrics.ttfb || 0,
        });
      }
    }, 10000);
  });
}

// 画像の遅延読み込み最適化
export function optimizeImageLoading() {
  if (typeof window === 'undefined') return;

  const images = document.querySelectorAll('img[data-src]');
  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const img = entry.target as HTMLImageElement;
        img.src = img.dataset.src || '';
        img.classList.remove('lazy');
        imageObserver.unobserve(img);
      }
    });
  });

  images.forEach((img) => imageObserver.observe(img));
}

// バンドルサイズの最適化
export function analyzeBundleSize() {
  if (typeof window === 'undefined') return null;

  const resources = performance.getEntriesByType('resource');
  const jsResources = resources.filter((resource) => 
    resource.name.endsWith('.js') || resource.name.endsWith('.mjs')
  );

  const totalSize = jsResources.reduce((sum, resource) => {
    const transferSize = (resource as PerformanceResourceTiming).transferSize || 0;
    return sum + transferSize;
  }, 0);

  return {
    totalSize,
    jsResources: jsResources.length,
    averageSize: totalSize / jsResources.length,
  };
}

// メモリ使用量の監視
export function monitorMemoryUsage() {
  if (typeof window === 'undefined' || !('memory' in performance)) return null;

  const memory = (performance as any).memory;
  return {
    usedJSHeapSize: memory.usedJSHeapSize,
    totalJSHeapSize: memory.totalJSHeapSize,
    jsHeapSizeLimit: memory.jsHeapSizeLimit,
    usagePercentage: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100,
  };
}

// パフォーマンス警告の生成
export function generatePerformanceWarnings(metrics: PerformanceMetrics): string[] {
  const warnings: string[] = [];

  // 安全な数値チェック
  const safeCheck = (value: number | undefined, threshold: number, message: string) => {
    if (value !== undefined && value !== null && !isNaN(value) && value > threshold) {
      warnings.push(message);
    }
  };

  safeCheck(metrics.fcp, 1800, 'FCP (First Contentful Paint) が1800msを超えています。画像の最適化を検討してください。');
  safeCheck(metrics.lcp, 2500, 'LCP (Largest Contentful Paint) が2500msを超えています。メインコンテンツの読み込みを最適化してください。');
  safeCheck(metrics.fid, 100, 'FID (First Input Delay) が100msを超えています。JavaScriptの実行を最適化してください。');
  safeCheck(metrics.cls, 0.1, 'CLS (Cumulative Layout Shift) が0.1を超えています。レイアウトの安定性を改善してください。');
  safeCheck(metrics.ttfb, 600, 'TTFB (Time to First Byte) が600msを超えています。サーバーサイドの応答時間を改善してください。');

  return warnings;
}

// TTFB詳細分析
export function analyzeTTFB(): {
  navigationTiming: any;
  resourceTiming: any[];
  recommendations: string[];
} {
  if (typeof window === 'undefined') {
    return { navigationTiming: null, resourceTiming: [], recommendations: [] };
  }

  const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
  const resourceEntries = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
  
  const recommendations: string[] = [];
  
  if (navigationEntry) {
    const ttfb = navigationEntry.responseStart - navigationEntry.requestStart;
    const dns = navigationEntry.domainLookupEnd - navigationEntry.domainLookupStart;
    const tcp = navigationEntry.connectEnd - navigationEntry.connectStart;
    const ssl = navigationEntry.connectEnd - navigationEntry.secureConnectionStart;
    
    if (ttfb > 600) {
      recommendations.push(`TTFBが${ttfb.toFixed(0)}msで目標値600msを超過しています`);
      
      if (dns > 100) {
        recommendations.push(`DNS解決時間が${dns.toFixed(0)}msで長いです（目標: 100ms以下）`);
      }
      
      if (tcp > 200) {
        recommendations.push(`TCP接続時間が${tcp.toFixed(0)}msで長いです（目標: 200ms以下）`);
      }
      
      if (ssl > 100) {
        recommendations.push(`SSL接続時間が${ssl.toFixed(0)}msで長いです（目標: 100ms以下）`);
      }
    }
  }
  
  // リソース読み込みの分析
  const slowResources = resourceEntries
    .filter(resource => resource.responseStart - resource.requestStart > 500)
    .map(resource => ({
      name: resource.name,
      ttfb: resource.responseStart - resource.requestStart,
      size: resource.transferSize || 0
    }))
    .sort((a, b) => b.ttfb - a.ttfb)
    .slice(0, 5);
  
  if (slowResources.length > 0) {
    recommendations.push(`以下のリソースのTTFBが500msを超過: ${slowResources.map(r => `${r.name}(${r.ttfb.toFixed(0)}ms)`).join(', ')}`);
  }
  
  return {
    navigationTiming: navigationEntry,
    resourceTiming: slowResources,
    recommendations
  };
}

// 開発環境でのTTFB改善提案
export function getDevelopmentTTFBRecommendations(): string[] {
  return [
    '🚀 開発環境でのTTFB改善策:',
    '',
    '1. 静的生成（SSG）の活用:',
    '   - 頻繁に更新されないページは静的生成を使用',
    '   - getStaticProps でビルド時にデータを取得',
    '   - ISR（Incremental Static Regeneration）の活用',
    '',
    '2. APIルートの最適化:',
    '   - データベースクエリの最適化',
    '   - インデックスの適切な設定',
    '   - 接続プールの活用',
    '',
    '3. キャッシュ戦略:',
    '   - Redis や Memcached の導入',
    '   - ブラウザキャッシュの活用',
    '   - CDN の導入検討',
    '',
    '4. 画像最適化:',
    '   - WebP/AVIF 形式の使用',
    '   - 適切なサイズでの配信',
    '   - 遅延読み込みの実装',
    '',
    '5. 本番環境での期待値:',
    '   - Vercel: 100-300ms',
    '   - CDN経由: 50-150ms',
    '   - Edge Computing: 50-100ms'
  ];
}

// パフォーマンスデータのログ出力
export function logPerformanceData(metrics: PerformanceMetrics) {
  console.group('🚀 Performance Metrics');
  
  // 安全な数値処理
  const safeNumber = (value: number | undefined, decimals: number = 2) => {
    if (value === undefined || value === null || isNaN(value)) {
      return 'N/A';
    }
    return value.toFixed(decimals);
  };
  
  console.log(`FCP: ${safeNumber(metrics.fcp)}ms`);
  console.log(`LCP: ${safeNumber(metrics.lcp)}ms`);
  console.log(`FID: ${safeNumber(metrics.fid)}ms`);
  console.log(`CLS: ${safeNumber(metrics.cls, 3)}`);
  console.log(`TTFB: ${safeNumber(metrics.ttfb)}ms`);
  
  // TTFB詳細分析
  const ttfbAnalysis = analyzeTTFB();
  if (ttfbAnalysis.recommendations.length > 0) {
    console.group('🔍 TTFB詳細分析');
    ttfbAnalysis.recommendations.forEach(rec => console.warn(rec));
    
    // 開発環境の場合、詳細な改善提案を表示
    if (process.env.NODE_ENV === 'development') {
      console.group('📋 開発環境でのTTFB改善提案');
      getDevelopmentTTFBRecommendations().forEach(rec => console.log(rec));
      console.groupEnd();
    }
    
    console.groupEnd();
  }
  
  const warnings = generatePerformanceWarnings(metrics);
  if (warnings.length > 0) {
    console.warn('⚠️ Performance Warnings:');
    warnings.forEach(warning => console.warn(warning));
  }
  
  console.groupEnd();
}

// 型定義の補完
interface PerformanceEventTiming extends PerformanceEntry {
  processingStart: number;
  processingEnd: number;
  target?: EventTarget;
}

interface LayoutShift extends PerformanceEntry {
  value: number;
  hadRecentInput: boolean;
  lastInputTime: number;
}
