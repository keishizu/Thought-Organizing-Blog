import './globals.css';
import type { Metadata } from 'next';
import { Suspense } from 'react';
import { headers } from 'next/headers';
import Layout from '@/components/layout/Layout';
import { PerformanceMonitor } from '@/components/common/PerformanceMonitor';
import { ErrorLoggerProvider } from '@/components/common/ErrorLogger';
import { GTMAnalytics } from '@/components/common/analytics/GTMAnalytics';
import { GoogleAnalytics } from '@/components/common/analytics/GoogleAnalytics';
import { NonceProvider } from '@/components/common/NonceProvider';
import { PerformanceMonitorProvider } from '@/components/monitoring/PerformanceMonitorProvider';

// 動的レンダリングを強制（nonceのため）
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NODE_ENV === 'production' 
    ? 'https://thought-organizing-blog.vercel.app' 
    : 'http://localhost:3000'
  ),
  title: '思整図書館 - 思考を整える、静かな空間。',
  description: '思整図書館は、あなたの思考を整えるための静かな空間です。内省・気づき・ことばを通じて、自分らしい選択のヒントを見つけるお手伝いをします。',
  keywords: '思考整理, 内省, 気づき, キャリア, 自己分析, 日常, ブログ',
  authors: [{ name: '思整図書館' }],
  verification: {
    google: '6d5GN1UbWZAhbS8t8eZ3gqAqGgraAFXsmWMYjAGxKmY',
  },
  openGraph: {
    title: '思整図書館 - 思考を整える、静かな空間。',
    description: 'あなたの思考を整えるための静かな空間、思整図書館。内省や気づきをことばにして、自分と向き合うヒントを届けます。',
    type: 'website',
    locale: 'ja_JP',
    images: [
      {
        url: '/OGP画像.png', // metadataBaseを使用して相対パスに変更
        width: 1200,
        height: 630,
        alt: '思整図書館 - 思考を整える、静かな空間。',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '思整図書館 - 思考を整える、静かな空間。',
    description: 'あなたの思考を整えるための静かな空間、思整図書館。内省や気づきをことばにして、自分と向き合うヒントを届けます。',
    images: ['/OGP画像.png'], // metadataBaseを使用して相対パスに変更
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // headersからnonceを取得
  const headersList = await headers();
  const nonce = headersList.get('x-csp-nonce');

  return (
    <html lang="ja">
      <head>
        {/* Google Tag Manager */}
        <script
          nonce={nonce || undefined}
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-5NXSS574');`,
          }}
        />
        {/* End Google Tag Manager */}
        
        {/* DNSプリフェッチ */}
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//fonts.gstatic.com" />
        
        {/* プリロード */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe 
            src="https://www.googletagmanager.com/ns.html?id=GTM-5NXSS574"
            height="0" 
            width="0" 
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>
        {/* End Google Tag Manager (noscript) */}
        
        <NonceProvider nonce={nonce}>
          <PerformanceMonitorProvider>
            <ErrorLoggerProvider>
              <Layout>
                {children}
              </Layout>
              <PerformanceMonitor />
              <Suspense fallback={null}>
                <GTMAnalytics />
              </Suspense>
              <Suspense fallback={null}>
                <GoogleAnalytics />
              </Suspense>
            </ErrorLoggerProvider>
          </PerformanceMonitorProvider>
        </NonceProvider>
      </body>
    </html>
  );
}