"use client";

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { trackPageView, isGTMLoaded } from '@/lib/gtm';

export function GTMAnalytics() {
  const pathname = usePathname();

  useEffect(() => {
    try {
      // GTM が読み込まれているかチェック
      if (!isGTMLoaded()) {
        return;
      }

      // ルート変更時にページビューを送信
      trackPageView(pathname);
    } catch (error) {
      // エラーが発生してもアプリケーションの動作に影響しないようにする
      console.warn('GTM Analytics error:', error);
    }
  }, [pathname]);

  // このコンポーネントは何もレンダリングしない
  return null;
}
