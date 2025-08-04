import { NextResponse } from "next/server";
import { createServerSupabaseClient } from '@/lib/supabase-server';

// 匿名ユーザー名を生成する関数
function generateAnonymousUsername(): string {
  const adjective = '読者';
  const number = Math.floor(Math.random() * 9999) + 1;
  return `${adjective}${number}`;
}

// 管理者かどうかをチェックする関数
async function isAdmin(supabase: any): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    return !!user; // 認証済みユーザーは管理者とみなす
  } catch (error) {
    return false;
  }
}

// POST: コメントの作成
export async function POST(request: Request) {
  try {
    const { postId, username, content } = await request.json();
    
    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: "Comment content is required" },
        { status: 400 }
      );
    }

    const supabase = await createServerSupabaseClient();
    
    // 管理者かどうかをチェック
    const isAdminUser = await isAdmin(supabase);
    const user = isAdminUser ? (await supabase.auth.getUser()).data.user : null;
    const commentUsername = isAdminUser && user ? `👑 ${user.email?.split('@')[0] || '管理者'}` : (username || generateAnonymousUsername());
    
    const { data, error } = await supabase
      .from('comments')
      .insert({
        post_id: postId,
        username: commentUsername,
        content: content.trim(),
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating comment:", error);
      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 }
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Error creating comment:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// GET: コメントの取得
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get("postId");

    if (!postId) {
      return NextResponse.json(
        { error: "Missing postId" },
        { status: 400 }
      );
    }

    const supabase = await createServerSupabaseClient();
    
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('post_id', postId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error("Error fetching comments:", error);
      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 }
      );
    }

    return NextResponse.json(data || []);
  } catch (error) {
    console.error("Error fetching comments:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// DELETE: コメントの削除
export async function DELETE(request: Request) {
  try {
    const { commentId, username } = await request.json();
    
    const supabase = await createServerSupabaseClient();
    
    // 管理者かどうかをチェック
    const isAdminUser = await isAdmin(supabase);
    
    if (isAdminUser) {
      // 管理者は全てのコメントを削除可能
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId);

      if (error) {
        console.error("Error deleting comment:", error);
        return NextResponse.json(
          { error: "Internal Server Error" },
          { status: 500 }
        );
      }

      return NextResponse.json({ deleted: true });
    } else {
      // 一般ユーザーは自分のコメントのみ削除可能
      const anonymousUsername = username || generateAnonymousUsername();
      
      // コメントの所有者を確認
      const { data: comment, error: fetchError } = await supabase
        .from('comments')
        .select('username')
        .eq('id', commentId)
        .single();

      if (fetchError) {
        return NextResponse.json(
          { error: "Comment not found" },
          { status: 404 }
        );
      }

      if (comment.username !== anonymousUsername) {
        return NextResponse.json(
          { error: "Unauthorized" },
          { status: 403 }
        );
      }

      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId);

      if (error) {
        console.error("Error deleting comment:", error);
        return NextResponse.json(
          { error: "Internal Server Error" },
          { status: 500 }
        );
      }

      return NextResponse.json({ deleted: true });
    }
  } catch (error) {
    console.error("Error deleting comment:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
} 