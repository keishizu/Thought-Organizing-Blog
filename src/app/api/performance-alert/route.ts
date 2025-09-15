import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { metrics, regressions, timestamp } = await request.json()

    // アラート情報をログ出力
    console.warn('🚨 PERFORMANCE REGRESSION DETECTED 🚨', {
      url: metrics.url,
      timestamp: new Date(timestamp).toISOString(),
      regressions,
      metrics: {
        lcp: `${metrics.lcp}ms`,
        fid: `${metrics.fid}ms`,
        cls: metrics.cls,
        fcp: `${metrics.fcp}ms`,
        ttfb: `${metrics.ttfb}ms`,
        memoryUsage: `${Math.round(metrics.memoryUsage / 1024 / 1024)}MB`,
      }
    })

    // 重要度の判定
    const severity = determineSeverity(regressions)
    
    // 開発環境では詳細ログを出力
    if (process.env.NODE_ENV === 'development') {
      console.log('Performance Alert Details:', {
        severity,
        pageUrl: metrics.url,
        sessionId: metrics.sessionId,
        userAgent: metrics.userAgent,
        regressionCount: regressions.length,
        detailedRegressions: regressions,
      })
    }

    // 重要度が高い場合の処理
    if (severity === 'critical') {
      // 本番環境では管理者にメール通知等を実装
      await sendCriticalAlert(metrics, regressions, timestamp)
    }

    // アラート履歴をファイルに保存（開発用）
    if (process.env.NODE_ENV === 'development') {
      await saveAlertToFile(metrics, regressions, timestamp, severity)
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Performance alert processed',
      severity,
      alertId: `alert-${timestamp}-${Math.random().toString(36).substr(2, 9)}`
    })

  } catch (error) {
    console.error('Error processing performance alert:', error)
    return NextResponse.json(
      { error: 'Failed to process performance alert' },
      { status: 500 }
    )
  }
}

/**
 * アラートの重要度を判定
 */
function determineSeverity(regressions: string[]): 'low' | 'medium' | 'high' | 'critical' {
  const criticalKeywords = ['lcp', 'cls', 'fid']
  const highKeywords = ['fcp', 'ttfb', 'pageLoadTime']
  
  let criticalCount = 0
  let highCount = 0
  
  regressions.forEach(regression => {
    const lowerRegression = regression.toLowerCase()
    if (criticalKeywords.some(keyword => lowerRegression.includes(keyword))) {
      criticalCount++
    } else if (highKeywords.some(keyword => lowerRegression.includes(keyword))) {
      highCount++
    }
  })

  if (criticalCount >= 2) return 'critical'
  if (criticalCount >= 1 || highCount >= 3) return 'high'
  if (highCount >= 2) return 'medium'
  return 'low'
}

/**
 * 重要なアラートの送信
 */
async function sendCriticalAlert(metrics: any, regressions: string[], timestamp: number): Promise<void> {
  try {
    // 本番環境では実際のメール送信やSlack通知を実装
    console.error('🚨 CRITICAL PERFORMANCE REGRESSION 🚨', {
      message: 'Critical performance regression detected - immediate attention required',
      url: metrics.url,
      time: new Date(timestamp).toISOString(),
      regressions: regressions.join(', '),
      coreWebVitals: {
        lcp: metrics.lcp,
        fid: metrics.fid,
        cls: metrics.cls,
      }
    })

    // TODO: 実際のアラート送信を実装
    // - メール送信
    // - Slack通知
    // - 外部監視サービスへの通知
    
  } catch (error) {
    console.error('Failed to send critical alert:', error)
  }
}

/**
 * アラート情報をファイルに保存
 */
async function saveAlertToFile(metrics: any, regressions: string[], timestamp: number, severity: string): Promise<void> {
  try {
    const fs = await import('fs')
    const path = await import('path')
    
    const alertsDir = path.join(process.cwd(), 'performance-alerts')
    if (!fs.existsSync(alertsDir)) {
      fs.mkdirSync(alertsDir, { recursive: true })
    }

    const alertData = {
      alertId: `alert-${timestamp}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(timestamp).toISOString(),
      severity,
      url: metrics.url,
      sessionId: metrics.sessionId,
      userAgent: metrics.userAgent,
      regressions,
      metrics: {
        lcp: metrics.lcp,
        fid: metrics.fid,
        cls: metrics.cls,
        fcp: metrics.fcp,
        ttfb: metrics.ttfb,
        pageLoadTime: metrics.pageLoadTime,
        memoryUsage: metrics.memoryUsage,
      },
      thresholds: {
        lcp: { good: 2500, needsImprovement: 4000 },
        fid: { good: 100, needsImprovement: 300 },
        cls: { good: 0.1, needsImprovement: 0.25 },
        fcp: { good: 1800, needsImprovement: 3000 },
        ttfb: { good: 800, needsImprovement: 1800 },
      }
    }

    const filename = `alert-${severity}-${new Date(timestamp).toISOString().split('T')[0]}-${timestamp}.json`
    const filepath = path.join(alertsDir, filename)
    
    fs.writeFileSync(filepath, JSON.stringify(alertData, null, 2))

    // アラート履歴の更新
    const historyFile = path.join(alertsDir, 'alert-history.json')
    let history: any[] = []
    
    if (fs.existsSync(historyFile)) {
      const historyData = fs.readFileSync(historyFile, 'utf-8')
      history = JSON.parse(historyData)
    }
    
    history.push({
      alertId: alertData.alertId,
      timestamp: alertData.timestamp,
      severity,
      url: metrics.url,
      regressionCount: regressions.length,
      filename,
    })

    // 履歴は最新100件のみ保持
    if (history.length > 100) {
      history = history.slice(-100)
    }
    
    fs.writeFileSync(historyFile, JSON.stringify(history, null, 2))

  } catch (error) {
    console.error('Failed to save alert to file:', error)
  }
}
