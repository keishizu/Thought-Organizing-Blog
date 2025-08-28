import { createClient } from '@supabase/supabase-js'

// テスト用のSupabaseクライアント
export const createTestSupabaseClient = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://test.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'test-anon-key'
  )
}

// テスト用のユーザー認証
export const authenticateTestUser = async (email: string, password: string) => {
  const supabase = createTestSupabaseClient()
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  
  if (error) throw error
  return data
}

// テスト用のデータクリーンアップ
export const cleanupTestData = async (tableName: string, testId: string) => {
  const supabase = createTestSupabaseClient()
  await supabase
    .from(tableName)
    .delete()
    .eq('id', testId)
}

// テスト用の投稿データ作成
export const createTestPost = async (postData: any) => {
  const supabase = createTestSupabaseClient()
  const { data, error } = await supabase
    .from('posts')
    .insert(postData)
    .select()
    .single()
  
  if (error) throw error
  return data
}

// テスト用のコメントデータ作成
export const createTestComment = async (commentData: any) => {
  const supabase = createTestSupabaseClient()
  const { data, error } = await supabase
    .from('comments')
    .insert(commentData)
    .select()
    .single()
  
  if (error) throw error
  return data
}

// テスト用のいいねデータ作成
export const createTestLike = async (likeData: any) => {
  const supabase = createTestSupabaseClient()
  const { data, error } = await supabase
    .from('likes')
    .insert(likeData)
    .select()
    .single()
  
  if (error) throw error
  return data
}

// テスト用の匿名ID生成
export const generateTestAnonymousId = () => {
  return `test-anon-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

// テスト用の環境変数設定
export const setTestEnvironment = () => {
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'
}
