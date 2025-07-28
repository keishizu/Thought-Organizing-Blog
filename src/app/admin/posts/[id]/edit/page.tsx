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

  // 記事データを取得
  const { data: post, error } = await supabase
    .from('posts')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !post) {
    redirect("/admin/posts")
  }

  // 記事の所有者チェック
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
              <span>記事一覧に戻る</span>
            </Link>
            <div className="w-full">
              <h1 className="page-title">記事編集</h1>
              <p className="page-subtitle">
                記事の内容を編集しましょう
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
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900">記事を編集</h2>
                  <p className="text-gray-600">読者に届けたい想いを形にしましょう</p>
                </div>
              </div>
            </div>
            <EditPostForm postId={id} initialPost={post} />
          </div>
        </div>
      </section>
    </div>
  )
} 