import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Calendar, User, ArrowLeft, Tag } from 'lucide-react';
import { getPublishedArticleById, getPublishedArticles } from '@/lib/data';
import ArticleCard from '@/components/blog/ArticleCard';
import LikeButton from '@/components/likes/LikeButton';
import CommentSection from '@/components/comments/CommentSection';

// キャッシュを無効化し、常に最新のデータを取得
export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PostPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function PostPage({ params }: PostPageProps) {
  try {
    const { slug } = await params;
    const article = await getPublishedArticleById(slug);
    
    if (!article) {
      console.error(`図書が見つかりません: ${slug}`);
      notFound();
    }

    const allArticles = await getPublishedArticles();
    const relatedArticles = allArticles
      .filter(a => a.id !== article.id && a.category === article.category)
      .slice(0, 3);

    return (
      <div>
        {/* 戻るボタン */}
        <div className="container-custom py-4">
          <Link href="/articles" className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors">
            <ArrowLeft size={20} className="mr-2" />
            図書一覧に戻る
          </Link>
        </div>

        {/* 図書ヘッダー */}
        <article className="container-custom max-w-4xl">
          <header className="mb-8">
            {article.imageUrl && (
              <div className="w-full h-64 md:h-96 rounded-xl overflow-hidden mb-6">
                <img
                  src={article.imageUrl}
                  alt={article.title}
                  className="w-full h-full object-cover rounded-xl"
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

          {/* 図書本文 */}
          <div className="prose prose-lg max-w-none mb-12">
            <div className="text-gray-700 leading-relaxed space-y-6 article-content">
              {article.content && (
                <div dangerouslySetInnerHTML={{ __html: article.content }} />
              )}
            </div>
          </div>

          {/* いいねボタン */}
          {article.allowLikes && (
            <div className="mb-8">
              <LikeButton
                postId={article.id}
                initialLikeCount={article.likes}
              />
            </div>
          )}

          {/* コメントセクション */}
          {article.allowComments && (
            <CommentSection
              postId={article.id}
              initialCommentCount={0}
            />
          )}

          {/* 著者紹介
          <div className="card-base p-6 mb-12">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">管理者</h3>
                <p className="text-gray-600">
                  日々の気づきや内省を通じて、思考を言葉にすることを大切にしています。
                  このサイトが、あなたの思考を整理するきっかけになれば嬉しいです。
                </p>
              </div>
            </div>
          </div> */}
          
          {/* 関連図書 */}
          {relatedArticles.length > 0 && (
            <div className="mb-12">
              <h2 className="text-2xl font-semibold mb-6">関連図書</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedArticles.map((relatedArticle) => (
                  <ArticleCard
                    key={relatedArticle.id}
                    id={relatedArticle.id}
                    title={relatedArticle.title}
                    excerpt={relatedArticle.excerpt}
                    category={relatedArticle.category}
                    date={relatedArticle.date}
                    imageUrl={relatedArticle.imageUrl}
                    likes={relatedArticle.likes}
                    readTime={relatedArticle.readTime}
                  />
                ))}
              </div>
            </div>
          )}
        </article>
      </div>
    );
  } catch (error) {
    console.error('図書ページエラー:', error);
    notFound();
  }
} 