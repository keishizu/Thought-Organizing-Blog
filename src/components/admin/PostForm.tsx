"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { X, Plus, BookOpen, Star, User, Bell, ThumbsUp, MessageCircle, Heart, Check, X as XIcon, Save, Send, Eye } from 'lucide-react'
import { cn } from '@/lib/utils'
import TipTapEditor from '@/components/editor/TipTapEditor'
import ImageUpload from '@/components/admin/ImageUpload'
import { PostFormData, PostFormProps, CATEGORIES } from '@/types/post'
import { postFormSchema } from '@/lib/validations/post'

export default function PostForm({ 
  initialValues, 
  onSubmit, 
  onSaveDraft, 
  isLoading = false,
  isEdit = false
}: PostFormProps) {
  const [formData, setFormData] = useState<PostFormData>({
    title: '',
    subtitle: '',
    category: '',
    tags: [],
    imageUrl: '',
    content: '',
    allowComments: true,
    allowLikes: true,
    status: 'draft'
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [tagInput, setTagInput] = useState('')

  // カテゴリとアイコンのマッピング
  const categoryIcons = {
    "思考と行動": BookOpen,
    "キャリアと選択": Star,
    "気づきと日常": User,
    "お知らせ": Bell
  }

  // 初期値の設定
  useEffect(() => {
    if (initialValues) {
      setFormData(prev => ({
        ...prev,
        ...initialValues
      }))
    }
  }, [
    initialValues?.title,
    initialValues?.subtitle,
    initialValues?.category,
    initialValues?.tags,
    initialValues?.imageUrl,
    initialValues?.content,
    initialValues?.allowComments,
    initialValues?.allowLikes,
    initialValues?.status
  ])

  // バリデーション関数
  const validateForm = (): boolean => {
    try {
      postFormSchema.parse(formData)
      setErrors({})
      return true
    } catch (error: any) {
      const newErrors: Record<string, string> = {}
      if (error.errors) {
        error.errors.forEach((err: any) => {
          newErrors[err.path[0]] = err.message
        })
      }
      setErrors(newErrors)
      return false
    }
  }

  // プレビュー処理
  const handlePreview = () => {
    if (!validateForm()) {
      return
    }

    const params = new URLSearchParams({
      title: formData.title,
      subtitle: formData.subtitle || '',
      category: formData.category,
      tags: JSON.stringify(formData.tags),
      content: formData.content,
      imageUrl: formData.imageUrl || '',
      allowComments: formData.allowComments.toString(),
      allowLikes: formData.allowLikes.toString()
    })

    window.open(`/admin/posts/preview?${params.toString()}`, '_blank')
  }

  // フォーム送信処理
  const handleSubmit = (status: 'published' | 'draft') => {
    const updatedData = { ...formData, status }
    
    if (validateForm()) {
      if (status === 'draft' && onSaveDraft) {
        onSaveDraft(updatedData)
      } else {
        onSubmit(updatedData)
      }
    }
  }

  // タグ追加処理
  const addTag = () => {
    const trimmedTag = tagInput.trim()
    if (trimmedTag && !formData.tags.includes(trimmedTag) && formData.tags.length < 5) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, trimmedTag]
      }))
      setTagInput('')
    }
  }

  // タグ削除処理
  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  // 画像アップロード処理（仮実装）
  const uploadImage = async (file: File): Promise<string> => {
    // 実際の実装では、ここでCloudflare Images APIを呼び出す
    // 現在は仮の実装として、FileReaderを使用
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = () => {
        resolve(reader.result as string)
      }
      reader.readAsDataURL(file)
    })
  }

  return (
    <div className="space-y-8">
      {/* カバー画像 */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <Label className="text-lg font-medium">カバー画像</Label>
        </div>
        <ImageUpload
          imageUrl={formData.imageUrl}
          onImageChange={(url) => setFormData(prev => ({ ...prev, imageUrl: url }))}
          uploadImage={uploadImage}
        />
      </div>

      {/* タイトル */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
            </svg>
          </div>
          <Label htmlFor="title" className="text-lg font-medium">タイトル *</Label>
        </div>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          placeholder="記事のタイトルを入力してください"
          maxLength={10}
          className="text-lg"
        />
        {errors.title && (
          <p className="text-sm text-red-600">{errors.title}</p>
        )}
        <p className="text-xs text-gray-500">
          {formData.title.length}/10文字
        </p>
      </div>

      {/* サブタイトル */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <Label htmlFor="subtitle" className="text-lg font-medium">サブタイトル</Label>
        </div>
        <Input
          id="subtitle"
          value={formData.subtitle}
          onChange={(e) => setFormData(prev => ({ ...prev, subtitle: e.target.value }))}
          placeholder="記事のサブタイトルを入力してください（任意）"
          maxLength={60}
        />
        {errors.subtitle && (
          <p className="text-sm text-red-600">{errors.subtitle}</p>
        )}
        <p className="text-xs text-gray-500">
          {formData.subtitle?.length || 0}/60文字
        </p>
      </div>

      {/* カテゴリー */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
          </div>
          <Label htmlFor="category" className="text-lg font-medium">カテゴリー *</Label>
        </div>
        <Select
          value={formData.category}
          onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
        >
          <SelectTrigger className="w-full h-12 text-base border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20">
            <SelectValue placeholder="カテゴリーを選択してください" />
          </SelectTrigger>
          <SelectContent className="max-h-60 bg-white border border-gray-200 shadow-lg rounded-md relative z-50">
            {CATEGORIES.map((category) => {
              const IconComponent = categoryIcons[category as keyof typeof categoryIcons] || BookOpen
              return (
                <SelectItem 
                  key={category} 
                  value={category}
                  className="text-base py-3 cursor-pointer hover:bg-gray-50 focus:bg-gray-100 data-[state=checked]:bg-primary/10"
                >
                  <div className="flex items-center gap-3">
                    <IconComponent className="w-4 h-4 text-primary" />
                    <span>{category}</span>
                  </div>
                </SelectItem>
              )
            })}
          </SelectContent>
        </Select>
        {errors.category && (
          <p className="text-sm text-red-600">{errors.category}</p>
        )}
      </div>

      {/* タグ */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
          </div>
          <Label htmlFor="tags" className="text-lg font-medium">タグ</Label>
        </div>
        <div className="flex gap-2">
          <Input
            id="tags"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            placeholder="タグを入力してください"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                addTag()
              }
            }}
          />
          <Button
            type="button"
            variant="outline"
            onClick={addTag}
            disabled={!tagInput.trim() || formData.tags.length >= 5}
          >
            追加
          </Button>
        </div>
        {formData.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {formData.tags.map((tag, index) => (
              <Badge key={index} variant="secondary" className="flex items-center gap-1">
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="ml-1 hover:text-red-600"
                >
                  <X size={12} />
                </button>
              </Badge>
            ))}
          </div>
        )}
        <p className="text-xs text-gray-500">
          最大5個まで設定できます
        </p>
      </div>

      {/* 本文 */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <Label className="text-lg font-medium">本文 *</Label>
        </div>
        <TipTapEditor
          content={formData.content}
          onChange={(content) => setFormData(prev => ({ ...prev, content }))}
          placeholder="記事の本文を入力してください..."
        />
        {errors.content && (
          <p className="text-sm text-red-600">{errors.content}</p>
        )}
      </div>

      <Separator />

      {/* 設定 */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium">設定</h3>
        </div>
        
        {/* コメント許可 */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <MessageCircle className="w-4 h-4 text-blue-600" />
            </div>
            <div className="space-y-0.5">
              <Label>コメントを許可</Label>
              <p className="text-sm text-gray-500">
                読者が記事にコメントを投稿できるようにします
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-sm font-medium ${formData.allowComments ? 'text-green-600' : 'text-gray-500'}`}>
              {formData.allowComments ? '有効' : '無効'}
            </span>
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, allowComments: !prev.allowComments }))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${
                formData.allowComments ? 'bg-green-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                  formData.allowComments ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
              {formData.allowComments && (
                <Check className="absolute left-1 h-3 w-3 text-white" />
              )}
              {!formData.allowComments && (
                <XIcon className="absolute right-1 h-3 w-3 text-gray-400" />
              )}
            </button>
          </div>
        </div>

        {/* いいね許可 */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
              <Heart className="w-4 h-4 text-red-600" />
            </div>
            <div className="space-y-0.5">
              <Label>いいねを許可</Label>
              <p className="text-sm text-gray-500">
                読者が記事にいいねを送れるようにします
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-sm font-medium ${formData.allowLikes ? 'text-green-600' : 'text-gray-500'}`}>
              {formData.allowLikes ? '有効' : '無効'}
            </span>
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, allowLikes: !prev.allowLikes }))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${
                formData.allowLikes ? 'bg-green-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                  formData.allowLikes ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
              {formData.allowLikes && (
                <Check className="absolute left-1 h-3 w-3 text-white" />
              )}
              {!formData.allowLikes && (
                <XIcon className="absolute right-1 h-3 w-3 text-gray-400" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* アクションボタン */}
      <div className="flex gap-4 justify-end pt-6">
        <button
          type="button"
          onClick={handlePreview}
          disabled={isLoading || !formData.title || !formData.content}
          className="btn-secondary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Eye className="w-4 h-4" />
          <span>プレビュー</span>
        </button>
        {onSaveDraft && (
          <button
            type="button"
            onClick={() => handleSubmit('draft')}
            disabled={isLoading}
            className="btn-secondary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4" />
            <span>{isLoading ? '保存中...' : '下書保存'}</span>
          </button>
        )}
        <button
          type="button"
          onClick={() => handleSubmit('published')}
          disabled={isLoading}
          className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send className="w-4 h-4" />
          <span>{isLoading ? (isEdit ? '更新中...' : '投稿中...') : (isEdit ? '記事を更新する' : '記事を投稿する')}</span>
        </button>
      </div>
    </div>
  )
} 