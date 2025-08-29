"use client"

import { useState, useEffect, useRef } from 'react'
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
import { X, Plus, BookOpen, Star, User, Bell, ThumbsUp, MessageCircle, Heart, Check, X as XIcon, Save, Send, Eye, Upload } from 'lucide-react'
import { cn } from '@/lib/utils'
import TipTapEditor from '@/components/editor/TipTapEditor'
import ImageUpload from '@/components/admin/ImageUpload'
import { PostFormData, PostFormProps, CATEGORIES } from '@/types/post'
import { postFormSchema } from '@/lib/validations/post'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/hooks/use-toast'

export default function PostForm({ 
  initialValues, 
  onSubmit, 
  onSaveDraft, 
  isLoading = false,
  isEdit = false
}: PostFormProps) {
  const { toast } = useToast()
  const [formData, setFormData] = useState<PostFormData>({
    title: '',
    subtitle: '',
    category: '',
    tags: [],
    imageUrl: '',
    content: '',
    allowComments: true,
    allowLikes: true,
    isRecommended: false,
    status: 'draft'
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [tagInput, setTagInput] = useState('')
  const [isImporting, setIsImporting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // カテゴリーとアイコンのマッピング
  const categoryIcons = {
    "思整術": BookOpen,
    "仕事と分岐点": Star,
    "日常と気づき": User,
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
    initialValues?.isRecommended,
    initialValues?.status
  ])

  // おすすめ図書件数チェック
  const checkRecommendedCount = async (): Promise<boolean> => {
    try {
      const { count, error } = await supabase
        .from('posts')
        .select('*', { count: 'exact', head: true })
        .eq('is_recommended', true)

      if (error) {
        console.error('おすすめ図書件数取得エラー:', error)
        return false
      }

      return (count || 0) < 3
    } catch (error) {
      console.error('おすすめ図書件数チェックエラー:', error)
      return false
    }
  }

  // おすすめ図書トグル処理
  const handleRecommendedToggle = async (checked: boolean) => {
    if (checked) {
      // おすすめ図書を追加する場合、件数チェック
      const canAdd = await checkRecommendedCount()
      if (!canAdd) {
        toast({
          title: "制限エラー",
          description: "おすすめ図書は最大3件までです。",
          variant: "destructive"
        })
        return
      }
    }

    setFormData(prev => ({ ...prev, isRecommended: checked }))
  }

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

  // プレビュー処理（別ページ遷移）
  const handlePreview = () => {
    if (!validateForm()) {
      return
    }

    // プレビューデータをセッションストレージに保存
    const previewData = {
      title: formData.title,
      subtitle: formData.subtitle,
      category: formData.category,
      tags: formData.tags,
      content: formData.content,
      imageUrl: formData.imageUrl,
      allowComments: formData.allowComments,
      allowLikes: formData.allowLikes
    }
    
    sessionStorage.setItem('articlePreviewData', JSON.stringify(previewData))
    
    // プレビューページに遷移
    window.open('/admin/posts/preview', '_blank')
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

  // 画像アップロード処理（サーバーサイド版）
  const uploadImage = async (file: File): Promise<string> => {
    try {
      // クライアントサイドで画像をリサイズ
      const resizedFile = await resizeImage(file)
      
      const formData = new FormData()
      formData.append('file', resizedFile)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Upload failed')
      }

      const data = await response.json()
      return data.url
    } catch (error) {
      console.error('Upload error:', error)
      throw error
    }
  }

  // 画像リサイズ処理
  const resizeImage = async (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      
      reader.onload = () => {
        const img = new Image()
        img.onload = () => {
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')
          
          if (!ctx) {
            reject(new Error('Canvas context could not be created'))
            return
          }

          // 最大サイズを設定
          const maxWidth = 800
          const maxHeight = 600
          
          let { width, height } = img
          
          // アスペクト比を保ちながらリサイズ
          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height)
            width = Math.round(width * ratio)
            height = Math.round(height * ratio)
          }
          
          canvas.width = width
          canvas.height = height
          
          // 画像を描画
          ctx.drawImage(img, 0, 0, width, height)
          
          // JPEG形式で圧縮
          canvas.toBlob((blob) => {
            if (blob) {
              const resizedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now()
              })
              resolve(resizedFile)
            } else {
              reject(new Error('Failed to create blob'))
            }
          }, 'image/jpeg', 0.8)
        }
        
        img.onerror = () => {
          reject(new Error('Failed to load image'))
        }
        
        img.src = reader.result as string
      }
      
      reader.onerror = () => {
        reject(new Error('Failed to read file'))
      }
      
      reader.readAsDataURL(file)
    })
  }

  // ファイル取り込み処理
  const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsImporting(true)
    
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/import-post', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'ファイルの取り込みに失敗しました')
      }

      const data = await response.json()
      
      if (data.success) {
        // フォームデータを更新
        setFormData(prev => ({
          ...prev,
          content: data.content,
          title: data.formData.title || prev.title,
          subtitle: data.formData.subtitle || prev.subtitle,
          tags: data.formData.tags.length > 0 ? data.formData.tags : prev.tags,
          category: data.formData.category || prev.category,
          imageUrl: data.formData.imageUrl || prev.imageUrl,
          isRecommended: data.formData.isRecommended !== undefined ? data.formData.isRecommended : prev.isRecommended,
          allowComments: data.formData.allowComments !== undefined ? data.formData.allowComments : prev.allowComments,
          allowLikes: data.formData.allowLikes !== undefined ? data.formData.allowLikes : prev.allowLikes
        }))

        toast({
          title: "取り込み完了",
          description: data.message,
          variant: "default"
        })
      }
    } catch (error: any) {
      console.error('ファイル取り込みエラー:', error)
      toast({
        title: "取り込みエラー",
        description: error.message || 'ファイルの取り込み中にエラーが発生しました',
        variant: "destructive"
      })
    } finally {
      setIsImporting(false)
      // ファイル入力をリセット（同じファイルを再度選択できるように）
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  // ファイル選択ダイアログを開く
  const openFileDialog = () => {
    fileInputRef.current?.click()
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
          <Label className="text-lg font-medium font-secondary">カバー画像</Label>
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
          <Label htmlFor="title" className="text-lg font-medium font-secondary">タイトル *</Label>
        </div>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          placeholder="図書のタイトルを入力してください"
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
          <Label htmlFor="subtitle" className="text-lg font-medium font-secondary">サブタイトル</Label>
        </div>
        <Input
          id="subtitle"
          value={formData.subtitle}
          onChange={(e) => setFormData(prev => ({ ...prev, subtitle: e.target.value }))}
          placeholder="図書のサブタイトルを入力してください（任意）"
          maxLength={20}
        />
        {errors.subtitle && (
          <p className="text-sm text-red-600">{errors.subtitle}</p>
        )}
        <p className="text-xs text-gray-500">
          {formData.subtitle?.length || 0}/20文字
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
          <Label htmlFor="category" className="text-lg font-medium font-secondary">カテゴリー *</Label>
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
          <Label htmlFor="tags" className="text-lg font-medium font-secondary">タグ</Label>
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
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <Label className="text-lg font-medium font-secondary">本文 *</Label>
          </div>
          
          {/* ファイルから読み込みボタン */}
          <Button
            type="button"
            variant="outline"
            onClick={openFileDialog}
            disabled={isImporting}
            className="flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            {isImporting ? '取り込み中...' : 'ファイルから読み込み'}
          </Button>
        </div>
        
        {/* ファイル入力（非表示） */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".md,.mdx,.html,.docx"
          onChange={handleFileImport}
          className="hidden"
        />
        
        <TipTapEditor
          content={formData.content}
          onChange={(content) => setFormData(prev => ({ ...prev, content }))}
          placeholder="図書の本文を入力してください..."
        />
        {errors.content && (
          <p className="text-sm text-red-600">{errors.content}</p>
        )}
        
        {/* ファイル取り込みの説明 */}
        <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
          <p className="font-medium mb-1">対応ファイル形式:</p>
          <ul className="list-disc list-inside space-y-1">
            <li><strong>.md/.mdx:</strong> Markdownファイル（フロントマター対応）</li>
            <li><strong>.html:</strong> HTMLファイル</li>
            <li><strong>.docx:</strong> Word文書</li>
          </ul>
          <p className="mt-2 text-xs">
            フロントマターがある場合、タイトル、サブタイトル、タグ、カテゴリ等が自動的に反映されます。
          </p>
        </div>
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
          <h3 className="text-lg font-medium font-secondary">設定</h3>
        </div>
        
        {/* おすすめ図書設定 */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
              <Star className="w-4 h-4 text-yellow-600" />
            </div>
            <div className="space-y-0.5">
              <Label>おすすめ図書に設定</Label>
              <p className="text-sm text-gray-500">
                トップページのおすすめ欄に表示されます（最大3件まで）
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-sm font-medium ${formData.isRecommended ? 'text-green-600' : 'text-gray-500'}`}>
              {formData.isRecommended ? '有効' : '無効'}
            </span>
            <button
              type="button"
              onClick={() => handleRecommendedToggle(!formData.isRecommended)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${
                formData.isRecommended ? 'bg-green-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                  formData.isRecommended ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
              {formData.isRecommended && (
                <Check className="absolute left-1 h-3 w-3 text-white" />
              )}
              {!formData.isRecommended && (
                <XIcon className="absolute right-1 h-3 w-3 text-gray-400" />
              )}
            </button>
          </div>
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
                読者が図書にコメントを投稿できるようにします
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
                読者が図書にいいねを送れるようにします
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
          <span>{isLoading ? (isEdit ? '更新中...' : '投稿中...') : (isEdit ? '図書を更新する' : '図書を投稿する')}</span>
        </button>
      </div>


    </div>
  )
} 