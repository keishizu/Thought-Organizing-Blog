import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import ArticleCard from '@/components/blog/ArticleCard';
import { getPublishedArticles } from '@/lib/data';

export default async function ArticlesPage() {
  const articles = await getPublishedArticles();
  return (
    <div>
      {/* ページヘッダー */}
      <section className="page-header">
        <div className="container-custom">
          <h1 className="page-title">記事一覧</h1>
          <p className="page-subtitle">
            静かな図書室のすべての記事をご覧いただけます。<br />
            思考と行動、キャリアと選択、気づきと日常の3つのカテゴリから、あなたに響く記事を見つけてください。
          </p>
        </div>
      </section>

      {/* 戻るボタン */}
      <div className="container-custom py-4">
        <Link href="/" className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors">
          <ArrowLeft size={20} className="mr-2" />
          ホームに戻る
        </Link>
      </div>

      {/* 記事一覧 */}
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
                    author={article.author}
                    imageUrl={article.imageUrl}
                    likes={article.likes}
                    readTime={article.readTime}
                  />
                ))}
              </div>

              {/* 記事数表示 */}
              <div className="mt-12 text-center">
                <p className="text-gray-600">
                  現在 {articles.length} 件の記事があります
                </p>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">
                まだ記事がありません。
              </p>
              <p className="text-gray-500 mt-2">
                新しい記事をお楽しみに。
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
} 