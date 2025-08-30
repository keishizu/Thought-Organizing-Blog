// GTM データレイヤーの型定義
declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

// GTM の設定
export const GTM_ID = 'GTM-5NXSS574';

// データレイヤーにイベントをプッシュ
export const pushToDataLayer = (event: string, data?: any) => {
  if (typeof window !== 'undefined' && window.dataLayer) {
    window.dataLayer.push({
      event,
      ...data,
    });
  }
};

// ページビューイベントを送信
export const trackPageView = (url: string) => {
  pushToDataLayer('page_view', {
    page_location: url,
    page_title: document.title,
  });
};

// カスタムイベントを送信
export const trackEvent = (eventName: string, parameters?: Record<string, any>) => {
  pushToDataLayer(eventName, parameters);
};

// GTM が読み込まれているかチェック
export const isGTMLoaded = (): boolean => {
  return typeof window !== 'undefined' && 
         typeof window.dataLayer !== 'undefined' && 
         Array.isArray(window.dataLayer);
};
