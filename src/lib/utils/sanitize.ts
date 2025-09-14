// サーバーサイド用のDOMPurify設定
let serverDOMPurify: any = null

// サーバーサイドでのみJSDOMとDOMPurifyを初期化
if (typeof window === 'undefined') {
  const createDOMPurify = require('dompurify')
  const { JSDOM } = require('jsdom')
  const jsdomWindow = new JSDOM('').window
  serverDOMPurify = createDOMPurify(jsdomWindow)
}

/**
 * HTMLコンテンツを安全にサニタイズする（サーバーサイド用）
 * @param html - サニタイズするHTMLコンテンツ
 * @returns サニタイズされたHTMLコンテンツ
 */
export function sanitizeHtml(html: string): string {
  if (typeof window !== 'undefined') {
    throw new Error('sanitizeHtml can only be used on server side. Use sanitizeHtmlClient for client side.')
  }
  
  if (!serverDOMPurify) {
    throw new Error('Server-side DOMPurify not initialized')
  }
  
  return serverDOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      // 見出し
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      // テキスト
      'p', 'br', 'hr', 'span', 'div',
      // 強調・装飾
      'strong', 'b', 'em', 'i', 'u', 's', 'sub', 'sup',
      // リスト
      'ul', 'ol', 'li',
      // 引用・コード
      'blockquote', 'code', 'pre',
      // リンク・画像
      'a', 'img',
      // テーブル
      'table', 'thead', 'tbody', 'tr', 'th', 'td',
      'caption', 'colgroup', 'col',
      // その他
      'details', 'summary'
    ],
    ALLOWED_ATTR: [
      // リンク・画像
      'href', 'src', 'alt', 'title', 'target',
      // スタイル（制限的）
      'class', 'id',
      // テーブル
      'colspan', 'rowspan', 'align', 'valign',
      // 画像
      'width', 'height'
    ],
    ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
    ALLOW_DATA_ATTR: false,
    ALLOW_UNKNOWN_PROTOCOLS: false,
    SANITIZE_DOM: true,
    KEEP_CONTENT: true,
    // 危険な要素を完全に除去
    FORBID_TAGS: ['script', 'object', 'embed', 'form', 'input', 'button'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'style']
  })
}

/**
 * クライアントサイド用のHTMLサニタイズ関数
 * （ブラウザ環境でのみ使用）
 */
export function sanitizeHtmlClient(html: string): string {
  if (typeof window === 'undefined') {
    throw new Error('sanitizeHtmlClient can only be used in browser environment')
  }
  
  // ブラウザ環境では直接DOMPurifyを使用
  const DOMPurify = require('dompurify')
  
  return DOMPurify.sanitize(html, {
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
}
