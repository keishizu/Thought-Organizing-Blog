import Link from 'next/link';
import { Brain, Compass, Eye } from 'lucide-react';
import ArticleCard from '@/components/blog/ArticleCard';
import CategorySection from '@/components/blog/CategorySection';
import ErrorFallback from '@/components/ui/error-fallback';
import { getPublishedArticles, getRecommendedArticles } from '@/lib/data';

// キャッシュを無効化し、常に最新のデータを取得
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Home() {
  const allArticles = await getPublishedArticles();
  const recentArticles = allArticles.slice(0, 3);
  const recommendedArticles = await getRecommendedArticles();

  const categories = [
    {
      title: '思整術',
      description: '感情や考えを整理し行動に移すための方法の紹介をテーマに、日常に取り入れやすい思考の整理術をお届けします。',
      href: '/categories/thinking-action',
      icon: <Brain size={32} />,
    },
    {
      title: '仕事と分岐点',
      description: '働き方の選択や転機をテーマに、迷いや不安を抱えながらも、自分らしい道を見つけるヒントをお届けします。',
      href: '/categories/career-choice',
      icon: <Compass size={32} />,
    },
    {
      title: '日常と気づき',
      description: '日々の出来事から生まれる小さな気づきをテーマに、忙しい日常の中で自分を見つめ直すキッカケをお届けします。',
      href: '/categories/insights-daily',
      icon: <Eye size={32} />,
    },
  ];

  return (
    <div>
      {/* ヒーローセクション */}
      <section className="hero-section">
        <div className="container-custom">
          <h1 className="hero-title text-balance mb-8">
          思考を整え、次の一歩へ。
          </h1>
          <p className="hero-subtitle mb-12">
          心にかかったモヤや迷いを<br />
          少しずつ言葉に変え、思考を整える。<br />
          あなたが前へ進むためのヒントを、そっとお届けします。
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/about" className="btn-primary">
             思整図書館とは
            </Link>
            <Link href="/articles" className="btn-secondary">
             図書を覗く
            </Link>
          </div>
        </div>
      </section>

      {/* カテゴリー紹介セクション */}
      <section className="section-padding">
        <div className="container-custom">
          <h2 className="section-title">カテゴリーから探す</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {categories.map((category) => (
              <CategorySection
                key={category.title}
                title={category.title}
                description={category.description}
                href={category.href}
                icon={category.icon}
              />
            ))}
          </div>
        </div>
      </section>

      {/* おすすめ図書セクション */}
      {recommendedArticles.length > 0 && (
        <section className="section-padding bg-gray-50">
          <div className="container-custom">
            <h2 className="section-title">おすすめ図書</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {recommendedArticles.map((article) => (
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
          </div>
        </section>
      )}

      {/* 最新図書セクション */}
      {recentArticles.length > 0 && (
        <section className="section-padding">
          <div className="container-custom">
            <div className="flex items-center justify-between mb-8">
              <h2 className="section-title">最新図書</h2>
              <Link href="/articles" className="text-primary hover:underline font-medium">
                すべての図書を見る →
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {recentArticles.map((article) => (
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
          </div>
        </section>
      )}
    </div>
  );
}