import { NextRequest, NextResponse } from 'next/server'
import { marked } from 'marked'
import mammoth from 'mammoth'
import matter from 'gray-matter'
import createDOMPurify from 'dompurify'
import { JSDOM } from 'jsdom'

// DOMPurifyの設定
const window = new JSDOM('').window
const DOMPurify = createDOMPurify(window)

// 対応ファイル拡張子
const ALLOWED_EXTENSIONS = ['.md', '.mdx', '.html', '.docx']
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: 'ファイルが選択されていません' },
        { status: 400 }
      )
    }

    // ファイルサイズチェック
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'ファイルサイズが大きすぎます（最大10MB）' },
        { status: 400 }
      )
    }

    // ファイル拡張子チェック
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'))
    if (!ALLOWED_EXTENSIONS.includes(fileExtension)) {
      return NextResponse.json(
        { error: '対応していないファイル形式です。.md, .mdx, .html, .docx のみ対応しています。' },
        { status: 400 }
      )
    }

    let content = ''
    let frontMatter: any = {}

    // ファイル形式に応じた処理
    if (fileExtension === '.docx') {
      // Word文書の処理
      const arrayBuffer = await file.arrayBuffer()
      const result = await mammoth.extractRawText({ arrayBuffer })
      content = result.value
    } else {
      // テキストファイルの処理
      const text = await file.text()
      
      if (fileExtension === '.md' || fileExtension === '.mdx') {
        // Markdownファイルの場合、フロントマターを解析
        const parsed = matter(text)
        frontMatter = parsed.data
        content = parsed.content
      } else {
        // HTMLファイルの場合
        content = text
      }
    }

    // MarkdownをHTMLに変換（.md, .mdx, .docxの場合）
    let htmlContent = ''
    if (fileExtension === '.md' || fileExtension === '.mdx' || fileExtension === '.docx') {
      // marked.jsの設定
      marked.setOptions({
        breaks: true,
        gfm: true
      })
      
      htmlContent = await marked(content)
    } else {
      htmlContent = content
    }

    // HTMLサニタイズ
    const sanitizedHtml = DOMPurify.sanitize(htmlContent, {
      ALLOWED_TAGS: [
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'p', 'br', 'hr',
        'strong', 'b', 'em', 'i',
        'ul', 'ol', 'li',
        'blockquote', 'code', 'pre',
        'a', 'img',
        'table', 'thead', 'tbody', 'tr', 'th', 'td',
        'caption', 'colgroup', 'col'
      ],
      ALLOWED_ATTR: [
        'href', 'src', 'alt', 'title', 'target',
        'class', 'id', 'style', 'width', 'height',
        'colspan', 'rowspan', 'align', 'valign'
      ],
      ALLOW_DATA_ATTR: false
    })

    // フロントマターからフォームデータを抽出
    const formDataFromFile = {
      title: frontMatter.title || '',
      subtitle: frontMatter.subtitle || '',
      tags: Array.isArray(frontMatter.tags) ? frontMatter.tags : 
            typeof frontMatter.tags === 'string' ? [frontMatter.tags] : [],
      category: frontMatter.category || '',
      imageUrl: frontMatter.imageUrl || '',
      isRecommended: Boolean(frontMatter.isRecommended),
      allowComments: frontMatter.allowComments !== undefined ? Boolean(frontMatter.allowComments) : true,
      allowLikes: frontMatter.allowLikes !== undefined ? Boolean(frontMatter.allowLikes) : true
    }

    return NextResponse.json({
      success: true,
      content: sanitizedHtml,
      formData: formDataFromFile,
      message: 'ファイルの取り込みが完了しました'
    })

  } catch (error) {
    console.error('ファイル取り込みエラー:', error)
    return NextResponse.json(
      { error: 'ファイルの処理中にエラーが発生しました' },
      { status: 500 }
    )
  }
}
