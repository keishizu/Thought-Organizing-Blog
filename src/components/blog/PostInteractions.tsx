'use client';

import React, { useState } from 'react';
import { Heart, MessageCircle, Lock } from 'lucide-react';
import Button from '@/components/common/Button';

interface PostInteractionsProps {
  initialLikes: number;
  allowComments?: boolean;
  allowLikes?: boolean;
}

export default function PostInteractions({ 
  initialLikes, 
  allowComments = true, 
  allowLikes = true 
}: PostInteractionsProps) {
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
      {/* いいねセクション */}
      {allowLikes && (
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
      )}

      {/* コメントセクション */}
      {allowComments ? (
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
      ) : (
        <div className="card-base p-6 bg-gray-50">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
              <Lock size={20} className="text-gray-500" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-700">コメントは無効化されています</h3>
              <p className="text-sm text-gray-600">
                この記事ではコメント機能が無効になっています
              </p>
            </div>
          </div>
          <p className="text-gray-600 text-sm">
            記事の内容についてご質問やご感想がございましたら、お気軽にお問い合わせください。
          </p>
        </div>
      )}
    </div>
  );
}