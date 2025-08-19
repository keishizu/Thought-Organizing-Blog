"use client"

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Blockquote from '@tiptap/extension-blockquote'
import CodeBlock from '@tiptap/extension-code-block'
import HorizontalRule from '@tiptap/extension-horizontal-rule'
import { Table } from '@tiptap/extension-table'
import { TableRow } from '@tiptap/extension-table-row'
import { TableCell } from '@tiptap/extension-table-cell'
import { TableHeader } from '@tiptap/extension-table-header'
import { Button } from '@/components/ui/button'
import { Bold } from 'lucide-react'
import { Italic } from 'lucide-react'
import { Heading1 } from 'lucide-react'
import { Heading2 } from 'lucide-react'
import { Heading3 } from 'lucide-react'
import { List } from 'lucide-react'
import { ListOrdered } from 'lucide-react'
import { Link as LinkIcon } from 'lucide-react'
import { Quote } from 'lucide-react'
import { Code } from 'lucide-react'
import { Minus } from 'lucide-react'
import { Undo } from 'lucide-react'
import { Redo } from 'lucide-react'
import { Table as TableIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useEffect } from 'react'

interface TipTapEditorProps {
  content: string
  onChange: (content: string) => void
  placeholder?: string
}

const MenuBar = ({ editor }: { editor: any }) => {
  if (!editor) {
    return null
  }

  // 見出しの挿入・切り替え処理
  const handleHeading = (level: 1 | 2 | 3) => {
    if (editor.isActive('heading', { level })) {
      // 同じレベルの見出しがアクティブな場合は、通常の段落に戻す
      editor.chain().focus().setParagraph().run()
    } else {
      // 見出しを設定
      editor.chain().focus().toggleHeading({ level }).run()
    }
  }

  // デバッグ用：コンソールにボタンの状態を出力
  console.log('MenuBar rendered, Heading1 icon:', Heading1)

  return (
    <div className="border-b border-gray-200 p-2 flex flex-wrap gap-1">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
      >
        <Undo className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
      >
        <Redo className="h-4 w-4" />
      </Button>
      
      <div className="w-px h-6 bg-gray-300 mx-1" />
      
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={cn(editor.isActive('bold') && 'bg-gray-200')}
      >
        <Bold className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={cn(editor.isActive('italic') && 'bg-gray-200')}
      >
        <Italic className="h-4 w-4" />
      </Button>
      
      <div className="w-px h-6 bg-gray-300 mx-1" />
      
      {/* H1ボタン - デバッグ用にコメントを追加 */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleHeading(1)}
        className={cn(editor.isActive('heading', { level: 1 }) && 'bg-gray-200')}
        title="見出し1 (クリックで切り替え)"
        data-testid="heading1-button"
      >
        {Heading1 ? <Heading1 className="h-4 w-4" /> : <span className="font-bold text-sm">H1</span>}
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleHeading(2)}
        className={cn(editor.isActive('heading', { level: 2 }) && 'bg-gray-200')}
        title="見出し2 (クリックで切り替え)"
      >
        <Heading2 className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleHeading(3)}
        className={cn(editor.isActive('heading', { level: 3 }) && 'bg-gray-200')}
        title="見出し3 (クリックで切り替え)"
      >
        <Heading3 className="h-4 w-4" />
      </Button>
      
      <div className="w-px h-6 bg-gray-300 mx-1" />
      
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={cn(editor.isActive('bulletList') && 'bg-gray-200')}
      >
        <List className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={cn(editor.isActive('orderedList') && 'bg-gray-200')}
      >
        <ListOrdered className="h-4 w-4" />
      </Button>
      
      <div className="w-px h-6 bg-gray-300 mx-1" />
      
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          const url = window.prompt('URLを入力してください')
          if (url) {
            editor.chain().focus().setLink({ href: url }).run()
          }
        }}
        className={cn(editor.isActive('link') && 'bg-gray-200')}
      >
        <LinkIcon className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={cn(editor.isActive('blockquote') && 'bg-gray-200')}
      >
        <Quote className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        className={cn(editor.isActive('codeBlock') && 'bg-gray-200')}
      >
        <Code className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
      >
        <Minus className="h-4 w-4" />
      </Button>
      
      <div className="w-px h-6 bg-gray-300 mx-1" />
      
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
      >
        <TableIcon className="h-4 w-4" />
      </Button>
    </div>
  )
}

export default function TipTapEditor({ content, onChange, placeholder }: TipTapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline cursor-pointer'
        }
      }),
      Blockquote.configure({
        HTMLAttributes: {
          class: 'border-l-4 border-gray-300 pl-4 italic bg-gray-50 py-2 rounded-r'
        }
      }),
      CodeBlock.configure({
        HTMLAttributes: {
          class: 'bg-gray-100 p-4 rounded font-mono text-sm border border-gray-200'
        }
      }),
      HorizontalRule.configure({
        HTMLAttributes: {
          class: 'border-t border-gray-300 my-6'
        }
      }),
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: 'border-collapse border border-gray-300 w-full my-4'
        }
      }),
      TableRow.configure({
        HTMLAttributes: {
          class: 'border-b border-gray-300'
        }
      }),
      TableHeader.configure({
        HTMLAttributes: {
          class: 'bg-gray-50 font-semibold text-left p-2 border border-gray-300'
        }
      }),
      TableCell.configure({
        HTMLAttributes: {
          class: 'p-2 border border-gray-300'
        }
      })
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'focus:outline-none min-h-[300px] p-4 leading-relaxed'
      }
    },
    immediatelyRender: false
  })

  // contentプロパティが変更されたときにエディターの内容を更新
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content)
    }
  }, [content, editor])

  return (
    <div className="border border-gray-300 rounded-md overflow-hidden">
      <MenuBar editor={editor} />
      <div className="relative">
        <EditorContent 
          editor={editor} 
          className="min-h-[300px] max-h-[600px] overflow-y-auto bg-white"
        />
        {!content && placeholder && (
          <div className="absolute top-4 left-4 text-gray-400 pointer-events-none">
            {placeholder}
          </div>
        )}
      </div>
    </div>
  )
} 