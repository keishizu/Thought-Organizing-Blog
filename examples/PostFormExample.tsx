"use client"

import { useState } from 'react'
import PostForm from '@/components/admin/PostForm'
import { PostFormData } from '@/types/post'

export default function PostFormExample() {
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (data: PostFormData) => {
    setIsLoading(true)
    console.log('投稿データ:', data)
    
    // 実際の実装では、ここでAPIを呼び出してデータベースに保存
    await new Promise(resolve => setTimeout(resolve, 2000)) // 仮の遅延
    
    setIsLoading(false)
    alert('図書が投稿されました！')
  }

  const handleSaveDraft = async (data: PostFormData) => {
    setIsLoading(true)
    console.log('下書きデータ:', data)
    
    // 実際の実装では、ここでAPIを呼び出してデータベースに保存
    await new Promise(resolve => setTimeout(resolve, 1000)) // 仮の遅延
    
    setIsLoading(false)
    alert('下書きが保存されました！')
  }

  return (
    <div className="container mx-auto py-8">
      <PostForm
        onSubmit={handleSubmit}
        onSaveDraft={handleSaveDraft}
        isLoading={isLoading}
      />
    </div>
  )
} 