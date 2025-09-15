/**
 * パフォーマンス劣化検出システム
 * 履歴データと比較してパフォーマンスの劣化を検出
 */

export interface PerformanceBaseline {
  url: string
  timestamp: string
  scores: {
    performance: number
    accessibility: number
    bestPractices: number
    seo: number
  }
  coreWebVitals: {
    lcp: number
    fid: number
    cls: number
    fcp: number
    ttfb: number
  }
  metrics: {
    pageLoadTime: number
    memoryUsage: number
    resourceCount: number
    totalResourceSize: number
  }
}

export interface RegressionResult {
  hasRegression: boolean
  severity: 'low' | 'medium' | 'high' | 'critical'
  regressions: Array<{
    metric: string
    current: number
    baseline: number
    change: number
    changePercent: number
    threshold: number
  }>
  summary: {
    totalRegressions: number
    criticalRegressions: number
    highRegressions: number
  }
}

export class RegressionDetector {
  private baselines: Map<string, PerformanceBaseline[]> = new Map()
  
  // 劣化検出の閾値設定
  private regressionThresholds = {
    // スコア系（下がると悪化）
    performance: { medium: -5, high: -10, critical: -15 }, // -5ポイント以上の低下
    accessibility: { medium: -3, high: -7, critical: -10 },
    bestPractices: { medium: -3, high: -7, critical: -10 },
    seo: { medium: -3, high: -7, critical: -10 },
    
    // Core Web Vitals（上がると悪化）
    lcp: { medium: 500, high: 1000, critical: 2000 }, // +500ms以上の増加
    fid: { medium: 50, high: 100, critical: 200 }, // +50ms以上の増加
    cls: { medium: 0.05, high: 0.1, critical: 0.15 }, // +0.05以上の増加
    fcp: { medium: 300, high: 600, critical: 1000 }, // +300ms以上の増加
    ttfb: { medium: 200, high: 500, critical: 1000 }, // +200ms以上の増加
    
    // その他のメトリクス
    pageLoadTime: { medium: 1000, high: 2000, critical: 3000 },
    memoryUsage: { medium: 10 * 1024 * 1024, high: 25 * 1024 * 1024, critical: 50 * 1024 * 1024 }, // MB
  }

  /**
   * ベースラインデータの追加
   */
  addBaseline(baseline: PerformanceBaseline): void {
    const url = baseline.url
    if (!this.baselines.has(url)) {
      this.baselines.set(url, [])
    }
    
    const baselines = this.baselines.get(url)!
    baselines.push(baseline)
    
    // 最新20件のみ保持
    if (baselines.length > 20) {
      baselines.splice(0, baselines.length - 20)
    }
    
    // 時系列順にソート
    baselines.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
  }

  /**
   * ベースラインデータの読み込み
   */
  async loadBaselines(url?: string): Promise<void> {
    try {
      // 実際の実装では、ファイルシステムやAPIからデータを読み込み
      // ここではダミーデータを使用
      const dummyBaselines: PerformanceBaseline[] = [
        {
          url: '/',
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1日前
          scores: { performance: 95, accessibility: 98, bestPractices: 92, seo: 96 },
          coreWebVitals: { lcp: 2200, fid: 80, cls: 0.08, fcp: 1600, ttfb: 450 },
          metrics: { pageLoadTime: 2800, memoryUsage: 45 * 1024 * 1024, resourceCount: 25, totalResourceSize: 2.5 * 1024 * 1024 }
        },
        {
          url: '/posts',
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          scores: { performance: 90, accessibility: 96, bestPractices: 88, seo: 94 },
          coreWebVitals: { lcp: 2500, fid: 100, cls: 0.10, fcp: 1800, ttfb: 600 },
          metrics: { pageLoadTime: 3200, memoryUsage: 50 * 1024 * 1024, resourceCount: 30, totalResourceSize: 3.2 * 1024 * 1024 }
        }
      ]

      for (const baseline of dummyBaselines) {
        if (!url || baseline.url === url) {
          this.addBaseline(baseline)
        }
      }
    } catch (error) {
      console.error('Failed to load baselines:', error)
    }
  }

