export const dynamic = "force-dynamic";
import { redirect } from "next/navigation"
import { createServerSupabaseClient } from "@/lib/supabase-server"
import PostsList from "../../../components/admin/PostsList"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default async function PostsPage() {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  return (
    <div>
      {/* ページヘッダー */}
      <section className="page-header">
        <div className="container-custom">
          <div className="flex flex-col items-center">
            <Link 
              href="/admin" 
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4 self-start"
            >
              <ArrowLeft size={15} />
              <span>ダッシュボードに戻る</span>
            </Link>
            <div className="w-full">
              <h1 className="page-title">記事管理</h1>
              <p className="page-subtitle">
                投稿した記事の一覧と管理
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 記事一覧 */}
      <section className="section-padding">
        <div className="container-custom">
          <PostsList />
        </div>
      </section>
    </div>
  )
} 