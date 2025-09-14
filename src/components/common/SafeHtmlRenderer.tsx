'use client'

import { useEffect, useState } from 'react'

interface SafeHtmlRendererProps {
  html: string
  className?: string
  /**
   * サニタイゼーションをスキップするかどうか
   * 既にサニタイズ済みのコンテンツの場合にtrueを設定
   */
  skipSanitization?: boolean
}

/**
 * HTMLコンテンツを安全に表示するコンポーネント
 * 自動的にDOMPurifyでサニタイズしてからレンダリングする
 */
export default function SafeHtmlRenderer({ 
  html, 
  className = '',
  skipSanitization = false 
}: SafeHtmlRendererProps) {
  const [sanitizedHtml, setSanitizedHtml] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // サニタイゼーションをスキップする場合
    if (skipSanitization) {
      setSanitizedHtml(html)
      setIsLoading(false)
      return
    }

    // 動的にDOMPurifyをインポートしてサニタイズ
    const sanitizeContent = async () => {
      try {
        const DOMPurify = (await import('dompurify')).default
        
        const sanitized = DOMPurify.sanitize(html, {
          ALLOWED_TAGS: [
            'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
            'p', 'br', 'hr', 'span', 'div',
            'strong', 'b', 'em', 'i', 'u', 's', 'sub', 'sup',
            'ul', 'ol', 'li',
            'blockquote', 'code', 'pre',
            'a', 'img',
            'table', 'thead', 'tbody', 'tr', 'th', 'td',
            'caption', 'colgroup', 'col',
            'details', 'summary'
          ],
          ALLOWED_ATTR: [
            'href', 'src', 'alt', 'title', 'target',
            'class', 'id',
            'colspan', 'rowspan', 'align', 'valign',
            'width', 'height'
          ],
          ALLOW_DATA_ATTR: false,
          FORBID_TAGS: ['script', 'object', 'embed', 'form', 'input', 'button'],
          FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'style']
        })
        
        setSanitizedHtml(sanitized)
      } catch (error) {
        console.error('Failed to sanitize HTML:', error)
        setSanitizedHtml('') // エラー時は空文字列を表示
      } finally {
        setIsLoading(false)
      }
    }

    sanitizeContent()
  }, [html, skipSanitization])

  if (isLoading) {
    return <div className={className}>読み込み中...</div>
  }
  
  return (
    <div 
      className={className}
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }} 
    />
  )
}
