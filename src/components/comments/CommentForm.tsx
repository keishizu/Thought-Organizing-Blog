"use client";

import { useState } from "react";
import { Send, User, Sparkles } from "lucide-react";
import { Comment } from "@/types/comment";

interface CommentFormProps {
  postId: string;
  userId?: string;
  onCommentAdded: (comment: Comment) => void;
}

// 匿名ユーザー名を生成する関数
function generateAnonymousUsername(): string {
  let anonymousUsername = sessionStorage.getItem('anonymous_username');
  if (!anonymousUsername) {
    const adjective = '読者';
    const number = Math.floor(Math.random() * 9999) + 1;
    anonymousUsername = `${adjective}${number}`;
    sessionStorage.setItem('anonymous_username', anonymousUsername);
  }
  return anonymousUsername;
}

export default function CommentForm({ postId, userId, onCommentAdded }: CommentFormProps) {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [anonymousUsername] = useState(() => generateAnonymousUsername());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim() || isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          postId,
          username: anonymousUsername,
          content: content.trim(),
        }),
      });

      if (response.ok) {
        const newComment: Comment = await response.json();
        onCommentAdded(newComment);
        setContent("");
      } else {
        const error = await response.json();
        console.error("Error creating comment:", error);
        alert("コメントの投稿に失敗しました。");
      }
    } catch (error) {
      console.error("Error creating comment:", error);
      alert("コメントの投稿に失敗しました。");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
          <User className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">コメントを投稿</h3>
          <p className="text-sm text-gray-600">あなたの感想をお聞かせください</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="この記事について感じたことをお聞かせください..."
            className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 resize-none text-gray-700 placeholder-gray-400"
            rows={4}
            disabled={isSubmitting}
            required
          />
          <div className="absolute bottom-3 right-3">
            <Sparkles className="w-4 h-4 text-gray-400" />
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>投稿者: {anonymousUsername}</span>
          </div>
          
          <button
            type="submit"
            disabled={!content.trim() || isSubmitting}
            className={`group flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 ${
              content.trim() && !isSubmitting
                ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg hover:shadow-xl"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            <Send className={`w-4 h-4 transition-transform duration-300 ${
              content.trim() && !isSubmitting ? "group-hover:translate-x-1" : ""
            }`} />
            {isSubmitting ? "投稿中..." : "投稿する"}
          </button>
        </div>
      </form>
    </div>
  );
} 