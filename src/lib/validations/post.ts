import { z } from "zod"

export const postFormSchema = z.object({
  title: z.string()
    .min(1, "タイトルは必須です")
    .max(80, "タイトルは80文字以内で入力してください"),
  subtitle: z.string()
    .max(100, "サブタイトルは100文字以内で入力してください")
    .optional(),
  category: z.string()
    .min(1, "カテゴリは必須です"),
  tags: z.array(z.string())
    .max(5, "タグは最大5個まで設定できます"),
  imageUrl: z.string().optional(),
  content: z.string()
    .min(1, "本文は必須です")
    .refine((content) => {
      // HTMLタグを除去してテキストのみをチェック
      const textContent = content.replace(/<[^>]*>/g, '').trim()
      return textContent.length > 0
    }, "本文を入力してください"),
  allowComments: z.boolean(),
  allowLikes: z.boolean(),
  status: z.enum(['draft', 'published', 'private'])
})

export type PostFormSchema = z.infer<typeof postFormSchema> 