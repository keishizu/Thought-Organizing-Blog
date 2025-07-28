'use client'

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { LogOut, User, Settings, FileText, Plus, Shield } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

export default function AdminPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push("/login")
        return
      }
      setUser(user)
      setLoading(false)
    }
    getUser()
  }, [router])

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        toast({
          title: "ログアウトエラー",
          description: "ログアウトに失敗しました。",
          variant: "destructive"
        })
      } else {
        toast({
          title: "ログアウト完了",
          description: "正常にログアウトしました。",
        })
        router.push("/login")
      }
    } catch (error) {
      toast({
        title: "エラー",
        description: "ログアウト中にエラーが発生しました。",
        variant: "destructive"
      })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* ページヘッダー */}
      <section className="page-header">
        <div className="container-custom">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="page-title">管理者ダッシュボード</h1>
              <p className="page-subtitle">
                静かな図書室の管理画面へようこそ
              </p>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="flex items-center gap-2 hover:bg-red-50 hover:text-red-600 hover:border-red-200 rounded-full"
            >
              <LogOut size={16} />
              ログアウト
            </Button>
          </div>
        </div>
      </section>

      {/* 管理者情報セクション */}
      <section className="section-padding">
        <div className="container-custom max-w-4xl">
          <div className="card-base p-6 mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Shield size={24} className="text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">管理者情報</h2>
                <p className="text-gray-600 text-sm">現在ログイン中のアカウント情報</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <User size={16} className="text-gray-400" />
                <span className="text-sm text-gray-600">
                  <span className="font-medium">メールアドレス:</span> {user?.email}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">
                  <span className="font-medium">最終ログイン:</span> {new Date(user?.last_sign_in_at).toLocaleString('ja-JP')}
                </span>
              </div>
            </div>
          </div>

          {/* 管理機能カード群（見出し削除済み） */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* カード1 */}
            <div className="card-base card-hover p-10 min-h-[220px] flex flex-col justify-between">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center">
                  <Plus size={28} className="text-primary" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">新規記事投稿</h3>
                  <p className="text-base text-gray-600">新しい記事を作成して投稿します</p>
                </div>
              </div>
              <Link href="/admin/posts/new">
                <Button className="btn-primary w-full text-lg py-4">
                  記事を投稿する
                </Button>
              </Link>
            </div>

            {/* カード2 */}
            <div className="card-base card-hover p-10 min-h-[220px] flex flex-col justify-between">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center">
                  <FileText size={28} className="text-primary" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">記事管理</h3>
                  <p className="text-base text-gray-600">既存の記事を編集・削除します</p>
                </div>
              </div>
              <Link href="/admin/posts">
                <Button variant="outline" className="w-full text-lg py-4">
                  記事一覧を表示
                </Button>
              </Link>
            </div>

            {/* カード3 */}
            <div className="card-base card-hover p-10 min-h-[220px] flex flex-col justify-between">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center">
                  <Settings size={28} className="text-primary" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">サイト設定</h3>
                  <p className="text-base text-gray-600">サイトの基本設定を変更します</p>
                </div>
              </div>
              <Button variant="outline" className="w-full text-lg py-4" disabled>
                設定を変更
              </Button>
            </div>

            {/* カード4 */}
            <div className="card-base card-hover p-10 min-h-[220px] flex flex-col justify-between">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center">
                  <User size={28} className="text-primary" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">アカウント管理</h3>
                  <p className="text-base text-gray-600">パスワード変更などのアカウント設定</p>
                </div>
              </div>
              <Button variant="outline" className="w-full text-lg py-4" disabled>
                アカウント設定
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
} 