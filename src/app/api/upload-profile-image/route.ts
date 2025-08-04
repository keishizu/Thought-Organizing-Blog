import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { writeFile, mkdir, unlink } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // 既存のプロフィール画像URLを取得
    const existingImageUrl = user.user_metadata?.profile_image_url

    // ファイルサイズチェック (5MB制限)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large' }, { status: 400 })
    }

    // ファイル形式チェック
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 })
    }

    // ファイル名を生成（プロフィール画像用）
    const timestamp = Date.now()
    const fileExt = file.name.split('.').pop()
    const fileName = `profile-${user.id}-${timestamp}.${fileExt}`

    // ローカルストレージディレクトリの作成
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'profiles')
    try {
      if (!existsSync(uploadDir)) {
        await mkdir(uploadDir, { recursive: true })
      }
    } catch (error) {
      console.error('Failed to create upload directory:', error)
      return NextResponse.json({ error: 'Failed to create upload directory' }, { status: 500 })
    }

    // ファイルをローカルに保存
    try {
      const bytes = await file.arrayBuffer()
      const buffer = new Uint8Array(bytes)
      const filePath = join(uploadDir, fileName)
      
      await writeFile(filePath, buffer)
    } catch (error) {
      console.error('Failed to save file:', error)
      return NextResponse.json({ error: 'Failed to save file' }, { status: 500 })
    }

    // 公開URLを生成
    const publicUrl = `/uploads/profiles/${fileName}`

    // 既存の画像ファイルを削除
    if (existingImageUrl) {
      try {
        const fileName = existingImageUrl.split('/').pop()
        if (fileName && fileName.startsWith('profile-') && fileName.includes('.')) {
          const uploadDir = join(process.cwd(), 'public', 'uploads', 'profiles')
          const filePath = join(uploadDir, fileName)
          
          // セキュリティチェック：パストラバーサル攻撃を防ぐ
          if (filePath.startsWith(join(process.cwd(), 'public', 'uploads', 'profiles'))) {
            if (existsSync(filePath)) {
              await unlink(filePath)
              console.log('Deleted existing profile image:', filePath)
            }
          }
        }
      } catch (deleteError) {
        console.error('Failed to delete existing profile image:', deleteError)
        // 削除に失敗しても新しい画像のアップロードは続行
      }
    }

    // ユーザーのメタデータを更新
    try {
      const { error: updateError } = await supabase.auth.updateUser({
        data: { profile_image_url: publicUrl }
      })

      if (updateError) {
        console.error('Failed to update user metadata:', updateError)
        // ファイルは保存されているので、エラーでもURLは返す
      }
    } catch (updateError) {
      console.error('Failed to update user metadata:', updateError)
    }

    return NextResponse.json({ 
      url: publicUrl,
      success: true 
    })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 