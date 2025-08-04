"use client";

import { useState, useEffect } from "react";
import { Trash2, User, Crown, MessageCircle, Clock } from "lucide-react";
import { Comment } from "@/types/comment";

interface CommentListProps {
  comments: Comment[];
  userId?: string;
  onCommentDeleted: (commentId: string) => void;
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

// 管理者プロフィールのグローバルキャッシュ
let adminProfileCache: { adminName: string; profileImage: string | null } | null = null;
let adminProfileCacheTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5分間キャッシュ

// 管理者かどうかをチェックする関数
async function isAdmin(): Promise<boolean> {
  try {
    const response = await fetch('/api/auth/check');
    const data = await response.json();
    return data.isAdmin || false;
  } catch (error) {
    return false;
  }
}

// 管理者プロフィールを取得する関数（キャッシュ付き）
async function fetchAdminProfile(): Promise<{ adminName: string; profileImage: string | null }> {
  const now = Date.now();
  
  // キャッシュが有効な場合はキャッシュを返す
  if (adminProfileCache && (now - adminProfileCacheTime) < CACHE_DURATION) {
    return adminProfileCache;
  }
  
  try {
    const response = await fetch('/api/admin/profile');
    const data = await response.json();
    
    // キャッシュを更新
    adminProfileCache = data;
    adminProfileCacheTime = now;
    
    return data;
  } catch (error) {
    console.error('Error fetching admin profile:', error);
    return { adminName: "管理者", profileImage: null };
  }
}

export default function CommentList({ comments, userId, onCommentDeleted }: CommentListProps) {
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(null);
  const [anonymousUsername] = useState(() => generateAnonymousUsername());
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [adminProfile, setAdminProfile] = useState<{ adminName: string; profileImage: string | null }>({
    adminName: "管理者",
    profileImage: null
  });
  const [isLoadingAdminProfile, setIsLoadingAdminProfile] = useState(false);

  // 管理者チェックとプロフィール取得（キャッシュ付き）
  useEffect(() => {
    const checkAdminAndFetchProfile = async () => {
      // 既にプロフィールが読み込まれている場合はスキップ
      if (adminProfile.profileImage !== null) return;
      
      const adminStatus = await isAdmin();
      setIsAdminUser(adminStatus);
      
      if (adminStatus && !isLoadingAdminProfile) {
        setIsLoadingAdminProfile(true);
        try {
          const data = await fetchAdminProfile();
          setAdminProfile(data);
        } catch (error) {
          console.error('Error fetching admin profile:', error);
        } finally {
          setIsLoadingAdminProfile(false);
        }
      }
    };
    
    checkAdminAndFetchProfile();
  }, [adminProfile.profileImage, isLoadingAdminProfile]);

  const handleDeleteComment = async (commentId: string) => {
    if (deletingCommentId) return;
    
    setDeletingCommentId(commentId);
    
    try {
      const response = await fetch("/api/comments", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          commentId,
          username: anonymousUsername,
        }),
      });

      if (response.ok) {
        onCommentDeleted(commentId);
      } else {
        const error = await response.json();
        console.error("Error deleting comment:", error);
        alert("コメントの削除に失敗しました。");
      }
    } catch (error) {
      console.error("Error deleting comment:", error);
      alert("コメントの削除に失敗しました。");
    } finally {
      setDeletingCommentId(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // 管理者コメントかどうかをチェック
  const isAdminComment = (username: string) => {
    return username.startsWith('👑');
  };

  if (comments.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <MessageCircle className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">まだコメントがありません</h3>
        <p className="text-gray-500">最初のコメントを投稿してみましょう！</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <MessageCircle className="w-5 h-5 text-blue-500" />
        <h3 className="text-lg font-semibold text-gray-900">コメント一覧</h3>
        <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded-full text-sm font-medium">
          {comments.length}件
        </span>
      </div>
      
      <div className="space-y-4">
        {comments.map((comment) => (
          <div
            key={comment.id}
            className={`group relative rounded-2xl p-6 ${
              isAdminComment(comment.username)
                ? "bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200"
                : "bg-white border border-gray-200"
            }`}
          >
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden ${
                isAdminComment(comment.username)
                  ? "bg-gradient-to-r from-yellow-400 to-orange-400"
                  : "bg-gradient-to-r from-blue-400 to-purple-400"
              }`}>
                {isAdminComment(comment.username) ? (
                  adminProfile.profileImage && !isLoadingAdminProfile ? (
                    <img 
                      src={adminProfile.profileImage} 
                      alt="管理者プロフィール画像" 
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <Crown className="w-6 h-6 text-white" />
                  )
                ) : (
                  <User className="w-6 h-6 text-white" />
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <span className={`font-semibold ${
                    isAdminComment(comment.username)
                      ? "text-yellow-800"
                      : "text-gray-900"
                  }`}>
                    {isAdminComment(comment.username) ? adminProfile.adminName : comment.username}
                  </span>
                  {isAdminComment(comment.username) && (
                    <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-xs font-medium">
                      管理者
                    </span>
                  )}
                  <div className="flex items-center gap-1 text-gray-500 text-sm">
                    <Clock className="w-3 h-3" />
                    {formatDate(comment.created_at)}
                  </div>
                </div>
                
                <div className={`prose prose-sm max-w-none ${
                  isAdminComment(comment.username)
                    ? "text-yellow-900"
                    : "text-gray-700"
                }`}>
                  <p className="whitespace-pre-wrap leading-relaxed">
                    {comment.content}
                  </p>
                </div>
              </div>
              
              {(comment.username === anonymousUsername || isAdminUser) && (
                <button
                  onClick={() => handleDeleteComment(comment.id)}
                  disabled={deletingCommentId === comment.id}
                  className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full"
                  aria-label="コメントを削除"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 