  /**
   * パフォーマンス劣化の検出
   */
  detectRegression(current: PerformanceBaseline): RegressionResult {
    const url = current.url
    const baselines = this.baselines.get(url)
    
    if (!baselines || baselines.length === 0) {
      return {
        hasRegression: false,
        severity: 'low',
        regressions: [],
        summary: { totalRegressions: 0, criticalRegressions: 0, highRegressions: 0 }
      }
    }

    // 最新のベースラインと比較（直近のデータを使用）
    const latestBaseline = baselines[baselines.length - 1]
    
    // 平均ベースラインとも比較（より安定した比較）
    const avgBaseline = this.calculateAverageBaseline(baselines)
    
    // 両方の比較結果を統合
    const regressions = [
      ...this.compareMetrics(current, latestBaseline, 'latest'),
      ...this.compareMetrics(current, avgBaseline, 'average')
    ]

    // 重複を除去し、より厳しい判定を採用
    const uniqueRegressions = this.deduplicateRegressions(regressions)
    
    // 重要度の判定
    const severity = this.determineSeverity(uniqueRegressions)
    
    const summary = {
      totalRegressions: uniqueRegressions.length,
      criticalRegressions: uniqueRegressions.filter(r => this.getMetricSeverity(r.metric, r.change) === 'critical').length,
      highRegressions: uniqueRegressions.filter(r => this.getMetricSeverity(r.metric, r.change) === 'high').length,
    }

    return {
      hasRegression: uniqueRegressions.length > 0,
      severity,
      regressions: uniqueRegressions,
      summary
    }
  }

  /**
   * メトリクスの比較
   */
  private compareMetrics(current: PerformanceBaseline, baseline: PerformanceBaseline, comparisonType: string): Array<any> {
    const regressions: Array<any> = []

    // スコア系の比較（低下が劣化）
    Object.entries(current.scores).forEach(([metric, currentValue]) => {
      const baselineValue = (baseline.scores as any)[metric]
      const change = currentValue - baselineValue
      const changePercent = (change / baselineValue) * 100

      if (this.isScoreRegression(metric, change)) {
        regressions.push({
          metric: `${metric}_score`,
          current: currentValue,
          baseline: baselineValue,
          change,
          changePercent,
          threshold: this.regressionThresholds[metric as keyof typeof this.regressionThresholds]?.medium || 0,
          comparisonType
        })
      }
    })

    // Core Web Vitalsの比較（増加が劣化）
    Object.entries(current.coreWebVitals).forEach(([metric, currentValue]) => {
      const baselineValue = (baseline.coreWebVitals as any)[metric]
      const change = currentValue - baselineValue
      const changePercent = (change / baselineValue) * 100

      if (this.isCoreWebVitalRegression(metric, change)) {
        regressions.push({
          metric: `cwv_${metric}`,
          current: currentValue,
          baseline: baselineValue,
          change,
          changePercent,
          threshold: this.regressionThresholds[metric as keyof typeof this.regressionThresholds]?.medium || 0,
          comparisonType
        })
      }
    })

    // その他のメトリクスの比較
    Object.entries(current.metrics).forEach(([metric, currentValue]) => {
      const baselineValue = (baseline.metrics as any)[metric]
      const change = currentValue - baselineValue
      const changePercent = (change / baselineValue) * 100

      if (this.isMetricRegression(metric, change)) {
        regressions.push({
          metric: `metric_${metric}`,
          current: currentValue,
          baseline: baselineValue,
          change,
          changePercent,
          threshold: this.regressionThresholds[metric as keyof typeof this.regressionThresholds]?.medium || 0,
          comparisonType
        })
      }
    })

    return regressions
  }

  /**
   * 平均ベースラインの計算
   */
  private calculateAverageBaseline(baselines: PerformanceBaseline[]): PerformanceBaseline {
    const count = baselines.length
    const avgBaseline: PerformanceBaseline = {
      url: baselines[0].url,
      timestamp: new Date().toISOString(),
      scores: {
        performance: 0,
        accessibility: 0,
        bestPractices: 0,
        seo: 0
      },
      coreWebVitals: {
        lcp: 0,
        fid: 0,
        cls: 0,
        fcp: 0,
        ttfb: 0
      },
      metrics: {
        pageLoadTime: 0,
        memoryUsage: 0,
        resourceCount: 0,
        totalResourceSize: 0
      }
    }

    // 各メトリクスの平均を計算
    baselines.forEach(baseline => {
      Object.keys(avgBaseline.scores).forEach(key => {
        (avgBaseline.scores as any)[key] += (baseline.scores as any)[key]
      })
      Object.keys(avgBaseline.coreWebVitals).forEach(key => {
        (avgBaseline.coreWebVitals as any)[key] += (baseline.coreWebVitals as any)[key]
      })
      Object.keys(avgBaseline.metrics).forEach(key => {
        (avgBaseline.metrics as any)[key] += (baseline.metrics as any)[key]
      })
    })

    // 平均値に変換
    Object.keys(avgBaseline.scores).forEach(key => {
      (avgBaseline.scores as any)[key] = Math.round((avgBaseline.scores as any)[key] / count)
    })
    Object.keys(avgBaseline.coreWebVitals).forEach(key => {
      (avgBaseline.coreWebVitals as any)[key] = Math.round((avgBaseline.coreWebVitals as any)[key] / count)
    })
    Object.keys(avgBaseline.metrics).forEach(key => {
      (avgBaseline.metrics as any)[key] = Math.round((avgBaseline.metrics as any)[key] / count)
    })

    return avgBaseline
  }

