"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import PostForm from "@/components/admin/PostForm"
import { PostFormData } from "@/types/post"

interface EditPostFormProps {
  postId: string
  initialPost: any // Supabaseから取得した記事データ
}

export default function EditPostForm({ postId, initialPost }: EditPostFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [currentPost, setCurrentPost] = useState(initialPost)

  // 初期値をPostFormDataの形式に変換（useMemoで最適化）
  const initialFormData: PostFormData = useMemo(() => ({
    title: currentPost.title || '',
    subtitle: currentPost.excerpt || '',
    category: currentPost.category || '',
    tags: currentPost.tags || [],
    imageUrl: currentPost.image_url || '',
    content: currentPost.content || '',
    allowComments: currentPost.allow_comments ?? true, // データベースの値を取得、nullの場合はtrue
    allowLikes: currentPost.allow_likes ?? true, // データベースの値を取得、nullの場合はtrue
    isRecommended: currentPost.is_recommended ?? false, // データベースの値を取得、nullの場合はfalse
    status: currentPost.status || 'draft'
  }), [currentPost])

  const handleSubmit = async (data: PostFormData) => {
    setIsLoading(true)
    
    try {
      // ユーザー情報を取得
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error("認証エラー")
      }

      // 記事データを準備
      const postData = {
        title: data.title,
        excerpt: data.subtitle || data.title.substring(0, 100),
        content: data.content,
        category: data.category,
        tags: data.tags,
        image_url: data.imageUrl || null,
        status: data.status,
        allow_comments: data.allowComments,
        allow_likes: data.allowLikes,
        is_recommended: data.isRecommended,
        updated_at: new Date().toISOString()
      }

      // Supabaseで記事を更新
      const { data: post, error } = await supabase
        .from('posts')
        .update(postData)
        .eq('id', postId)
        .select()
        .single()

      if (error) {
        console.error('更新エラー:', error)
        throw new Error(error.message)
      }

      // 更新されたデータを状態に保存
      setCurrentPost(post)

      toast({
        title: "更新完了",
        description: "記事が正常に更新されました。",
      })

      // 状態の更新が反映されるまで少し待機してからリダイレクト
      setTimeout(() => {
        router.push("/admin/posts")
      }, 100)
      
    } catch (error) {
      console.error('更新エラー:', error)
      toast({
        title: "更新エラー",
        description: error instanceof Error ? error.message : "更新中にエラーが発生しました。",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveDraft = async (data: PostFormData) => {
    setIsLoading(true)
    
    try {
      // ユーザー情報を取得
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error("認証エラー")
      }

      // 下書きデータを準備
      const postData = {
        title: data.title,
        excerpt: data.subtitle || data.title.substring(0, 100),
        content: data.content,
        category: data.category,
        tags: data.tags,
        image_url: data.imageUrl || null,
        status: data.status,
        allow_comments: data.allowComments,
        allow_likes: data.allowLikes,
        is_recommended: data.isRecommended,
        updated_at: new Date().toISOString()
      }

      // Supabaseで記事を更新
      const { data: post, error } = await supabase
        .from('posts')
        .update(postData)
        .eq('id', postId)
        .select()
        .single()

      if (error) {
        console.error('下書き保存エラー:', error)
        throw new Error(error.message)
      }

      // 更新されたデータを状態に保存
      setCurrentPost(post)

      toast({
        title: "下書き保存完了",
        description: "下書きが正常に保存されました。",
      })

      // 状態の更新が反映されるまで少し待機してからリダイレクト
      setTimeout(() => {
        router.push("/admin/posts")
      }, 100)
      
    } catch (error) {
      console.error('下書き保存エラー:', error)
      toast({
        title: "保存エラー",
        description: error instanceof Error ? error.message : "下書き保存中にエラーが発生しました。",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <PostForm
      key={JSON.stringify(initialFormData)}
      initialValues={initialFormData}
      onSubmit={handleSubmit}
      onSaveDraft={handleSaveDraft}
      isLoading={isLoading}
      isEdit={true}
    />
  )
} 