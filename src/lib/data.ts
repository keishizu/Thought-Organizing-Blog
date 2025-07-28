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

// データベースから取得した記事の型
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
}

export const sampleArticles: Article[] = [
  {
    id: 'finding-your-path',
    title: '迷子になることの価値 - 人生に正解はないという気づき',
    excerpt: '完璧な道筋を描こうとして立ち止まってしまうことがあります。でも、迷うことそのものが、実は最も大切な学びの時間なのかもしれません。',
    content: '記事の本文がここに入ります...',
    category: '思考と行動',
    date: '2024年3月15日',
    author: '管理者',
    imageUrl: 'https://images.pexels.com/photos/1456951/pexels-photo-1456951.jpeg?auto=compress&cs=tinysrgb&w=800',
    likes: 24,
    readTime: '約5分',
    tags: ['人生', '迷い', '成長'],
  },
  {
    id: 'career-transition',
    title: 'キャリアチェンジという冒険 - 30代で歩む新しい道',
    excerpt: '安定した仕事を手放すことへの不安。それでも新しい挑戦を選んだ理由と、その過程で学んだことを振り返ります。',
    content: '記事の本文がここに入ります...',
    category: 'キャリアと選択',
    date: '2024年3月12日',
    author: '管理者',
    imageUrl: 'https://images.pexels.com/photos/1181677/pexels-photo-1181677.jpeg?auto=compress&cs=tinysrgb&w=800',
    likes: 31,
    readTime: '約7分',
    tags: ['キャリア', '転職', '挑戦'],
  },
  {
    id: 'morning-ritual',
    title: '朝のコーヒーが教えてくれること - 日常の小さな豊かさ',
    excerpt: '毎朝同じように淹れるコーヒー。その儀式的な時間が、実は一日の質を決めている気がします。小さな習慣の持つ力について。',
    content: '記事の本文がここに入ります...',
    category: '気づきと日常',
    date: '2024年3月10日',
    author: '管理者',
    imageUrl: 'https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg?auto=compress&cs=tinysrgb&w=800',
    likes: 18,
    readTime: '約4分',
    tags: ['日常', '習慣', 'コーヒー'],
  },
  {
    id: 'silence-value',
    title: '沈黙の価値 - 言葉にしないことの美しさ',
    excerpt: '何でも言葉にしようとする現代。でも、沈黙にも深い意味があることを、最近よく考えます。',
    content: '記事の本文がここに入ります...',
    category: '思考と行動',
    date: '2024年3月8日',
    author: '管理者',
    imageUrl: 'https://images.pexels.com/photos/1181248/pexels-photo-1181248.jpeg?auto=compress&cs=tinysrgb&w=800',
    likes: 27,
    readTime: '約6分',
    tags: ['沈黙', '内省', '思考'],
  },
];

export const categories = [
  {
    id: 'thinking-action',
    name: '思考と行動',
    description: '日々の選択や決断について、立ち止まって考えてみる。自分の価値観や行動パターンを見つめ直すきっかけに。',
    slug: 'thinking-action',
  },
  {
    id: 'career-choice',
    name: 'キャリアと選択',
    description: '仕事や人生の方向性について。迷いながらも前に進む、そんな体験談や気づきを綴ります。',
    slug: 'career-choice',
  },
  {
    id: 'insights-daily',
    name: '気づきと日常',
    description: '何気ない日常の中に隠れている、小さな発見や学び。ふとした瞬間の美しさを言葉にして。',
    slug: 'insights-daily',
  },
];

// データベースから公開済み記事を取得する関数
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
      console.error('記事取得エラー:', error);
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
      readTime: '約5分', // 将来的に実際の読了時間を計算
      tags: post.tags || [],
    }));
  } catch (error) {
    console.error('記事取得エラー:', error);
    return [];
  }
}

// カテゴリー別の公開済み記事を取得
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
      console.error('カテゴリー記事取得エラー:', error);
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
      readTime: '約5分',
      tags: post.tags || [],
    }));
  } catch (error) {
    console.error('カテゴリー記事取得エラー:', error);
    return [];
  }
}

// 特定の記事を取得
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

    if (error || !data) {
      console.error('記事取得エラー:', error);
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
      readTime: '約5分',
      tags: post.tags || [],
      allowComments: post.allow_comments ?? true,
      allowLikes: post.allow_likes ?? true,
    };
  } catch (error) {
    console.error('記事取得エラー:', error);
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

export function getRecommendedArticles(limit: number = 4): Article[] {
  return sampleArticles.slice(0, limit);
}