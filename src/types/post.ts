export interface PostFormData {
  title: string
  subtitle?: string
  category: string
  tags: string[]
  imageUrl?: string
  content: string // HTMLで保存
  allowComments: boolean
  allowLikes: boolean
  isRecommended: boolean
  status: 'draft' | 'published' | 'private'
}

export interface PostFormProps {
  initialValues?: Partial<PostFormData>
  onSubmit: (data: PostFormData) => void
  onSaveDraft?: (data: PostFormData) => void
  isLoading?: boolean
  isEdit?: boolean
}

export const CATEGORIES = [
  "思整術",
  "仕事と分岐点", 
  "日常と気づき",
  "お知らせ"
] as const

export type Category = typeof CATEGORIES[number] 