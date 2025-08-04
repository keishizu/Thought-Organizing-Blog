import { NextResponse } from "next/server";
import { createServerSupabaseClient } from '@/lib/supabase-server';

// 匿名ユーザーIDを生成する関数（UUID形式）
function generateAnonymousUserId(): string {
  // UUID v4形式で生成
  const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
  return uuid;
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

// POST: いいねの追加
export async function POST(request: Request) {
  try {
    const requestBody = await request.json();
    console.log("POST /api/likes - Raw request body:", requestBody);
    const { postId, userId } = requestBody;
    console.log("POST /api/likes - Parsed data:", { postId, userId });
    
    // リクエストデータの検証
    if (!postId) {
      console.error("Missing postId in request");
      return NextResponse.json(
        { error: "Missing postId" },
        { status: 400 }
      );
    }
    
    if (!userId) {
      console.error("Missing userId in request");
      return NextResponse.json(
        { error: "Missing userId" },
        { status: 400 }
      );
    }
    
    const supabase = await createServerSupabaseClient();
    
    // 管理者かどうかをチェック
    const isAdminUser = await isAdmin(supabase);
    const user = isAdminUser ? (await supabase.auth.getUser()).data.user : null;
    const currentUserId = isAdminUser && user ? user.id : (userId || generateAnonymousUserId());
    
    console.log("User info:", { isAdminUser, currentUserId });
    
    // 既存のいいねをチェック
    const { data: existingLike, error: checkError } = await supabase
      .from('likes')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', currentUserId)
      .single();

    console.log("Checking existing like - Result:", { existingLike, checkError });

    if (existingLike) {
      console.log("User already liked this post");
      return NextResponse.json(
        { error: "Already liked" },
        { status: 400 }
      );
    }

    // 新しいいいねを作成
    const { data, error } = await supabase
      .from('likes')
      .insert({
        post_id: postId,
        user_id: currentUserId,
      })
      .select()
      .single();

    console.log("Creating new like - Result:", { data, error });

    if (error) {
      console.error("Error adding like:", error);
      return NextResponse.json(
        { error: "Internal Server Error", details: error.message },
        { status: 500 }
      );
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
      // いいねの追加は成功しているので、エラーでも成功レスポンスを返す
      return NextResponse.json({ 
        ...data, 
        updatedLikeCount: 0 
      }, { status: 201 });
    }

    const response = { 
      ...data, 
      updatedLikeCount: updatedPost.likes 
    };
    console.log("POST /api/likes - Response:", response);
    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error("Error adding like:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

// DELETE: いいねの削除
export async function DELETE(request: Request) {
  try {
    const requestBody = await request.json();
    console.log("DELETE /api/likes - Raw request body:", requestBody);
    const { postId, userId } = requestBody;
    console.log("DELETE /api/likes - Parsed data:", { postId, userId });
    
    // リクエストデータの検証
    if (!postId) {
      console.error("Missing postId in request");
      return NextResponse.json(
        { error: "Missing postId" },
        { status: 400 }
      );
    }
    
    if (!userId) {
      console.error("Missing userId in request");
      return NextResponse.json(
        { error: "Missing userId" },
        { status: 400 }
      );
    }
    
    const supabase = await createServerSupabaseClient();
    
    // 管理者かどうかをチェック
    const isAdminUser = await isAdmin(supabase);
    const user = isAdminUser ? (await supabase.auth.getUser()).data.user : null;
    const currentUserId = isAdminUser && user ? user.id : (userId || generateAnonymousUserId());
    
    console.log("User info:", { isAdminUser, currentUserId });
    
    // 削除対象のレコードが存在するかチェック
    console.log("Checking for existing like with:", { postId, currentUserId });
    const { data: existingLike, error: checkError } = await supabase
      .from('likes')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', currentUserId)
      .single();

    console.log("Checking existing like for deletion - Result:", { existingLike, checkError });

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116は結果が見つからない場合
      console.error("Error checking existing like:", checkError);
      return NextResponse.json(
        { error: "Internal Server Error", details: checkError.message },
        { status: 500 }
      );
    }

    if (!existingLike) {
      console.log("No like found to delete");
      return NextResponse.json(
        { error: "Like not found" },
        { status: 404 }
      );
    }

    // いいねを削除（複数行が存在する可能性を考慮）
    console.log("Attempting to delete like with:", { postId, currentUserId });
    const { data: deletedLikes, error: deleteError } = await supabase
      .from('likes')
      .delete()
      .eq('post_id', postId)
      .eq('user_id', currentUserId)
      .select();

    console.log("Deleting like - Result:", { deletedLikes, deleteError });

    if (deleteError) {
      console.error("Error removing like:", deleteError);
      return NextResponse.json(
        { error: "Internal Server Error", details: deleteError.message },
        { status: 500 }
      );
    }

    // 削除されたレコードの数を確認
    const deletedCount = deletedLikes ? deletedLikes.length : 0;
    console.log("Deleted likes count:", deletedCount);

    // トリガー関数により自動的にpostsテーブルのlikesカウントが更新される
    // 最新のいいね数を取得
    const { data: updatedPost, error: fetchError } = await supabase
      .from('posts')
      .select('likes')
      .eq('id', postId)
      .single();

    if (fetchError) {
      console.error("Error fetching updated likes count:", fetchError);
      // いいねの削除は成功しているので、エラーでも成功レスポンスを返す
      return NextResponse.json({ 
        deleted: true, 
        updatedLikeCount: 0 
      });
    }

    const response = { 
      deleted: true, 
      updatedLikeCount: updatedPost.likes 
    };
    console.log("DELETE /api/likes - Response:", response);
    return NextResponse.json(response);
  } catch (error) {
    console.error("Error removing like:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

// GET: いいね状態の確認
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get("postId");
    const userId = searchParams.get("userId");

    if (!postId) {
      return NextResponse.json(
        { error: "Missing postId" },
        { status: 400 }
      );
    }

    const supabase = await createServerSupabaseClient();
    
    // 管理者かどうかをチェック
    const isAdminUser = await isAdmin(supabase);
    const user = isAdminUser ? (await supabase.auth.getUser()).data.user : null;
    const currentUserId = isAdminUser && user ? user.id : (userId || generateAnonymousUserId());
    
    const { data, error } = await supabase
      .from('likes')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', currentUserId)
      .single();

    console.log("Checking like status - Result:", { data, error, isLiked: !!data });

    if (error && error.code !== 'PGRST116') { // PGRST116は結果が見つからない場合
      console.error("Error checking like status:", error);
      return NextResponse.json(
        { error: "Database Error", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ isLiked: !!data });
  } catch (error) {
    console.error("Error checking like status:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
} 