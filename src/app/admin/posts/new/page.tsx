export const dynamic = "force-dynamic";
import { redirect } from "next/navigation"
import { createServerSupabaseClient } from "@/lib/supabase-server"
import NewPostForm from "../../../../components/admin/NewPostForm"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default async function NewPostPage() {
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
              <h1 className="page-title">新規記事投稿</h1>
              <p className="page-subtitle">
                静かな図書室に新しい物語を紡ぎましょう
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 投稿フォーム */}
      <section className="section-padding">
        <div className="container-custom max-w-5xl">
          <div className="card-base p-8">
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
              </div>
            </div>
            <NewPostForm />
          </div>
        </div>
      </section>
    </div>
  )
} 