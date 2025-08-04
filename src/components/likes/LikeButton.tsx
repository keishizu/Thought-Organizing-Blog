"use client";

import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { LikeStatus } from "@/types/like";

interface LikeButtonProps {
  postId: string;
  initialLikeCount: number;
  userId?: string;
}

// 匿名ユーザーIDを生成する関数（UUID形式）
function generateAnonymousUserId(): string {
  // ブラウザ環境でのみsessionStorageを使用
  if (typeof window !== 'undefined') {
    // 既存のセッションストレージから取得を試行
    let anonymousUserId = sessionStorage.getItem('anonymous_user_id');
    
    // セッションストレージにIDがない場合は新規生成
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

export default function LikeButton({ postId, initialLikeCount, userId }: LikeButtonProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [isLoading, setIsLoading] = useState(false);
  const [anonymousUserId, setAnonymousUserId] = useState<string>('');

  // クライアントサイドでのみanonymousUserIdを設定
  useEffect(() => {
    setAnonymousUserId(userId || generateAnonymousUserId());
  }, [userId]);

  // 初期状態でいいね状態とカウントを確認
  useEffect(() => {
    if (!anonymousUserId) return;

    const checkLikeStatus = async () => {
      try {
        console.log("Checking initial like status for:", { postId, anonymousUserId });
        const response = await fetch(`/api/likes?postId=${postId}&userId=${anonymousUserId}`);
        if (response.ok) {
          const data: LikeStatus = await response.json();
          console.log("Initial like status:", data);
          setIsLiked(data.isLiked);
          
          // サーバーから最新のいいね数を取得
          const countResponse = await fetch(`/api/posts/${postId}/likes`);
          if (countResponse.ok) {
            const countData = await countResponse.json();
            console.log("Initial like count:", countData);
            setLikeCount(countData.likeCount || initialLikeCount);
          } else {
            console.log("Using initial like count:", initialLikeCount);
            setLikeCount(initialLikeCount);
          }
        } else {
          console.error("Failed to check initial like status:", response.status, response.statusText);
        }
      } catch (error) {
        console.error("Error checking like status:", error);
      }
    };

    checkLikeStatus();
  }, [postId, anonymousUserId, initialLikeCount]);

  const handleLikeToggle = async () => {
    if (isLoading || !anonymousUserId) return;
    
    setIsLoading(true);
    
    try {
      if (isLiked) {
        // いいねを削除
        const requestData = { postId, userId: anonymousUserId };
        console.log("Sending DELETE request with data:", requestData);
        const response = await fetch("/api/likes", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestData),
        });

        if (response.ok) {
          const result = await response.json();
          console.log("DELETE /api/likes - Response received:", result);
          setIsLiked(false);
          // サーバーから最新のカウントを取得
          if (result.updatedLikeCount !== undefined) {
            console.log("Setting like count to:", result.updatedLikeCount);
            setLikeCount(result.updatedLikeCount);
          } else {
            console.log("No updatedLikeCount in response, fetching from server");
            // サーバーから最新のカウントを再取得
            const countResponse = await fetch(`/api/posts/${postId}/likes`);
            if (countResponse.ok) {
              const countData = await countResponse.json();
              console.log("Fetched updated like count:", countData);
              setLikeCount(countData.likeCount || 0);
            } else {
              console.log("Using fallback count");
              setLikeCount(prev => Math.max(prev - 1, 0));
            }
          }
        } else {
          console.error("Failed to remove like - Status:", response.status, response.statusText);
          console.error("Request data:", { postId, userId: anonymousUserId });
          console.error("Request data types:", { 
            postIdType: typeof postId, 
            userIdType: typeof anonymousUserId,
            postIdValue: postId,
            userIdValue: anonymousUserId
          });
          const errorData = await response.json().catch((parseError) => {
            console.error("Failed to parse error response:", parseError);
            return { parseError: parseError.message };
          });
          console.error("Failed to remove like - Error data:", errorData);
          console.error("Response headers:", Object.fromEntries(response.headers.entries()));
          
          // 削除エラーの場合、状態を更新
          if (errorData.error) {
            console.log("Remove like error - updating state to false");
            setIsLiked(false);
            
            // "Like not found"エラーの場合、特別な処理
            if (errorData.error === "Like not found") {
              console.log("Like not found - already not liked");
            }
            
            // サーバーの状態を再確認
            try {
              const checkResponse = await fetch(`/api/likes?postId=${postId}&userId=${anonymousUserId}`);
              if (checkResponse.ok) {
                const checkData = await checkResponse.json();
                console.log("Re-checking like status after delete error:", checkData);
                setIsLiked(checkData.isLiked);
              }
            } catch (checkError) {
              console.error("Error re-checking like status after delete error:", checkError);
            }
          }
        }
      } else {
        // いいねを追加
        const requestData = { postId, userId: anonymousUserId };
        console.log("Sending POST request with data:", requestData);
        const response = await fetch("/api/likes", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestData),
        });

        if (response.ok) {
          const result = await response.json();
          console.log("POST /api/likes - Response received:", result);
          setIsLiked(true);
          // サーバーから最新のカウントを取得
          if (result.updatedLikeCount !== undefined) {
            console.log("Setting like count to:", result.updatedLikeCount);
            setLikeCount(result.updatedLikeCount);
          } else {
            console.log("No updatedLikeCount in response, fetching from server");
            // サーバーから最新のカウントを再取得
            const countResponse = await fetch(`/api/posts/${postId}/likes`);
            if (countResponse.ok) {
              const countData = await countResponse.json();
              console.log("Fetched updated like count:", countData);
              setLikeCount(countData.likeCount || 0);
            } else {
              console.log("Using fallback count");
              setLikeCount(prev => prev + 1);
            }
          }
        } else {
          console.error("Failed to add like - Status:", response.status, response.statusText);
          console.error("Request data:", { postId, userId: anonymousUserId });
          console.error("Request data types:", { 
            postIdType: typeof postId, 
            userIdType: typeof anonymousUserId,
            postIdValue: postId,
            userIdValue: anonymousUserId
          });
          const errorData = await response.json().catch((parseError) => {
            console.error("Failed to parse error response:", parseError);
            return { parseError: parseError.message };
          });
          console.error("Failed to add like - Error data:", errorData);
          console.error("Response headers:", Object.fromEntries(response.headers.entries()));
          
          // "Already liked"エラーの場合、状態を更新
          if (errorData.error === "Already liked") {
            console.log("Already liked - updating state to true");
            setIsLiked(true);
            
            // サーバーの状態を再確認
            try {
              const checkResponse = await fetch(`/api/likes?postId=${postId}&userId=${anonymousUserId}`);
              if (checkResponse.ok) {
                const checkData = await checkResponse.json();
                console.log("Re-checking like status:", checkData);
                setIsLiked(checkData.isLiked);
              }
            } catch (checkError) {
              console.error("Error re-checking like status:", checkError);
            }
          }
        }
      }
    } catch (error) {
      console.error("Error toggling like:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mb-8">
      <button
        onClick={handleLikeToggle}
        disabled={isLoading || !anonymousUserId}
        className={`group relative flex items-center gap-3 px-6 py-3 rounded-full ${
          isLiked
            ? "bg-gradient-to-r from-pink-500 to-red-500 text-white shadow-lg shadow-pink-500/25"
            : "bg-white text-gray-700 border-2 border-gray-200 hover:border-pink-300 hover:shadow-md"
        } ${isLoading ? "opacity-50 cursor-not-allowed" : "hover:shadow-lg"}`}
        aria-label={isLiked ? "いいねを削除" : "いいねを追加"}
      >
        <div>
          <Heart className={`w-6 h-6 ${
            isLiked 
              ? "fill-current text-white" 
              : "text-gray-700 group-hover:text-pink-500"
          }`} />
        </div>
        <span className={`font-semibold text-lg ${
          isLiked ? "text-white" : "text-gray-700"
        }`}>
          {likeCount}
        </span>
      </button>
    </div>
  );
} 