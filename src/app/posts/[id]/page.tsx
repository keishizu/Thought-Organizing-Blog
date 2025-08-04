import { notFound } from "next/navigation";
import { createServerSupabaseClient } from '@/lib/supabase-server';
import LikeButton from "@/components/likes/LikeButton";
import CommentSection from "@/components/comments/CommentSection";

interface PostPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function PostPage({ params }: PostPageProps) {
  const resolvedParams = await params;
  const postId = resolvedParams.id;

  if (!postId) {
    notFound();
  }

  const supabase = await createServerSupabaseClient();

  // 投稿データを取得
  const { data: post, error } = await supabase
    .from('posts')
    .select(`
      *,
      comments:comments(count),
      likes:likes(count)
    `)
    .eq('id', postId)
    .single();

  if (error || !post) {
    notFound();
  }

  // コメント数を取得
  const { count: commentCount } = await supabase
    .from('comments')
    .select('*', { count: 'exact', head: true })
    .eq('post_id', postId);

  // いいね数を取得
  const { count: likeCount } = await supabase
    .from('likes')
    .select('*', { count: 'exact', head: true })
    .eq('post_id', postId);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* 投稿ヘッダー */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">{post.title}</h1>
        <div className="flex items-center gap-4 text-gray-600 mb-6">
          <span>投稿日: {new Date(post.created_at || '').toLocaleDateString("ja-JP")}</span>
        </div>
      </div>

      {/* 投稿内容 */}
      <div className="prose max-w-none mb-8">
        <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
          {post.content}
        </div>
      </div>

      {/* いいねボタン */}
      <div className="mb-8">
        <LikeButton
          postId={post.id}
          initialLikeCount={likeCount || 0}
        />
      </div>

      {/* コメントセクション */}
      <CommentSection
        postId={post.id}
        initialCommentCount={commentCount || 0}
      />
    </div>
  );
} 