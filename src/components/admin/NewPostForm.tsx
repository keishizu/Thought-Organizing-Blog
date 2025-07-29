"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import PostForm from "@/components/admin/PostForm"
import { PostFormData } from "@/types/post"

export default function NewPostForm() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

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
        excerpt: data.subtitle || data.title.substring(0, 100), // サブタイトルがない場合はタイトルの一部を使用
        content: data.content,
        category: data.category,
        tags: data.tags,
        image_url: data.imageUrl || null,
        author_id: user.id,
        likes: 0,
        status: data.status,
        allow_comments: data.allowComments,
        allow_likes: data.allowLikes,
        is_recommended: data.isRecommended
      }

      // Supabaseに投稿
      const { data: post, error } = await supabase
        .from('posts')
        .insert([postData])
        .select()
        .single()

      if (error) {
        console.error('投稿エラー:', error)
        throw new Error(error.message)
      }

      toast({
        title: "投稿完了",
        description: "記事が正常に投稿されました。",
      })

      // 記事一覧ページにリダイレクト
      router.push("/admin/posts")
      
    } catch (error) {
      console.error('投稿エラー:', error)
      toast({
        title: "投稿エラー",
        description: error instanceof Error ? error.message : "投稿中にエラーが発生しました。",
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
        author_id: user.id,
        likes: 0,
        status: data.status,
        allow_comments: data.allowComments,
        allow_likes: data.allowLikes,
        is_recommended: data.isRecommended
      }

      // Supabaseに保存
      const { data: post, error } = await supabase
        .from('posts')
        .insert([postData])
        .select()
        .single()

      if (error) {
        console.error('下書き保存エラー:', error)
        throw new Error(error.message)
      }

      toast({
        title: "下書き保存完了",
        description: "下書きが正常に保存されました。",
      })

      // 記事一覧ページにリダイレクト
      router.push("/admin/posts")
      
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
      onSubmit={handleSubmit}
      onSaveDraft={handleSaveDraft}
      isLoading={isLoading}
    />
  )
} 