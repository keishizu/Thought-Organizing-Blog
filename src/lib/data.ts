import { calculateReadTimeFromHTML } from '@/lib/utils/readTime';

// サンプルデータ
export interface Article {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  date: string;
  author: string;
  imageUrl?: string;
  likes: number;
  readTime: string;
  tags: string[];
  allowComments?: boolean;
  allowLikes?: boolean;
}

// データベースから取得した図書の型
export interface DatabaseArticle {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string[];
  status: 'draft' | 'published' | 'private';
  created_at: string | null;
  updated_at: string | null;
  likes: number;
  image_url?: string | null;
  author_id: string;
  allow_comments?: boolean | null;
  allow_likes?: boolean | null;
  is_recommended?: boolean | null;
}

export const categories = [
  {
    id: 'thinking-action',
    name: '思整術',
    slug: 'thinking-action',
    description: '感情や考えを整理し行動に移すための方法の紹介をテーマに、日常に取り入れやすい思考の整理術をお届けします。'
  },
  {
    id: 'career-choice',
    name: '仕事と分岐点',
    slug: 'career-choice',
    description: '働き方の選択や転機をテーマに、迷いや不安を抱えながらも、自分らしい道を見つけるヒントをお届けします。'
  },
  {
    id: 'insights-daily',
    name: '日常と気づき',
    slug: 'insights-daily',
    description: '日々の出来事から生まれる小さな気づきをテーマに、忙しい日常の中で自分を見つめ直すキッカケをお届けします。'
  }
];

// データベースから公開済み図書を取得する関数
export async function getPublishedArticles(): Promise<Article[]> {
  try {
    const { createServerSupabaseClient } = await import('@/lib/supabase-server');
    const supabase = await createServerSupabaseClient();
    
    // ネットワークタイムアウトを設定
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('ネットワークタイムアウト')), 10000); // 10秒
    });
    
    const dataPromise = supabase
      .from('posts')
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false });

    const { data, error } = await Promise.race([dataPromise, timeoutPromise]) as any;

    if (error) {
      console.error('図書取得エラー:', error);
      return [];
    }

    return (data || []).map((post: any) => ({
      id: post.id,
      title: post.title,
      excerpt: post.excerpt,
      content: post.content,
      category: post.category,
      date: post.created_at ? new Date(post.created_at).toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }) : '日付不明',
      author: '管理者',
      imageUrl: post.image_url || undefined,
      likes: post.likes || 0,
      readTime: calculateReadTimeFromHTML(post.content),
      tags: post.tags || [],
    }));
  } catch (error) {
    // エラーの詳細をログに出力
    if (error instanceof Error) {
      console.error('図書取得エラー:', {
        message: error.message,
        name: error.name,
        stack: error.stack
      });
    } else {
      console.error('図書取得エラー（不明なエラー）:', error);
    }
    
    // ネットワークエラーの場合は空配列を返す
    return [];
  }
}

// おすすめ図書を取得する関数
export async function getRecommendedArticles(): Promise<Article[]> {
  try {
    const { createServerSupabaseClient } = await import('@/lib/supabase-server');
    const supabase = await createServerSupabaseClient();
    
    // ネットワークタイムアウトを設定
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('ネットワークタイムアウト')), 10000); // 10秒
    });
    
    const dataPromise = supabase
      .from('posts')
      .select('*')
      .eq('status', 'published')
      .eq('is_recommended', true)
      .order('created_at', { ascending: false });

    const { data, error } = await Promise.race([dataPromise, timeoutPromise]) as any;

    if (error) {
      console.error('おすすめ図書取得エラー:', error);
      return [];
    }

    return (data || []).map((post: any) => ({
      id: post.id,
      title: post.title,
      excerpt: post.excerpt,
      content: post.content,
      category: post.category,
      date: post.created_at ? new Date(post.created_at).toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }) : '日付不明',
      author: '管理者',
      imageUrl: post.image_url || undefined,
      likes: post.likes || 0,
      readTime: calculateReadTimeFromHTML(post.content),
      tags: post.tags || [],
    }));
  } catch (error) {
    // エラーの詳細をログに出力
    if (error instanceof Error) {
      console.error('おすすめ図書取得エラー:', {
        message: error.message,
        name: error.name,
        stack: error.stack
      });
    } else {
      console.error('おすすめ図書取得エラー（不明なエラー）:', error);
    }
    
    // ネットワークエラーの場合は空配列を返す
    return [];
  }
}

// カテゴリー別の公開済み図書を取得する関数
export async function getPublishedArticlesByCategory(categorySlug: string): Promise<Article[]> {
  const categoryName = categories.find(cat => cat.slug === categorySlug)?.name;
  if (!categoryName) return [];

  try {
    const { createServerSupabaseClient } = await import('@/lib/supabase-server');
    const supabase = await createServerSupabaseClient();
    
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('status', 'published')
      .eq('category', categoryName)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('カテゴリー図書取得エラー:', error);
      return [];
    }

    return (data || []).map((post: any) => ({
      id: post.id,
      title: post.title,
      excerpt: post.excerpt,
      content: post.content,
      category: post.category,
      date: post.created_at ? new Date(post.created_at).toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }) : '日付不明',
      author: '管理者',
      imageUrl: post.image_url || undefined,
      likes: post.likes || 0,
      readTime: calculateReadTimeFromHTML(post.content),
      tags: post.tags || [],
    }));
  } catch (error) {
    console.error('カテゴリー図書取得エラー:', error);
    return [];
  }
}

// 特定の図書を取得
export async function getPublishedArticleById(id: string): Promise<Article | null> {
  try {
    const { createServerSupabaseClient } = await import('@/lib/supabase-server');
    const supabase = await createServerSupabaseClient();
    
    // キャッシュを無効化して常に最新のデータを取得
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('id', id)
      .eq('status', 'published')
      .single();

    if (error) {
      console.error('図書取得エラー:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      return null;
    }

    if (!data) {
      console.error('図書が見つかりません:', id);
      return null;
    }

    const post: any = data;
    return {
      id: post.id,
      title: post.title,
      excerpt: post.excerpt,
      content: post.content,
      category: post.category,
      date: post.created_at ? new Date(post.created_at).toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }) : '日付不明',
      author: '管理者',
      imageUrl: post.image_url || undefined,
      likes: post.likes || 0,
      readTime: calculateReadTimeFromHTML(post.content),
      tags: post.tags || [],
      allowComments: post.allow_comments ?? true,
      allowLikes: post.allow_likes ?? true,
    };
  } catch (error) {
    console.error('図書取得エラー:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      details: error instanceof Error ? error.stack : String(error),
      hint: 'Supabaseクライアントの初期化またはネットワーク接続に問題がある可能性があります',
      code: ''
    });
    return null;
  }
}