import './globals.css';
import type { Metadata } from 'next';
import Layout from '@/components/layout/Layout';
import { PerformanceMonitor } from '@/components/common/PerformanceMonitor';
import { ErrorLoggerProvider } from '@/components/common/ErrorLogger';

export const metadata: Metadata = {
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
        url: 'https://thought-organizing-blog.vercel.app/OGP画像.png',
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
    images: ['https://thought-organizing-blog.vercel.app/OGP画像.png'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <head>
        {/* DNSプリフェッチ */}
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//fonts.gstatic.com" />
        
        {/* プリロード */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <ErrorLoggerProvider>
          <Layout>
            {children}
          </Layout>
          <PerformanceMonitor />
        </ErrorLoggerProvider>
      </body>
    </html>
  );
}