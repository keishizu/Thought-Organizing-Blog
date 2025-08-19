export const dynamic = "force-dynamic";
import { redirect } from "next/navigation"
import { createServerSupabaseClient } from "@/lib/supabase-server"
import EditPostForm from "@/components/admin/EditPostForm"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

interface EditPostPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function EditPostPage({ params }: EditPostPageProps) {
  const { id } = await params
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // 図書データを取得
  const { data: post, error } = await supabase
    .from('posts')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !post) {
    redirect("/admin/posts")
  }

  // 図書の所有者チェック
  if (post.author_id !== user.id) {
    redirect("/admin/posts")
  }

  return (
    <div>
      {/* ページヘッダー */}
      <section className="page-header">
        <div className="container-custom">
          <div className="flex flex-col items-center">
            <Link 
              href="/admin/posts" 
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4 self-start"
            >
              <ArrowLeft size={15} />
              <span>図書一覧に戻る</span>
            </Link>
            <div className="w-full">
              <h1 className="page-title">図書編集</h1>
              <p className="page-subtitle">
                図書の内容を編集しましょう
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 編集フォーム */}
      <section className="section-padding">
        <div className="container-custom max-w-5xl">
          <div className="card-base p-8">
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
              </div>
            </div>
            <EditPostForm postId={id} initialPost={post} />
          </div>
        </div>
      </section>
    </div>
  )
} 