import Link from 'next/link';
import { Calendar, User, Tag } from 'lucide-react';
import ArticleCard from '@/components/blog/ArticleCard';
import PostInteractions from '@/components/blog/PostInteractions';

interface ArticlePreviewProps {
  article: {
    id: string;
    title: string;
    excerpt: string;
    content: string;
    category: string;
    date: string;
    imageUrl?: string;
    likes: number;
    readTime: string;
    tags: string[];
    allowComments?: boolean;
    allowLikes?: boolean;
  };
}

export default function ArticlePreview({ article }: ArticlePreviewProps) {
  return (
    <div>
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
            <span>{article.readTime}</span>
          </div>

          {/* タグ */}
          {article.tags && article.tags.length > 0 && (
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
          )}
        </header>

        {/* 記事本文 */}
        <div className="prose prose-lg max-w-none mb-12">
          <div className="text-gray-700 leading-relaxed space-y-6">
            <p className="text-lg font-medium text-gray-800 leading-relaxed">
              {article.excerpt}
            </p>
            
            {/* HTMLコンテンツを安全に表示 */}
            <div 
              className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />
          </div>
        </div>

        {/* いいね・コメントセクション */}
        <PostInteractions 
          initialLikes={article.likes} 
          postId={article.id}
          allowComments={article.allowComments}
          allowLikes={article.allowLikes}
        />

        {/* 著者紹介 */}
        <div className="card-base p-6 mb-12">
          <div className="flex items-start space-x-4">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
              <User size={24} className="text-gray-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">管理者</h3>
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
    </div>
  );
} 