import { createServerSupabaseClient } from '@/lib/supabase-server';

// 匿名ユーザー名を生成する関数
function generateAnonymousUsername(): string {
  // セッションストレージから既存のユーザー名を取得、なければ新規生成
  if (typeof window !== 'undefined') {
    let anonymousUsername = sessionStorage.getItem('anonymous_username');
    if (!anonymousUsername) {
      const adjective = '読者';
      const number = Math.floor(Math.random() * 9999) + 1;
      anonymousUsername = `${adjective}${number}`;
      sessionStorage.setItem('anonymous_username', anonymousUsername);
    }
    return anonymousUsername;
  }
  return `匿名${Math.floor(Math.random() * 9999) + 1}`;
}

// コメントの作成
export async function createComment(postId: string, content: string, username?: string) {
  try {
    const supabase = await createServerSupabaseClient();
    const anonymousUsername = username || generateAnonymousUsername();
    
    const { data, error } = await supabase
      .from('comments')
      .insert({
        post_id: postId,
        username: anonymousUsername,
        content: content.trim(),
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating comment:", error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Error creating comment:", error);
    throw error;
  }
}

// 投稿のコメント一覧を取得
export async function getComments(postId: string) {
  try {
    const supabase = await createServerSupabaseClient();
    
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('post_id', postId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error("Error fetching comments:", error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error("Error fetching comments:", error);
    throw error;
  }
}

// コメントの削除
export async function deleteComment(commentId: string, username?: string) {
  try {
    const supabase = await createServerSupabaseClient();
    const anonymousUsername = username || generateAnonymousUsername();
    
    // コメントの所有者を確認
    const { data: comment, error: fetchError } = await supabase
      .from('comments')
      .select('username')
      .eq('id', commentId)
      .single();

    if (fetchError) {
      console.error("Error fetching comment:", fetchError);
      throw new Error("Comment not found");
    }

    if (comment.username !== anonymousUsername) {
      throw new Error("Unauthorized");
    }

    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId);

    if (error) {
      console.error("Error deleting comment:", error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error("Error deleting comment:", error);
    throw error;
  }
}

// 投稿のコメント数を取得
export async function getCommentCount(postId: string) {
  try {
    const supabase = await createServerSupabaseClient();
    
    const { count, error } = await supabase
      .from('comments')
      .select('*', { count: 'exact', head: true })
      .eq('post_id', postId);

    if (error) {
      console.error("Error getting comment count:", error);
      throw error;
    }

    return count || 0;
  } catch (error) {
    console.error("Error getting comment count:", error);
    throw error;
  }
} 