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

export const sampleArticles: Article[] = [
  {
    id: 'finding-your-path',
    title: '迷子になることの価値 - 人生に正解はないという気づき',
    excerpt: '完璧な道筋を描こうとして立ち止まってしまうことがあります。でも、迷うことそのものが、実は最も大切な学びの時間なのかもしれません。',
    content: `迷子になることの価値について、深く考えてみましょう。

人生には正解がないと言われますが、それは本当でしょうか？私たちは常に「正しい道」を探そうとして、迷うことを恐れています。でも、迷うことそのものが、実は最も大切な学びの時間なのかもしれません。

迷子になることで、私たちは新しい景色を見ることができます。予期しない場所で、予期しない人と出会い、予期しない発見をすることがあります。それは、計画通りに進むことでは決して得られない、貴重な経験です。

迷いながらも前に進む勇気を持つこと。それが、人生を豊かにする秘訣なのかもしれません。完璧な道筋を描こうとして立ち止まってしまうよりも、一歩ずつ進んでいくことの方が、実は正解に近づく方法なのかもしれません。

迷子になることを恐れずに、人生という冒険を楽しんでみませんか？`,
    category: '思整術',
    date: '2024年3月15日',
    author: '管理者',
    imageUrl: 'https://images.pexels.com/photos/1456951/pexels-photo-1456951.jpeg?auto=compress&cs=tinysrgb&w=800',
    likes: 24,
    readTime: calculateReadTimeFromHTML('図書の本文がここに入ります...'),
    tags: ['人生', '迷い', '成長'],
  },
  {
    id: 'career-transition',
    title: 'キャリアチェンジという冒険 - 30代で歩む新しい道',
    excerpt: '安定した仕事を手放すことへの不安。それでも新しい挑戦を選んだ理由と、その過程で学んだことを振り返ります。',
    content: '図書の本文がここに入ります...',
    category: '仕事と分岐点',
    date: '2024年3月12日',
    author: '管理者',
    imageUrl: 'https://images.pexels.com/photos/1181677/pexels-photo-1181677.jpeg?auto=compress&cs=tinysrgb&w=800',
    likes: 31,
    readTime: calculateReadTimeFromHTML('図書の本文がここに入ります...'),
    tags: ['キャリア', '転職', '挑戦'],
  },
  {
    id: 'morning-ritual',
    title: '朝のコーヒーが教えてくれること - 日常の小さな豊かさ',
    excerpt: '毎朝同じように淹れるコーヒー。その儀式的な時間が、実は一日の質を決めている気がします。小さな習慣の持つ力について。',
    content: '図書の本文がここに入ります...',
    category: '日常と気づき',
    date: '2024年3月10日',
    author: '管理者',
    imageUrl: 'https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg?auto=compress&cs=tinysrgb&w=800',
    likes: 18,
    readTime: calculateReadTimeFromHTML('図書の本文がここに入ります...'),
    tags: ['日常', '習慣', 'コーヒー'],
  },
  {
    id: 'silence-value',
    title: '沈黙の価値 - 言葉にしないことの美しさ',
    excerpt: '何でも言葉にしようとする現代。でも、沈黙にも深い意味があることを、最近よく考えます。',
    content: '図書の本文がここに入ります...',
    category: '思整術',
    date: '2024年3月8日',
    author: '管理者',
    imageUrl: 'https://images.pexels.com/photos/1181248/pexels-photo-1181248.jpeg?auto=compress&cs=tinysrgb&w=800',
    likes: 27,
    readTime: calculateReadTimeFromHTML('図書の本文がここに入ります...'),
    tags: ['沈黙', '内省', '思考'],
  },
];

export const categories = [
  {
    id: 'thinking-action',
    name: '思整術',
    description: '感情や考えを整理し行動に移すための方法の紹介をテーマに、日常に取り入れやすい思考の整理術をお届けします。',
    slug: 'thinking-action',
  },
  {
    id: 'career-choice',
    name: '仕事と分岐点',
    description: '働き方の選択や転機をテーマに、迷いや不安を抱えながらも、自分らしい道を見つけるヒントをお届けします。',
    slug: 'career-choice',
  },
  {
    id: 'insights-daily',
    name: '日常と気づき',
    description: '日々の出来事から生まれる小さな気づきをテーマに、忙しい日常の中で自分を見つめ直すキッカケをお届けします。',
    slug: 'insights-daily',
  },
];

// データベースから公開済み図書を取得する関数
export async function getPublishedArticles(): Promise<Article[]> {
  try {
    const { createServerSupabaseClient } = await import('@/lib/supabase-server');
    const supabase = await createServerSupabaseClient();
    
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false });

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
    console.error('図書取得エラー:', error);
    return [];
  }
}

// おすすめ図書を取得する関数
export async function getRecommendedArticles(): Promise<Article[]> {
  try {
    const { createServerSupabaseClient } = await import('@/lib/supabase-server');
    const supabase = await createServerSupabaseClient();
    
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('status', 'published')
      .eq('is_recommended', true)
      .order('created_at', { ascending: false })
      .limit(3);

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
    console.error('おすすめ図書取得エラー:', error);
    return [];
  }
}

// カテゴリー別の公開済み図書を取得
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

// ユーティリティ関数（後方互換性のため残す）
export function getArticlesByCategory(categorySlug: string): Article[] {
  const categoryName = categories.find(cat => cat.slug === categorySlug)?.name;
  return sampleArticles.filter(article => article.category === categoryName);
}

export function getArticleById(id: string): Article | undefined {
  return sampleArticles.find(article => article.id === id);
}

export function getRecentArticles(limit: number = 3): Article[] {
  return sampleArticles.slice(0, limit);
}

export function getSampleRecommendedArticles(limit: number = 4): Article[] {
  return sampleArticles.slice(0, limit);
}