'use client';

import React, { useState, useEffect } from 'react';
import { Heart, MessageCircle, Lock } from 'lucide-react';
import Button from '@/components/common/Button';

interface PostInteractionsProps {
  initialLikes: number;
  postId: string;
  allowComments?: boolean;
  allowLikes?: boolean;
}

// 匿名ユーザーIDを生成する関数
function generateAnonymousUserId(): string {
  // ブラウザ環境でのみsessionStorageを使用
  if (typeof window !== 'undefined') {
    let anonymousUserId = sessionStorage.getItem('anonymous_user_id');
    
    if (!anonymousUserId) {
      anonymousUserId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
      sessionStorage.setItem('anonymous_user_id', anonymousUserId);
    }
    
    return anonymousUserId;
  }
  
  // サーバーサイドの場合は一時的なIDを生成
  return `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export default function PostInteractions({ 
  initialLikes, 
  postId,
  allowComments = true, 
  allowLikes = true 
}: PostInteractionsProps) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(initialLikes);
  const [comment, setComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [anonymousUserId, setAnonymousUserId] = useState<string>('');

  // クライアントサイドでのみanonymousUserIdを設定
  useEffect(() => {
    setAnonymousUserId(generateAnonymousUserId());
  }, []);

  // 初期状態でいいね状態を確認
  useEffect(() => {
    if (!anonymousUserId) return;

    const checkLikeStatus = async () => {
      try {
        const response = await fetch(`/api/likes?postId=${postId}&userId=${anonymousUserId}`);
        if (response.ok) {
          const data = await response.json();
          setLiked(data.isLiked);
        }
      } catch (error) {
        console.error("Error checking like status:", error);
      }
    };

    checkLikeStatus();
  }, [postId, anonymousUserId]);

  const handleLike = async () => {
    if (isLoading || !anonymousUserId) return;
    
    setIsLoading(true);
    
    try {
      if (liked) {
        // いいねを削除
        const response = await fetch("/api/likes", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ postId, userId: anonymousUserId }),
        });

        if (response.ok) {
          const result = await response.json();
          setLiked(false);
          // サーバーから最新のカウントを取得
          if (result.updatedLikeCount !== undefined) {
            setLikeCount(result.updatedLikeCount);
          } else {
            setLikeCount(prev => Math.max(prev - 1, 0));
          }
        } else {
          console.error("Failed to remove like");
        }
      } else {
        // いいねを追加
        const response = await fetch("/api/likes", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ postId, userId: anonymousUserId }),
        });

        if (response.ok) {
          const result = await response.json();
          setLiked(true);
          // サーバーから最新のカウントを取得
          if (result.updatedLikeCount !== undefined) {
            setLikeCount(result.updatedLikeCount);
          } else {
            setLikeCount(prev => prev + 1);
          }
        } else {
          console.error("Failed to add like");
        }
      }
    } catch (error) {
      console.error("Error toggling like:", error);
    } finally {
      setIsLoading(false);
    }
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
              disabled={isLoading || !anonymousUserId}
            >
              <Heart 
                size={16} 
                className={`transition-all duration-300 ${
                  liked 
                    ? "fill-current" 
                    : ""
                }`} 
              />
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