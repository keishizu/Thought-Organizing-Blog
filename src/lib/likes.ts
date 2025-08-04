import { createServerSupabaseClient } from '@/lib/supabase-server';

// 匿名ユーザーIDを生成する関数
function generateAnonymousUserId(): string {
  // サーバーサイドではsessionStorageを使用できないため、常に新規生成
  return `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// いいねの追加
export async function addLike(postId: string, userId?: string) {
  try {
    const supabase = await createServerSupabaseClient();
    const anonymousUserId = userId || generateAnonymousUserId();
    
    // 既存のいいねをチェック
    const { data: existingLike } = await supabase
      .from('likes')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', anonymousUserId)
      .single();

    if (existingLike) {
      throw new Error("Already liked");
    }
    
    const { data, error } = await supabase
      .from('likes')
      .insert({
        post_id: postId,
        user_id: anonymousUserId,
      })
      .select()
      .single();

    if (error) {
      console.error("Error adding like:", error);
      throw error;
    }

    // トリガー関数により自動的にpostsテーブルのlikesカウントが更新される
    // 最新のいいね数を取得
    const { data: updatedPost, error: fetchError } = await supabase
      .from('posts')
      .select('likes')
      .eq('id', postId)
      .single();

    if (fetchError) {
      console.error("Error fetching updated likes count:", fetchError);
      // いいねの追加は成功しているので、エラーでもデフォルト値を返す
      return { ...data, updatedLikeCount: 0 };
    }

    return { ...data, updatedLikeCount: updatedPost.likes };
  } catch (error) {
    console.error("Error adding like:", error);
    throw error;
  }
}

// いいねの削除
export async function removeLike(postId: string, userId?: string) {
  try {
    const supabase = await createServerSupabaseClient();
    const anonymousUserId = userId || generateAnonymousUserId();
    
    const { error } = await supabase
      .from('likes')
      .delete()
      .eq('post_id', postId)
      .eq('user_id', anonymousUserId);

    if (error) {
      console.error("Error removing like:", error);
      throw error;
    }

    // トリガー関数により自動的にpostsテーブルのlikesカウントが更新される
    // 最新のいいね数を取得
    const { data: updatedPost, error: fetchError } = await supabase
      .from('posts')
      .select('likes')
      .eq('id', postId)
      .single();

    if (fetchError) {
      console.error("Error fetching updated likes count:", fetchError);
      // いいねの削除は成功しているので、エラーでもデフォルト値を返す
      return { deleted: true, updatedLikeCount: 0 };
    }

    return { deleted: true, updatedLikeCount: updatedPost.likes };
  } catch (error) {
    console.error("Error removing like:", error);
    throw error;
  }
}

// いいね状態の確認
export async function checkLikeStatus(postId: string, userId?: string) {
  try {
    const supabase = await createServerSupabaseClient();
    const anonymousUserId = userId || generateAnonymousUserId();
    
    const { data, error } = await supabase
      .from('likes')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', anonymousUserId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116は結果が見つからない場合
      console.error("Error checking like status:", error);
      throw error;
    }

    return !!data;
  } catch (error) {
    console.error("Error checking like status:", error);
    throw error;
  }
}

// 投稿のいいね数を取得
export async function getLikeCount(postId: string) {
  try {
    const supabase = await createServerSupabaseClient();
    
    const { count, error } = await supabase
      .from('likes')
      .select('*', { count: 'exact', head: true })
      .eq('post_id', postId);

    if (error) {
      console.error("Error getting like count:", error);
      throw error;
    }

    return count || 0;
  } catch (error) {
    console.error("Error getting like count:", error);
    throw error;
  }
} 