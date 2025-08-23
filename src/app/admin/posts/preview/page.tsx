"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Edit, Eye, Tag } from 'lucide-react'
import Link from 'next/link'
import { useToast } from '@/hooks/use-toast'

interface PreviewData {
  id: string
  title: string
  subtitle?: string
  category: string
  tags: string[]
  content: string
  imageUrl?: string
  allowComments: boolean
  allowLikes: boolean
}

export default function PreviewPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [previewData, setPreviewData] = useState<PreviewData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // セッションストレージからプレビューデータを取得
    const storedData = sessionStorage.getItem('articlePreviewData')
    
    if (storedData) {
      try {
        const data = JSON.parse(storedData)
        setPreviewData(data)
      } catch (error) {
        console.error('プレビューデータの解析エラー:', error)
        toast({
          title: "プレビューエラー",
          description: "プレビューデータの読み込みに失敗しました。",
          variant: "destructive"
        })
        router.push('/admin/posts')
        return
      }
    } else {
      toast({
        title: "プレビューデータなし",
        description: "プレビューデータが見つかりません。",
        variant: "destructive"
      })
      router.push('/admin/posts')
      return
    }
    
    setIsLoading(false)
  }, [router, toast])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">プレビューを読み込み中...</p>
        </div>
      </div>
    )
  }

  if (!previewData) {
    return null
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
      <article className="container-custom max-w-4xl mx-auto">
        <header className="mb-8 pt-6">
          {previewData.imageUrl && (
            <div className="w-full h-64 md:h-96 rounded-xl overflow-hidden mb-6">
              <img
                src={previewData.imageUrl}
                alt={previewData.title}
                className="w-full h-full object-cover rounded-xl"
              />
            </div>
          )}
          
          <div className="article-card-category inline-block mb-4">
            {previewData.category}
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold mb-6 leading-tight text-balance">
            {previewData.title}
          </h1>
          
          {previewData.subtitle && (
            <p className="text-xl text-gray-600 mb-6 leading-relaxed">
              {previewData.subtitle}
            </p>
          )}
          
          <div className="flex flex-wrap items-center gap-6 text-gray-600 mb-6">
            <span className="flex items-center">
              <Edit size={16} className="mr-2" />
              {new Date().toLocaleDateString('ja-JP', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </span>
            <span>約5分</span>
          </div>

          {/* タグ */}
          {previewData.tags && previewData.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-8">
              {previewData.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700"
                >
                  <Tag size={12} className="mr-1" />
                  {tag}
                </span>
              ))}
            </div>
          )}
        </header>

        {/* 図書本文 */}
        <div className="prose prose-lg max-w-none mb-12">
          <div className="text-gray-700 leading-relaxed space-y-6 article-content">
            {previewData.content && (
              <div dangerouslySetInnerHTML={{ __html: previewData.content }} />
            )}
          </div>
        </div>

        {/* いいね・コメントセクション */}
        <div className="bg-gray-50 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold mb-4">プレビュー用設定表示</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                previewData.allowComments ? "bg-green-100" : "bg-gray-100"
              }`}>
                {previewData.allowComments ? (
                  <div className="w-2 h-2 bg-green-600 rounded-full" />
                ) : (
                  <div className="w-2 h-2 bg-gray-400 rounded-full" />
                )}
              </div>
              <span className="text-sm text-gray-600">
                コメント: {previewData.allowComments ? '許可' : '禁止'}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                previewData.allowLikes ? "bg-green-100" : "bg-gray-100"
              }`}>
                {previewData.allowLikes ? (
                  <div className="w-2 h-2 bg-green-600 rounded-full" />
                ) : (
                  <div className="w-2 h-2 bg-gray-400 rounded-full" />
                )}
              </div>
              <span className="text-sm text-gray-600">
                いいね: {previewData.allowLikes ? '許可' : '禁止'}
              </span>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-4">
            ※ これはプレビュー画面です。実際のいいね・コメント機能は動作しません。
          </p>
        </div>

        {/* 著者紹介 */}
        <div className="card-base p-6 mb-12">
          <div className="flex items-start space-x-4">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
              <Edit size={24} className="text-gray-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">管理者</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                思考の整理と言葉の力を信じて、日々の気づきを綴っています。
                このサイトが読者の皆さんにとって、新しい視点を得るきっかけになれば嬉しいです。
              </p>
            </div>
          </div>
        </div>


      </article>
    </div>
  )
}
