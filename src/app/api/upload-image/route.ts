import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { writeFile, mkdir } from 'fs/promises'
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

    // ファイルサイズチェック (5MB制限)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large' }, { status: 400 })
    }

    // ファイル形式チェック
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 })
    }

    // ファイル名を生成
    const timestamp = Date.now()
    const fileExt = file.name.split('.').pop()
    const fileName = `preview-${timestamp}.${fileExt}`

    // ローカルストレージディレクトリの作成
    const uploadDir = join(process.cwd(), 'public', 'uploads')
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
    const publicUrl = `/uploads/${fileName}`

    return NextResponse.json({ 
      url: publicUrl,
      success: true 
    })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 