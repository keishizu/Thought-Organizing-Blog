'use client';

import React, { useState } from 'react';
import { Heart, MessageCircle } from 'lucide-react';
import Button from '@/components/common/Button';

interface PostInteractionsProps {
  initialLikes: number;
}

export default function PostInteractions({ initialLikes }: PostInteractionsProps) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(initialLikes);
  const [comment, setComment] = useState('');

  const handleLike = () => {
    if (liked) {
      setLikeCount(likeCount - 1);
    } else {
      setLikeCount(likeCount + 1);
    }
    setLiked(!liked);
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // ここでコメント送信処理（Supabase等への保存）
    console.log('Comment submitted:', comment);
    setComment('');
    alert('コメントを投稿しました。ありがとうございます！');
  };

  return (
    <div className="border-t border-gray-200 pt-8 mb-12">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Button
            onClick={handleLike}
            variant={liked ? 'primary' : 'secondary'}
            className="flex items-center space-x-2"
          >
            <Heart size={16} className={liked ? 'fill-current' : ''} />
            <span>{likeCount}</span>
          </Button>
        </div>
      </div>

      {/* コメントフォーム */}
      <div className="card-base p-6">
        <h3 className="text-xl font-semibold mb-4 flex items-center">
          <MessageCircle size={20} className="mr-2" />
          この記事について
        </h3>
        <p className="text-gray-600 mb-4">
          ご感想やご意見があれば、お気軽にコメントしてください。
        </p>
        <form onSubmit={handleCommentSubmit}>
          <div className="form-group">
            <label htmlFor="comment" className="form-label">
              コメント
            </label>
            <textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="form-textarea"
              placeholder="この記事について感じたことをお聞かせください..."
              required
            />
          </div>
          <Button type="submit" variant="primary">
            コメントを投稿
          </Button>
        </form>
      </div>
    </div>
  );
}