  /**
   * 重複する劣化検出結果の除去
   */
  private deduplicateRegressions(regressions: Array<any>): Array<any> {
    const uniqueMap = new Map<string, any>()

    regressions.forEach(regression => {
      const key = regression.metric
      const existing = uniqueMap.get(key)

      if (!existing || Math.abs(regression.change) > Math.abs(existing.change)) {
        uniqueMap.set(key, regression)
      }
    })

    return Array.from(uniqueMap.values())
  }

  /**
   * スコア系メトリクスの劣化判定
   */
  private isScoreRegression(metric: string, change: number): boolean {
    const threshold = this.regressionThresholds[metric as keyof typeof this.regressionThresholds]
    return threshold && change <= threshold.medium
  }

  /**
   * Core Web Vitalsの劣化判定
   */
  private isCoreWebVitalRegression(metric: string, change: number): boolean {
    const threshold = this.regressionThresholds[metric as keyof typeof this.regressionThresholds]
    return threshold && change >= threshold.medium
  }

  /**
   * その他メトリクスの劣化判定
   */
  private isMetricRegression(metric: string, change: number): boolean {
    const threshold = this.regressionThresholds[metric as keyof typeof this.regressionThresholds]
    return threshold && change >= threshold.medium
  }

  /**
   * 個別メトリクスの重要度判定
   */
  private getMetricSeverity(metric: string, change: number): 'low' | 'medium' | 'high' | 'critical' {
    const baseMetric = metric.replace(/^(cwv_|metric_|_score)/, '').replace(/_score$/, '')
    const threshold = this.regressionThresholds[baseMetric as keyof typeof this.regressionThresholds]
    
    if (!threshold) return 'low'

    const absChange = Math.abs(change)
    if (absChange >= Math.abs(threshold.critical)) return 'critical'
    if (absChange >= Math.abs(threshold.high)) return 'high'
    if (absChange >= Math.abs(threshold.medium)) return 'medium'
    return 'low'
  }

  /**
   * 全体的な重要度の判定
   */
  private determineSeverity(regressions: Array<any>): 'low' | 'medium' | 'high' | 'critical' {
    if (regressions.length === 0) return 'low'

    const severities = regressions.map(r => this.getMetricSeverity(r.metric, r.change))
    
    if (severities.includes('critical')) return 'critical'
    if (severities.filter(s => s === 'high').length >= 2) return 'critical'
    if (severities.includes('high')) return 'high'
    if (severities.filter(s => s === 'medium').length >= 3) return 'high'
    if (severities.includes('medium')) return 'medium'
    return 'low'
  }

  /**
   * ベースラインデータの保存
   */
  async saveBaseline(baseline: PerformanceBaseline): Promise<void> {
    try {
      // 実際の実装では、ファイルシステムやデータベースに保存
      const fs = await import('fs')
      const path = await import('path')
      
      const baselinesDir = path.join(process.cwd(), 'performance-baselines')
      if (!fs.existsSync(baselinesDir)) {
        fs.mkdirSync(baselinesDir, { recursive: true })
      }

      const filename = `baseline-${baseline.url.replace(/\//g, '_')}-${Date.now()}.json`
      const filepath = path.join(baselinesDir, filename)
      
      fs.writeFileSync(filepath, JSON.stringify(baseline, null, 2))
      
      console.log(`Baseline saved: ${filepath}`)
    } catch (error) {
      console.error('Failed to save baseline:', error)
    }
  }

  /**
   * 劣化検出結果のレポート生成
   */
  generateRegressionReport(result: RegressionResult, url: string): string {
    if (!result.hasRegression) {
      return `✅ No performance regression detected for ${url}`
    }

    let report = `🚨 Performance Regression Detected for ${url}\n\n`
    report += `Severity: ${result.severity.toUpperCase()}\n`
    report += `Total Regressions: ${result.summary.totalRegressions}\n`
    report += `Critical Issues: ${result.summary.criticalRegressions}\n`
    report += `High Priority Issues: ${result.summary.highRegressions}\n\n`

    report += `Detailed Regressions:\n`
    result.regressions.forEach((regression, index) => {
      const severity = this.getMetricSeverity(regression.metric, regression.change)
      const icon = severity === 'critical' ? '🔴' : severity === 'high' ? '🟠' : '🟡'
      
      report += `${index + 1}. ${icon} ${regression.metric}\n`
      report += `   Current: ${regression.current}\n`
      report += `   Baseline: ${regression.baseline}\n`
      report += `   Change: ${regression.change > 0 ? '+' : ''}${regression.change} (${regression.changePercent.toFixed(1)}%)\n`
      report += `   Severity: ${severity}\n\n`
    })

    return report
  }
}

// シングルトンインスタンス
export const regressionDetector = new RegressionDetector()
