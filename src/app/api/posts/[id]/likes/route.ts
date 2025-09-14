import { NextResponse } from "next/server";
import { createServerSupabaseClient } from '@/lib/supabase-server';

// GET: 投稿のいいね数を取得
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: postId } = await params;
    
    if (!postId) {
      return NextResponse.json(
        { error: "Missing postId" },
        { status: 400 }
      );
    }

    const supabase = await createServerSupabaseClient();
    
    // 投稿のいいね数を取得
    const { data: post, error: fetchError } = await supabase
      .from('posts')
      .select('likes')
      .eq('id', postId)
      .single();

    if (fetchError) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Error fetching post likes count:", fetchError);
      }
      return NextResponse.json(
        { error: "Post not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      likeCount: post.likes || 0 
    });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error("Error getting like count:", error);
    }
    return NextResponse.json(
      { error: "Internal Server Error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
} 