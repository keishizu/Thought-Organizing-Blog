"use client";

import { useState, useEffect } from "react";
import { MessageCircle, Send, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { Comment } from "@/types/comment";
import CommentForm from "./CommentForm";
import CommentList from "./CommentList";

interface CommentSectionProps {
  postId: string;
  userId?: string;
  initialCommentCount: number;
}

export default function CommentSection({ postId, userId, initialCommentCount }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentCount, setCommentCount] = useState(initialCommentCount);
  const [isLoading, setIsLoading] = useState(false);
  const [showComments, setShowComments] = useState(false);

  // コメント一覧を取得
  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/comments?postId=${postId}`);
      if (response.ok) {
        const data: Comment[] = await response.json();
        setComments(data);
        setCommentCount(data.length);
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };

  // 初期読み込み
  useEffect(() => {
    if (showComments) {
      fetchComments();
    }
  }, [showComments, postId]);

  // コメント投稿後の処理
  const handleCommentAdded = (newComment: Comment) => {
    setComments(prev => [...prev, newComment]);
    setCommentCount(prev => prev + 1);
  };

  // コメント削除後の処理
  const handleCommentDeleted = (commentId: string) => {
    setComments(prev => prev.filter(comment => comment.id !== commentId));
    setCommentCount(prev => prev - 1);
  };

  return (
    <div className="mt-12 mb-8">
      {/* コメントセクションヘッダー */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-3 px-6 py-4 rounded-xl bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 text-yellow-800 hover:from-yellow-100 hover:to-orange-100 hover:border-yellow-300 transition-colors"
        >
          <div className="relative">
            <MessageCircle className="w-5 h-5 text-yellow-600" />
            {commentCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-yellow-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                {commentCount}
              </span>
            )}
          </div>
          <span className="text-base font-medium">
            {showComments ? "コメントを隠す" : "コメントを見る"}
          </span>
          <div className="ml-2">
            {showComments ? (
              <ChevronUp className="w-5 h-5 text-yellow-600" />
            ) : (
              <ChevronDown className="w-5 h-5 text-yellow-600" />
            )}
          </div>
        </button>
      </div>

      {/* コメント一覧 */}
      {showComments && (
        <div className="mb-8">
          <CommentList
            comments={comments}
            userId={userId}
            onCommentDeleted={handleCommentDeleted}
          />
        </div>
      )}

      {/* コメントフォーム */}
      {showComments && (
        <div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <CommentForm
              postId={postId}
              userId={userId}
              onCommentAdded={handleCommentAdded}
            />
          </div>
        </div>
      )}
    </div>
  );
} 