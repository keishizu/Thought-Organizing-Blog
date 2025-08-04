'use client'

import { useRouter } from "next/navigation"
import { useEffect, useState, useRef } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { ArrowLeft, User, Camera, Save, X, Shield } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function AccountPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [adminName, setAdminName] = useState("")
  const [isEditingName, setIsEditingName] = useState(false)
  const [tempName, setTempName] = useState("")
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push("/login")
        return
      }
      setUser(user)
      setAdminName(user.user_metadata?.admin_name || "管理者")
      
      // ユーザーのメタデータからプロフィール画像URLを読み込み
      setProfileImage(user.user_metadata?.profile_image_url || null)
      
      setLoading(false)
    }
    getUser()
  }, [router])

  const handleNameEdit = () => {
    setTempName(adminName)
    setIsEditingName(true)
  }

  const handleNameSave = async () => {
    try {
      const { error } = await supabase.auth.updateUser({
        data: { admin_name: tempName }
      })
      
      if (error) {
        toast({
          title: "エラー",
          description: "管理者名の更新に失敗しました。",
          variant: "destructive"
        })
      } else {
        setAdminName(tempName)
        setIsEditingName(false)
        toast({
          title: "更新完了",
          description: "管理者名を更新しました。",
        })
      }
    } catch (error) {
      toast({
        title: "エラー",
        description: "管理者名の更新中にエラーが発生しました。",
        variant: "destructive"
      })
    }
  }

  const handleNameCancel = () => {
    setIsEditingName(false)
    setTempName(adminName)
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('handleImageUpload called', event.target.files)
    const file = event.target.files?.[0]
    if (!file) {
      console.log('No file selected')
      return
    }

    setIsUploading(true)
    try {
      // ファイルサイズチェック（5MB以下）
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "エラー",
          description: "ファイルサイズは5MB以下にしてください。",
          variant: "destructive"
        })
        return
      }

      // ファイル形式チェック
      if (!file.type.startsWith('image/')) {
        toast({
          title: "エラー",
          description: "画像ファイルを選択してください。",
          variant: "destructive"
        })
        return
      }

      // APIを使用して画像をアップロード
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload-profile-image', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Upload failed')
      }

      const data = await response.json()
      setProfileImage(data.url)
      
      toast({
        title: "アップロード完了",
        description: "プロフィール画像をアップロードしました。",
      })
    } catch (error) {
      console.error('Upload error:', error)
      toast({
        title: "エラー",
        description: "画像のアップロードに失敗しました。",
        variant: "destructive"
      })
    } finally {
      setIsUploading(false)
    }
  }



  const handleImageButtonClick = () => {
    console.log('handleImageButtonClick called')
    if (fileInputRef.current) {
      console.log('Clicking file input')
      fileInputRef.current.click()
    } else {
      console.log('fileInputRef.current is null')
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
          <div className="flex flex-col items-center">
            <Link 
              href="/admin" 
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4 self-start"
            >
              <ArrowLeft size={15} />
              <span>ダッシュボードに戻る</span>
            </Link>
            <div className="w-full">
              <h1 className="page-title">アカウント管理</h1>
              <p className="page-subtitle">
                静かな図書室の管理者設定
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* アカウント管理セクション */}
      <section className="section-padding">
        <div className="container-custom max-w-4xl">
          {/* アカウント情報セクション（上に配置） */}
          <div className="card-base p-8 mb-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center">
                <Shield size={28} className="text-primary" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'var(--font-secondary)' }}>アカウント情報</h3>
                <p className="text-base text-gray-600">現在のアカウント情報</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <User size={16} className="text-primary" />
                  </div>
                  <Label className="text-sm font-medium text-gray-700">メールアドレス</Label>
                </div>
                <p className="text-gray-900 font-medium">{user?.email}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <div className="w-3 h-3 bg-primary rounded-full"></div>
                  </div>
                  <Label className="text-sm font-medium text-gray-700">最終ログイン</Label>
                </div>
                <p className="text-gray-900 font-medium">
                  {new Date(user?.last_sign_in_at).toLocaleString('ja-JP')}
                </p>
              </div>
            </div>
          </div>

          {/* 設定セクション（下に配置） */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 管理者名セクション */}
            <div className="card-base card-hover p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center">
                  <User size={28} className="text-primary" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'var(--font-secondary)' }}>管理者名</h3>
                  <p className="text-base text-gray-600">表示される管理者名を設定します</p>
                </div>
              </div>
              
              <div className="space-y-6">
                {isEditingName ? (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="admin-name" className="text-sm font-medium text-gray-700">管理者名</Label>
                      <Input
                        id="admin-name"
                        value={tempName}
                        onChange={(e) => setTempName(e.target.value)}
                        placeholder="管理者名を入力"
                        className="mt-2 text-base py-3 border-gray-200 focus:border-primary/50 focus:ring-primary/20"
                      />
                    </div>
                    <div className="flex gap-3">
                      <Button 
                        onClick={handleNameSave} 
                        disabled={!tempName.trim()}
                        className="btn-primary flex-1 py-3 text-base"
                      >
                        <Save size={18} className="mr-2" />
                        保存
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={handleNameCancel}
                        className="flex-1 py-3 text-base hover:bg-gray-50"
                      >
                        <X size={18} className="mr-2" />
                        キャンセル
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <Label className="text-sm font-medium text-gray-600">現在の管理者名</Label>
                      <p className="text-xl font-semibold mt-2 text-gray-900" style={{ fontFamily: 'var(--font-secondary)' }}>
                        {adminName}
                      </p>
                    </div>
                    <Button 
                      onClick={handleNameEdit} 
                      variant="outline"
                      className="w-full py-3 text-base hover:bg-primary/5 hover:border-primary/30"
                    >
                      <User size={18} className="mr-2" />
                      編集
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* プロフィール画像セクション */}
            <div className="card-base card-hover p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center">
                  <Camera size={28} className="text-primary" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'var(--font-secondary)' }}>プロフィール画像</h3>
                  <p className="text-base text-gray-600">管理者のトップ画像を設定します</p>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <Avatar className="w-32 h-32 border-4 border-primary/10">
                      <AvatarImage src={profileImage || undefined} alt="プロフィール画像" />
                      <AvatarFallback className="text-4xl font-semibold" style={{ fontFamily: 'var(--font-secondary)' }}>
                        {adminName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="flex-1">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={isUploading}
                    />
                    <Button 
                      variant="outline" 
                      disabled={isUploading}
                      onClick={handleImageButtonClick}
                      className="w-full py-3 text-base hover:bg-primary/5 hover:border-primary/30"
                    >
                      {isUploading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                          アップロード中...
                        </>
                      ) : (
                        <>
                          <Camera size={18} className="mr-2" />
                          画像を選択
                        </>
                      )}
                    </Button>
                    <p className="text-sm text-gray-500 mt-3 text-center">
                      JPG、PNG、GIF形式、5MB以下
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
} 