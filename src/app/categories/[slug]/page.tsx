import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import ArticleCard from '@/components/blog/ArticleCard';
import { categories, getPublishedArticlesByCategory } from '@/lib/data';

export async function generateStaticParams() {
  return categories.map((category) => ({
    slug: category.slug,
  }));
}

interface CategoryPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const category = categories.find(cat => cat.slug === slug);
  
  if (!category) {
    notFound();
  }

  const articles = await getPublishedArticlesByCategory(slug);

  return (
    <div>
      {/* ページヘッダー */}
      <section className="page-header">
        <div className="container-custom">
          <h1 className="page-title">{category.name}</h1>
          <p className="page-subtitle">
            {category.description}
          </p>
        </div>
      </section>

      {/* 戻るボタン */}
      <div className="container-custom py-4">
        <Link href="/articles" className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors">
          <ArrowLeft size={20} className="mr-2" />
          記事一覧に戻る
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

              {/* ページネーション（将来的に実装） */}
              <div className="mt-12 text-center">
                <p className="text-gray-600">
                  現在 {articles.length} 件の記事があります
                </p>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">
                このカテゴリにはまだ記事がありません。
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