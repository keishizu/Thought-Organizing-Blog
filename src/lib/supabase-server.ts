'use server'

import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { Database } from '@/types/supabase'

export async function createServerSupabaseClient() {
  try {
    const cookieStore = await cookies()
    
    // 環境変数の確認
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseAnonKey) {
      const missingVars = [];
      if (!supabaseUrl) missingVars.push('NEXT_PUBLIC_SUPABASE_URL');
      if (!supabaseAnonKey) missingVars.push('NEXT_PUBLIC_SUPABASE_ANON_KEY');
      
      throw new Error(`Supabase環境変数が設定されていません: ${missingVars.join(', ')}`)
    }
    
    // URLの形式確認
    try {
      new URL(supabaseUrl);
    } catch {
      throw new Error('NEXT_PUBLIC_SUPABASE_URLの形式が正しくありません');
    }
    
    // キーの形式確認（JWTトークンの形式）
    if (!supabaseAnonKey.startsWith('eyJ')) {
      throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEYの形式が正しくありません');
    }
    
    return createServerClient<Database>(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookies: {
          getAll: cookieStore.getAll,
          setAll: (cookies) => {
            try {
              cookies.forEach(({ name, value, options }) => {
                cookieStore.set(name, value, options)
              })
            } catch {
              // The `setAll` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
        }
      }
    )
  } catch (error) {
    // エラーの詳細をログに出力
    if (error instanceof Error) {
      console.error('Supabaseクライアント初期化エラー:', {
        message: error.message,
        name: error.name,
        stack: error.stack
      });
    } else {
      console.error('Supabaseクライアント初期化エラー（不明なエラー）:', error);
    }
    
    // エラーを再スローして上位で処理できるようにする
    throw error
  }
}
