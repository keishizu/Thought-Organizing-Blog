import './globals.css';
import type { Metadata } from 'next';
import Layout from '@/components/layout/Layout';

export const metadata: Metadata = {
  title: '静かな図書室 - 思考を言葉に、前へ進むヒントを',
  description: '悩みやモヤモヤを整理するための、静かな図書室です。内省と気づきを通じて、あなたの思考を言葉にするお手伝いをします。',
  keywords: '内省, 思考, 気づき, 日常, キャリア, ブログ',
  authors: [{ name: '静かな図書室' }],
  openGraph: {
    title: '静かな図書室',
    description: '思考を言葉に、前へ進むヒントを。悩みやモヤモヤを整理するための、静かな図書室です。',
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