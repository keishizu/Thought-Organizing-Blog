import './globals.css';
import type { Metadata } from 'next';
import Layout from '@/components/layout/Layout';

export const metadata: Metadata = {
  title: '思整図書館 - 思考を整える、静かな空間。',
  description: '思整図書館は、あなたの思考を整えるための静かな空間です。内省・気づき・ことばを通じて、自分らしい選択のヒントを見つけるお手伝いをします。',
  keywords: '思考整理, 内省, 気づき, キャリア, 自己分析, 日常, ブログ',
  authors: [{ name: '思整図書館' }],
  openGraph: {
    title: '思整図書館 - 思考を整える、静かな空間。',
    description: 'あなたの思考を整えるための静かな空間、思整図書館。内省や気づきをことばにして、自分と向き合うヒントを届けます。',
    type: 'website',
    locale: 'ja_JP',
  },
};


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>
        <Layout>
          {children}
        </Layout>
      </body>
    </html>
  );
}