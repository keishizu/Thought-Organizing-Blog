'use client';

import Script from 'next/script';
import { useNonce } from '@/components/common/NonceProvider';

const GA_TRACKING_ID = 'G-DJ9V9LYWN6';

export function GoogleAnalytics() {
  const nonce = useNonce();

  return (
    <>
      {/* Google Analytics gtag.js */}
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
        strategy="afterInteractive"
        nonce={nonce}
      />
      <Script
        id="google-analytics-config"
        strategy="afterInteractive"
        nonce={nonce}
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_TRACKING_ID}');
          `,
        }}
      />
    </>
  );
}
