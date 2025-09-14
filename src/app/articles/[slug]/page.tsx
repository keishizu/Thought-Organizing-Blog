import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Calendar, User, ArrowLeft, Tag } from 'lucide-react';
import { getPublishedArticleById, getPublishedArticles } from '@/lib/data';
import ArticleCard from '@/components/blog/ArticleCard';
import LikeButton from '@/components/likes/LikeButton';
import CommentSection from '@/components/comments/CommentSection';
import SafeHtmlRenderer from '@/components/common/SafeHtmlRenderer';
import { Metadata } from 'next';

// キャッシュを無効化し、常に最新のデータを取得
export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PostPageProps {
  params: Promise<{
    slug: string;
  }>;
}

// メタデータの生成
export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  try {
    const { slug } = await params;
    const article = await getPublishedArticleById(slug);
    
    if (!article) {
      return {
        title: '図書が見つかりません - 思整図書館',
        description: 'お探しの図書は存在しないか、移動または削除された可能性があります。',
      };
    }

    const baseUrl = 'https://thought-organizing-blog.vercel.app';
    const imageUrl = article.imageUrl || `${baseUrl}/OGP画像.png`;

    return {
      title: `${article.title} - 思整図書館`,
      description: article.excerpt || `${article.title}について詳しく解説しています。`,
      keywords: [...article.tags, article.category, '思考整理', '内省', '気づき'].join(', '),
      authors: [{ name: '思整図書館' }],
      openGraph: {
        title: article.title,
        description: article.excerpt || `${article.title}について詳しく解説しています。`,
        type: 'article',
        locale: 'ja_JP',
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: article.title,
          },
        ],
        publishedTime: article.date,
        authors: ['思整図書館'],
        tags: article.tags,
      },
      twitter: {
        card: 'summary_large_image',
        title: article.title,
        description: article.excerpt || `${article.title}について詳しく解説しています。`,
        images: [imageUrl],
      },
      alternates: {
        canonical: `${baseUrl}/articles/${slug}`,
      },
    };
  } catch (error) {
    return {
      title: '図書詳細 - 思整図書館',
      description: '図書の詳細情報を表示しています。',
    };
  }
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

    // 構造化データ（JSON-LD）の生成
    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: article.title,
      description: article.excerpt,
      image: article.imageUrl || 'https://thought-organizing-blog.vercel.app/OGP画像.png',
      author: {
        '@type': 'Organization',
        name: '思整図書館',
        url: 'https://thought-organizing-blog.vercel.app'
      },
      publisher: {
        '@type': 'Organization',
        name: '思整図書館',
        logo: {
          '@type': 'ImageObject',
          url: 'https://thought-organizing-blog.vercel.app/logo/logo2.svg'
        }
      },
      datePublished: article.date,
      dateModified: article.date,
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': `https://thought-organizing-blog.vercel.app/articles/${slug}`
      },
      articleSection: article.category,
      keywords: article.tags.join(', '),
      wordCount: article.content ? article.content.length : 0,
      timeRequired: article.readTime
    };

    return (
      <div>
        {/* 構造化データの埋め込み */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData)
          }}
        />
        
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
                <SafeHtmlRenderer 
                  html={article.content}
                  className=""
                />
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

          {/* 関連図書 */}
          {relatedArticles.length > 0 && (
            <section className="mt-16">
              <h2 className="text-2xl font-bold mb-8">関連する図書</h2>
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
            </section>
          )}
        </article>
      </div>
    );
  } catch (error) {
    console.error('図書ページの読み込みエラー:', error);
    notFound();
  }
}
