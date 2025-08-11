'use client';

import Link from 'next/link';
import { Calendar, User, Heart } from 'lucide-react';

interface ArticleCardProps {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  imageUrl?: string;
  likes: number;
  readTime: string;
}

export default function ArticleCard({
  id,
  title,
  excerpt,
  category,
  date,
  imageUrl,
  likes,
  readTime,
}: ArticleCardProps) {
  return (
    <Link href={`/articles/${id}`} className="block">
      <article className="article-card group cursor-pointer">
        {imageUrl && (
          <div className="relative overflow-hidden rounded-xl mb-6">
            <img
              src={imageUrl}
              alt={title}
              className="w-full h-48 object-cover rounded-xl group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}
        
        <div className="article-card-category">
          {category}
        </div>
        
        <h3 className="article-card-title mb-3">
          {title}
        </h3>
        
        <p className="article-card-excerpt mb-6">
          {excerpt}
        </p>
        
        <div className="article-card-meta">
          <div className="flex items-center space-x-4">
            <span className="flex items-center space-x-1">
              <Calendar size={14} />
              <span>{date}</span>
            </span>
            <span>{readTime}</span>
          </div>
          
          <div className="flex items-center space-x-1">
            <Heart size={14} />
            <span>{likes}</span>
          </div>
        </div>
      </article>
    </Link>
  );
}