"use client"

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Upload, X, Image as ImageIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ImageUploadProps {
  imageUrl?: string
  onImageChange: (url: string) => void
  uploadImage: (file: File) => Promise<string>
  className?: string
}

export default function ImageUpload({ 
  imageUrl, 
  onImageChange, 
  uploadImage,
  className 
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // ファイルサイズチェック (2MB制限に変更)
    if (file.size > 2 * 1024 * 1024) {
      setError('ファイルサイズは2MB以下にしてください')
      return
    }

    // ファイル形式チェック
    if (!file.type.startsWith('image/')) {
      setError('画像ファイルを選択してください')
      return
    }

    setError(null)
    setIsUploading(true)

    try {
      const uploadedUrl = await uploadImage(file)
      
      console.log('Uploaded URL:', uploadedUrl)
      
      onImageChange(uploadedUrl)
    } catch (err) {
      console.error('Upload error:', err)
      setError('画像のアップロードに失敗しました')
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemoveImage = () => {
    onImageChange('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className={cn("space-y-4", className)}>
      
      {imageUrl ? (
        <div className="relative">
          <img
            src={imageUrl}
            alt="カバー画像"
            className="w-full h-48 object-cover rounded-md border border-gray-300"
          />
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={handleRemoveImage}
            className="absolute top-2 right-2"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center">
          <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
          <div className="mt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="mt-2"
            >
              {isUploading ? (
                <>
                  <Upload className="h-4 w-4 mr-2 animate-spin" />
                  アップロード中...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  画像を選択
                </>
              )}
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            PNG, JPG, GIF up to 2MB
          </p>
        </div>
      )}

      <Input
        ref={fileInputRef}
        id="image-upload"
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  )
} 