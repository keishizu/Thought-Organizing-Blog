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
  "思考と行動",
  "キャリアと選択", 
  "気づきと日常",
  "お知らせ"
] as const

export type Category = typeof CATEGORIES[number] 