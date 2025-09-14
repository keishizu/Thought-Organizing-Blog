import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { unlink } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { imageUrl } = await request.json()

    if (!imageUrl) {
      return NextResponse.json({ error: 'No image URL provided' }, { status: 400 })
    }

    // URLからファイル名を抽出
    const fileName = imageUrl.split('/').pop()
    if (!fileName) {
      return NextResponse.json({ error: 'Invalid image URL' }, { status: 400 })
    }

    // セキュリティチェック：ファイル名がuploadsディレクトリ内のファイルかチェック
    if (!fileName.startsWith('preview-') || !fileName.includes('.')) {
      return NextResponse.json({ error: 'Invalid file name' }, { status: 400 })
    }

    // ファイルパスを構築
    const uploadDir = join(process.cwd(), 'public', 'uploads')
    const filePath = join(uploadDir, fileName)

    // セキュリティチェック：パストラバーサル攻撃を防ぐ
    if (!filePath.startsWith(join(process.cwd(), 'public', 'uploads'))) {
      return NextResponse.json({ error: 'Invalid file path' }, { status: 400 })
    }

    // ファイルが存在するかチェック
    if (!existsSync(filePath)) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }

    // ファイルを削除
    try {
      await unlink(filePath)
      if (process.env.NODE_ENV === 'development') {
        console.log('Deleted file:', filePath);
      }
    } catch (error) {
      console.error('Failed to delete file:', error)
      return NextResponse.json({ error: 'Failed to delete file' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true,
      message: 'Image deleted successfully'
    })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 