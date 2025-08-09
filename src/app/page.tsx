import Link from 'next/link';
import { Brain, Compass, Eye } from 'lucide-react';
import ArticleCard from '@/components/blog/ArticleCard';
import CategorySection from '@/components/blog/CategorySection';
import { getPublishedArticles, getRecommendedArticles } from '@/lib/data';

// 動的レンダリングを明示的に指定
export const dynamic = 'force-dynamic';

export default async function Home() {
  const allArticles = await getPublishedArticles();
  const recentArticles = allArticles.slice(0, 3);
  const recommendedArticles = await getRecommendedArticles();

  const categories = [
    {
      title: '思考と行動',
      description: '日々の選択や決断について立ち止まって考える。自分の価値観や行動パターンを見つめ直すきっかけに。',
      href: '/categories/thinking-action',
      icon: <Brain size={32} />,
    },
    {
      title: 'キャリアと選択',
      description: '仕事や人生の方向性について。迷いながらも前に進む、そんな体験談や気づきを綴ります。',
      href: '/categories/career-choice',
      icon: <Compass size={32} />,
    },
    {
      title: '気づきと日常',
      description: '何気ない日常の中に隠れている小さな発見や学び。ふとした瞬間の美しさを言葉にして。',
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
        <section className="section-padding" style={{background: 'linear-gradient(135deg, #FAF9F7 0%, #F5F3F0 100%)'}}>
          <div className="container-custom">
            <h2 className="section-title">おすすめの図書</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
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
            <div className="text-center">
              <Link href="/articles" className="btn-secondary">
                すべての図書を見る
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* 新着図書セクション */}
      <section id="recent-articles" className="section-padding">
        <div className="container-custom">
          <h2 className="section-title">新着図書</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-12">
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
          <div className="text-center">
            <Link href="/articles" className="btn-secondary">
              新着図書をもっと見る
            </Link>
          </div>
        </div>
      </section>

      {/* CTA セクション */}
      <section className="section-padding" style={{background: 'linear-gradient(135deg, #FAF9F7 0%, #F0EDE8 100%)'}}>
        <div className="container-custom text-center">
          <h2 className="section-title">一緒に考えてみませんか？</h2>
          <p className="text-lg text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">
            このサイトが、あなたの思考を整理し、新しい気づきを得るきっかけになれば嬉しいです。
            何かご感想やご質問がありましたら、お気軽にお声がけください。
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/about" className="btn-primary">
              私について知る
            </Link>
            <Link href="/contact" className="btn-secondary">
              お問い合わせ
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}