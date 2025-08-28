import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import ArticleCard from '@/components/blog/ArticleCard';
import { getPublishedArticles } from '@/lib/data';
import { Metadata } from 'next';

// キャッシュを無効化し、常に最新のデータを取得
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// メタデータの生成
export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = 'https://thought-organizing-blog.vercel.app';
  
  return {
    title: '図書一覧 - 思整図書館',
    description: '思整図書館の図書一覧です。思考整理、内省、気づきに関する様々な図書をお楽しみください。',
    keywords: '図書一覧, 思考整理, 内省, 気づき, キャリア, 自己分析, 日常, ブログ',
    authors: [{ name: '思整図書館' }],
    openGraph: {
      title: '図書一覧 - 思整図書館',
      description: '思整図書館の図書一覧です。思考整理、内省、気づきに関する様々な図書をお楽しみください。',
      type: 'website',
      locale: 'ja_JP',
      images: [
        {
          url: `${baseUrl}/OGP画像.png`,
          width: 1200,
          height: 630,
          alt: '思整図書館 図書一覧',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: '図書一覧 - 思整図書館',
      description: '思整図書館の図書一覧です。思考整理、内省、気づきに関する様々な図書をお楽しみください。',
      images: [`${baseUrl}/OGP画像.png`],
    },
    alternates: {
      canonical: `${baseUrl}/articles`,
    },
  };
}

export default async function ArticlesPage() {
  const articles = await getPublishedArticles();
  return (
    <div>
      {/* ページヘッダー */}
      <section className="page-header">
        <div className="container-custom">
          <h1 className="page-title">図書一覧</h1>
        </div>
      </section>

      {/* 戻るボタン */}
      <div className="container-custom py-4">
        <Link href="/" className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors">
          <ArrowLeft size={20} className="mr-2" />
          ホームに戻る
        </Link>
      </div>

      {/* 図書一覧 */}
      <section className="section-padding">
        <div className="container-custom">
          {articles.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {articles.map((article) => (
                  <ArticleCard
                    key={article.id}
                    id={article.id}
                    title={article.title}
                    excerpt={article.excerpt}
                    category={article.category}
                    date={article.date}
                    imageUrl={article.imageUrl}
                    likes={article.likes}
                    readTime={article.readTime}
                  />
                ))}
              </div>

              {/* 図書数表示 */}
              <div className="mt-12 text-center">
                <p className="text-gray-600">
                  現在 {articles.length} 件の図書があります
                </p>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">
                まだ図書がありません。
              </p>
              <p className="text-gray-500 mt-2">
                新しい図書をお楽しみに。
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
} 