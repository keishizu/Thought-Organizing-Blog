"use client";

import { useEffect, useState } from 'react';
import { measureCoreWebVitals, PerformanceMetrics, analyzeBundleSize, monitorMemoryUsage } from '@/lib/utils/performance';

export function usePerformance() {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [bundleInfo, setBundleInfo] = useState<any>(null);
  const [memoryInfo, setMemoryInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const measurePerformance = async () => {
      try {
        // ページロード完了を待つ
        if (document.readyState === 'loading') {
          document.addEventListener('DOMContentLoaded', async () => {
            // DOMContentLoaded後に少し待ってから測定開始
            setTimeout(async () => {
              await measurePerformance();
            }, 100);
          });
          return;
        }

        // Core Web Vitalsの測定
        const coreMetrics = await measureCoreWebVitals();
        setMetrics(coreMetrics);

        // バンドルサイズの分析
        const bundle = analyzeBundleSize();
        setBundleInfo(bundle);

        // メモリ使用量の監視
        const memory = monitorMemoryUsage();
        setMemoryInfo(memory);

        setIsLoading(false);
      } catch (error) {
        console.error('Performance measurement failed:', error);
        setIsLoading(false);
      }
    };

    // ページロード完了後に測定開始
    if (document.readyState === 'complete') {
      // 少し待ってから測定開始（Core Web Vitalsの安定化を待つ）
      setTimeout(measurePerformance, 500);
    } else {
      window.addEventListener('load', () => {
        // loadイベント後に少し待ってから測定開始
        setTimeout(measurePerformance, 500);
      });
    }
  }, []);

  // 定期的なメモリ監視
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const interval = setInterval(() => {
      const memory = monitorMemoryUsage();
      if (memory) {
        setMemoryInfo(memory);
      }
    }, 10000); // 10秒ごとに更新

    return () => clearInterval(interval);
  }, []);

  return {
    metrics,
    bundleInfo,
    memoryInfo,
    isLoading,
  };
}

// 画像の遅延読み込み用フック
export function useLazyImage(src: string, fallback?: string) {
  const [imageSrc, setImageSrc] = useState(fallback || '');
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!src) return;

    const img = new Image();
    img.src = src;
    
    img.onload = () => {
      setImageSrc(src);
      setIsLoaded(true);
      setError(false);
    };
    
    img.onerror = () => {
      setError(true);
      setIsLoaded(false);
    };

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src]);

  return { imageSrc, isLoaded, error };
}

// スクロールパフォーマンス最適化用フック
export function useScrollOptimization() {
  const [scrollY, setScrollY] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const handleScroll = () => {
      setScrollY(window.scrollY);
      setIsScrolling(true);

      // スクロール停止を検出
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setIsScrolling(false);
      }, 150);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(timeoutId);
    };
  }, []);

  return { scrollY, isScrolling };
}

// リサイズパフォーマンス最適化用フック
export function useResizeOptimization() {
  const [dimensions, setDimensions] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let timeoutId: NodeJS.Timeout;

    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setDimensions({
          width: window.innerWidth,
          height: window.innerHeight,
        });
      }, 250); // デバウンス処理
    };

    window.addEventListener('resize', handleResize, { passive: true });

    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timeoutId);
    };
  }, []);

  return dimensions;
}
