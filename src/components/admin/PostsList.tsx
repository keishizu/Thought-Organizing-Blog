"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Edit, 
  Trash2, 
  Eye, 
  Calendar, 
  Tag,
  Plus,
  Loader2,
  BookOpen,
  Heart,
  MessageCircle,
  Globe,
  Lock,
  FileText,
  Star
} from "lucide-react"
import Link from "next/link"

interface Post {
  id: string
  title: string
  excerpt: string
  content: string
  category: string
  tags: string[]
  status: 'draft' | 'published' | 'private'
  created_at: string | null
  updated_at: string | null
  likes: number
  image_url?: string | null
  allow_comments: boolean
  allow_likes: boolean
  is_recommended: boolean
}

export default function PostsList() {
  const router = useRouter()
  const { toast } = useToast()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('記事取得エラー:', error)
        toast({
          title: "エラー",
          description: "記事の取得に失敗しました。",
          variant: "destructive"
        })
        return
      }

      // データベースから取得したデータを適切な型に変換
      const typedPosts: Post[] = (data || []).map((post: any) => ({
        id: post.id,
        title: post.title,
        excerpt: post.excerpt,
        content: post.content,
        category: post.category,
        tags: post.tags || [],
        status: post.status as 'draft' | 'published' | 'private',
        created_at: post.created_at,
        updated_at: post.updated_at,
        likes: post.likes || 0,
        image_url: post.image_url,
        allow_comments: post.allow_comments ?? true,
        allow_likes: post.allow_likes ?? true,
        is_recommended: post.is_recommended ?? false
      }))

      setPosts(typedPosts)
    } catch (error) {
      console.error('記事取得エラー:', error)
      toast({
        title: "エラー",
        description: "記事の取得中にエラーが発生しました。",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handlePreview = (post: Post) => {
    const params = new URLSearchParams({
      id: post.id,
      title: post.title,
      subtitle: post.excerpt || '',
      category: post.category,
      tags: JSON.stringify(post.tags || []),
      content: post.content,
      imageUrl: post.image_url || ''
    })

    window.open(`/admin/posts/preview?${params.toString()}`, '_blank')
  }

  const handleDelete = async (postId: string) => {
    if (!confirm('この記事を削除しますか？この操作は取り消せません。')) {
      return
    }

    setDeletingId(postId)
    
    try {
      // 削除前に記事の画像URLを取得
      const { data: post, error: fetchError } = await supabase
        .from('posts')
        .select('image_url')
        .eq('id', postId)
        .single()

      if (fetchError) {
        console.error('記事取得エラー:', fetchError)
        throw new Error(fetchError.message)
      }

      // 記事を削除
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId)

      if (error) {
        console.error('削除エラー:', error)
        throw new Error(error.message)
      }

      // 画像が存在する場合、画像も削除
      if (post?.image_url) {
        try {
          const deleteResponse = await fetch('/api/delete-image', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ imageUrl: post.image_url })
          })

          if (!deleteResponse.ok) {
            console.warn('Failed to delete image:', await deleteResponse.text())
          } else {
            console.log('Image deleted successfully')
          }
        } catch (error) {
          console.warn('Error deleting image:', error)
        }
      }

      toast({
        title: "削除完了",
        description: "記事が正常に削除されました。",
      })

      // 記事一覧を再取得
      fetchPosts()
      
    } catch (error) {
      console.error('削除エラー:', error)
      toast({
        title: "削除エラー",
        description: error instanceof Error ? error.message : "削除中にエラーが発生しました。",
        variant: "destructive"
      })
    } finally {
      setDeletingId(null)
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '日付不明'
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusInfo = (status?: 'draft' | 'published' | 'private') => {
    switch (status) {
      case 'published':
        return {
          label: '公開中',
          icon: Globe,
          variant: 'default' as const,
          className: 'bg-green-100 text-green-800 border-green-200'
        }
      case 'private':
        return {
          label: '非公開',
          icon: Lock,
          variant: 'secondary' as const,
          className: 'bg-gray-100 text-gray-800 border-gray-200'
        }
      case 'draft':
      default:
        return {
          label: '下書き保存中',
          icon: FileText,
          variant: 'outline' as const,
          className: 'bg-yellow-100 text-yellow-800 border-yellow-200'
        }
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">記事を読み込み中...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 新規投稿ボタン */}
      <div className="flex justify-end mb-6">
        <Link href="/admin/posts/new">
          <button className="btn-primary flex items-center gap-2">
            <Plus size={16} />
            新規記事投稿
          </button>
        </Link>
      </div>

      {/* 記事一覧 */}
      {posts.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500 mb-4">まだ記事が投稿されていません</p>
            <Link href="/admin/posts/new">
              <Button>最初の記事を投稿する</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {posts.map((post) => (
            <div key={post.id} className="article-card card-hover">
              <div className="flex items-start gap-6">
                {/* 記事情報 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="article-card-title text-xl font-semibold line-clamp-2" style={{ fontFamily: 'var(--font-secondary)' }}>
                          {post.title}
                        </h3>
                        {post.is_recommended && (
                          <Star size={16} className="text-yellow-500 fill-yellow-500" />
                        )}
                      </div>
                      <p className="article-card-excerpt text-gray-600 mb-4 line-clamp-2">
                        {post.excerpt}
                      </p>
                    </div>
                  </div>

                  {/* メタ情報 */}
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                    <span className="flex items-center gap-1">
                      <Calendar size={14} />
                      {formatDate(post.created_at)}
                    </span>
                    <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                      {post.category}
                    </Badge>
                    <span className="flex items-center gap-1">
                      <Heart size={14} />
                      {post.likes || 0} いいね
                    </span>
                    {/* いいね・コメント許可状態 */}
                    <div className="flex items-center gap-2">
                      {post.allow_likes && (
                        <span className="flex items-center gap-1 text-green-600" title="いいね許可">
                          <Heart size={12} />
                        </span>
                      )}
                      {post.allow_comments && (
                        <span className="flex items-center gap-1 text-blue-600" title="コメント許可">
                          <MessageCircle size={12} />
                        </span>
                      )}
                    </div>
                  </div>

                  {/* ステータス表示 */}
                  <div className="mb-3">
                    {(() => {
                      const statusInfo = getStatusInfo(post.status)
                      const StatusIcon = statusInfo.icon
                      return (
                        <Badge 
                          variant={statusInfo.variant} 
                          className={`flex items-center gap-1 ${statusInfo.className}`}
                        >
                          <StatusIcon size={12} />
                          {statusInfo.label}
                        </Badge>
                      )
                    })()}
                  </div>

                  {/* タグ */}
                  {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {post.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs bg-gray-50">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                {/* アクションボタン */}
                <div className="flex flex-col gap-2 ml-4">
                  <button
                    onClick={() => handlePreview(post)}
                    className="btn-ghost p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    title="プレビュー"
                  >
                    <Eye size={16} />
                  </button>
                  <button
                    onClick={() => router.push(`/admin/posts/${post.id}/edit`)}
                    className="btn-ghost p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    title="記事を編集"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(post.id)}
                    disabled={deletingId === post.id}
                    className="btn-ghost p-2 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-50"
                    title="記事を削除"
                  >
                    {deletingId === post.id ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Trash2 size={16} />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
} 