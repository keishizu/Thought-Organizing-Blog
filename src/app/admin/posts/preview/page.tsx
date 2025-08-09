export const dynamic = "force-dynamic";
import { redirect } from "next/navigation"
import { createServerSupabaseClient } from "@/lib/supabase-server"
import ArticlePreview from "../../../../components/admin/ArticlePreview"
import { ArrowLeft, Edit } from "lucide-react"
import Link from "next/link"

interface PreviewPageProps {
  searchParams: Promise<{
    id?: string
    title?: string
    subtitle?: string
    category?: string
    tags?: string
    content?: string
    imageUrl?: string
    allowComments?: string
    allowLikes?: string
  }>
}

export default async function PreviewPage({ searchParams }: PreviewPageProps) {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const params = await searchParams

  // 必須パラメータのチェック
  if (!params.title || !params.content) {
    redirect("/admin/posts")
  }

  // プレビューデータの構築
  const previewData = {
    id: params.id || 'preview',
    title: params.title,
    excerpt: params.subtitle || params.title.substring(0, 100),
    content: params.content,
    category: params.category || 'エッセイ',
    tags: params.tags ? JSON.parse(params.tags) : [],
    imageUrl: params.imageUrl || undefined,
    date: new Date().toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }),
    likes: 0,
    readTime: '約5分',
    allowComments: params.allowComments === 'true',
    allowLikes: params.allowLikes === 'true'
  }

  return (
    <div>
      {/* プレビューヘッダー */}
      <div className="bg-yellow-50 border-b border-yellow-200">
        <div className="container-custom py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link 
                href="/admin/posts" 
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft size={15} />
                <span>図書一覧に戻る</span>
              </Link>
              <div className="h-4 w-px bg-gray-300"></div>
              <span className="text-sm font-medium text-yellow-800 bg-yellow-100 px-3 py-1 rounded-full">
                プレビューモード
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">
                この画面はプレビューです。実際の投稿ではありません。
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 図書プレビュー */}
      <ArticlePreview article={previewData} />
    </div>
  )
} 