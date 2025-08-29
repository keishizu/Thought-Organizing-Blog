import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { SecurityMonitor } from '@/lib/utils/security';

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

    // 管理者権限チェック（簡易版）
    // 実際の実装では、より厳密な権限チェックが必要
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

    // セキュリティイベントを取得
    const securityMonitor = SecurityMonitor.getInstance();
    const events = securityMonitor.getEvents();

    // イベントタイプ別の統計
    const stats = {
      suspicious_request: securityMonitor.getEventCount('suspicious_request'),
      authentication_failure: securityMonitor.getEventCount('authentication_failure'),
      authorization_failure: securityMonitor.getEventCount('authorization_failure'),
      rate_limit_exceeded: securityMonitor.getEventCount('rate_limit_exceeded'),
      total: events.length,
    };

    return NextResponse.json({
      events,
      stats,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Security events API error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
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

    // セキュリティイベントをクリア
    const securityMonitor = SecurityMonitor.getInstance();
    securityMonitor.clearEvents();

    return NextResponse.json({
      message: 'セキュリティイベントがクリアされました',
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Security events clear API error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
