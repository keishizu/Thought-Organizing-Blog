import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {
  try {
    // 認証チェック
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      );
    }

    // 管理者権限チェック
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json(
        { error: '管理者権限が必要です' },
        { status: 403 }
      );
    }

    // パフォーマンスデータのサンプル（実際の実装では外部サービスから取得）
    const performanceData = {
      coreWebVitals: {
        fcp: { average: 1200, p75: 1500, p95: 2000 },
        lcp: { average: 1800, p75: 2200, p95: 3000 },
        fid: { average: 50, p75: 80, p95: 120 },
        cls: { average: 0.05, p75: 0.08, p95: 0.12 },
        ttfb: { average: 400, p75: 500, p95: 800 },
      },
      pageLoadTimes: {
        home: { average: 1200, p75: 1500, p95: 2000 },
        books: { average: 1400, p75: 1800, p95: 2500 },
        bookDetail: { average: 1600, p75: 2000, p95: 3000 },
      },
      resourceMetrics: {
        totalRequests: 1500,
        averageResponseTime: 300,
        errorRate: 0.02,
        cacheHitRate: 0.85,
      },
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(performanceData);

  } catch (error) {
    console.error('Performance API error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
