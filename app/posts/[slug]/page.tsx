import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Calendar, User, ArrowLeft, Tag } from 'lucide-react';
import { getArticleById, getRecommendedArticles, sampleArticles } from '@/lib/data';
import ArticleCard from '@/components/blog/ArticleCard';
import PostInteractions from '@/components/blog/PostInteractions';

export async function generateStaticParams() {
  return sampleArticles.map((article) => ({
    slug: article.id,
  }));
}

interface PostPageProps {
  params: {
    slug: string;
  };
}

export default function PostPage({ params }: PostPageProps) {
  const article = getArticleById(params.slug);
  
  if (!article) {
    notFound();
  }

  const relatedArticles = getRecommendedArticles(3).filter(a => a.id !== article.id);

  return (
    <div>
      {/* 戻るボタン */}
      <div className="container-custom py-4">
        <Link href="/" className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors">
          <ArrowLeft size={20} className="mr-2" />
          記事一覧に戻る
        </Link>
      </div>

      {/* 記事ヘッダー */}
      <article className="container-custom max-w-4xl">
        <header className="mb-8">
          {article.imageUrl && (
            <div className="w-full h-64 md:h-96 rounded-lg overflow-hidden mb-6">
              <img
                src={article.imageUrl}
                alt={article.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          
          <div className="article-card-category inline-block mb-4">
            {article.category}
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold mb-6 leading-tight text-balance">
            {article.title}
          </h1>
          
          <div className="flex flex-wrap items-center gap-6 text-gray-600 mb-6">
            <span className="flex items-center">
              <Calendar size={16} className="mr-2" />
              {article.date}
            </span>
            <span className="flex items-center">
              <User size={16} className="mr-2" />
              {article.author}
            </span>
            <span>{article.readTime}</span>
          </div>

          {/* タグ */}
          <div className="flex flex-wrap gap-2 mb-8">
            {article.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700"
              >
                <Tag size={12} className="mr-1" />
                {tag}
              </span>
            ))}
          </div>
        </header>

        {/* 記事本文 */}
        <div className="prose prose-lg max-w-none mb-12">
          <div className="text-gray-700 leading-relaxed space-y-6">
            <p className="text-lg font-medium text-gray-800 leading-relaxed">
              {article.excerpt}
            </p>
            
            <p>
              この記事では、{article.title.split(' - ')[1] || '人生の大切な気づき'}について、私の体験をもとに考えてみたいと思います。
            </p>
            
            <h2 className="text-2xl font-semibold mt-8 mb-4">はじめに</h2>
            <p>
              毎日を過ごしていると、ふとした瞬間に「あ、これって大切なことかもしれない」と感じることがあります。
              そんな小さな気づきを、今日は皆さんと共有したいと思います。
            </p>
            
            <h2 className="text-2xl font-semibold mt-8 mb-4">体験から学んだこと</h2>
            <p>
              実際に経験してみて初めて分かることがたくさんあります。頭で理解していることと、
              実際に体験することには大きな違いがあるのです。
            </p>
            
            <blockquote className="border-l-4 border-primary pl-4 italic text-gray-700 my-6">
              「経験は最良の教師である」という言葉がありますが、まさにそれを実感する出来事でした。
            </blockquote>
            
            <h2 className="text-2xl font-semibold mt-8 mb-4">これからの展望</h2>
            <p>
              この経験を通じて、今後どのように行動していきたいかを考えてみました。
              小さな変化でも、積み重ねることで大きな違いを生むことができるはずです。
            </p>
            
            <p>
              最後まで読んでいただき、ありがとうございました。
              この記事が、あなたの思考を整理する小さなきっかけになれば嬉しいです。
            </p>
          </div>
        </div>

        {/* いいね・コメントセクション */}
        <PostInteractions initialLikes={article.likes} />

        {/* 著者紹介 */}
        <div className="card-base p-6 mb-12">
          <div className="flex items-start space-x-4">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
              <User size={24} className="text-gray-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">{article.author}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                思考の整理と言葉の力を信じて、日々の気づきを綴っています。
                このサイトが読者の皆さんにとって、新しい視点を得るきっかけになれば嬉しいです。
              </p>
              <Link href="/about" className="text-primary hover:underline text-sm mt-2 inline-block">
                プロフィールを見る
              </Link>
            </div>
          </div>
        </div>
      </article>

      {/* 関連記事 */}
      <section className="section-padding bg-gray-50">
        <div className="container-custom">
          <h2 className="section-title">関連記事</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {relatedArticles.map((relatedArticle) => (
              <ArticleCard
                key={relatedArticle.id}
                id={relatedArticle.id}
                title={relatedArticle.title}
                excerpt={relatedArticle.excerpt}
                category={relatedArticle.category}
                date={relatedArticle.date}
                author={relatedArticle.author}
                imageUrl={relatedArticle.imageUrl}
                likes={relatedArticle.likes}
                readTime={relatedArticle.readTime}
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}