import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { metrics, sessionId } = await request.json()

    // 開発環境でのログ出力
    if (process.env.NODE_ENV === 'development') {
      console.log('Performance Metrics Received:', {
        sessionId,
        metricsCount: metrics.length,
        latestMetrics: metrics[metrics.length - 1],
      })
    }

    // 本番環境では外部監視サービスに送信
    if (process.env.NODE_ENV === 'production') {
      // TODO: 外部監視サービス（Datadog, New Relic等）への送信を実装
      // await sendToMonitoringService(metrics, sessionId)
    }

    // メトリクスをローカルファイルに保存（開発用）
    if (process.env.NODE_ENV === 'development') {
      const fs = await import('fs')
      const path = await import('path')
      
      const metricsDir = path.join(process.cwd(), 'performance-metrics')
      if (!fs.existsSync(metricsDir)) {
        fs.mkdirSync(metricsDir, { recursive: true })
      }

      const filename = `metrics-${sessionId}-${Date.now()}.json`
      const filepath = path.join(metricsDir, filename)
      
      fs.writeFileSync(filepath, JSON.stringify({
        sessionId,
        timestamp: new Date().toISOString(),
        metrics,
        summary: {
          avgLCP: metrics.reduce((sum: number, m: any) => sum + m.lcp, 0) / metrics.length,
          avgFID: metrics.reduce((sum: number, m: any) => sum + m.fid, 0) / metrics.length,
          avgCLS: metrics.reduce((sum: number, m: any) => sum + m.cls, 0) / metrics.length,
          avgFCP: metrics.reduce((sum: number, m: any) => sum + m.fcp, 0) / metrics.length,
          avgTTFB: metrics.reduce((sum: number, m: any) => sum + m.ttfb, 0) / metrics.length,
          maxMemoryUsage: Math.max(...metrics.map((m: any) => m.memoryUsage || 0)),
        }
      }, null, 2))
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Performance metrics received',
      sessionId 
    })

  } catch (error) {
    console.error('Error processing performance metrics:', error)
    return NextResponse.json(
      { error: 'Failed to process performance metrics' },
      { status: 500 }
    )
  }
}
