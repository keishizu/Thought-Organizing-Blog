/**
 * パフォーマンス監視システム
 * リアルタイムでのパフォーマンス測定と劣化検出
 */

export interface PerformanceMetrics {
  // Core Web Vitals
  lcp: number // Largest Contentful Paint
  fid: number // First Input Delay
  cls: number // Cumulative Layout Shift
  fcp: number // First Contentful Paint
  ttfb: number // Time to First Byte
  
  // カスタムメトリクス
  pageLoadTime: number
  domContentLoaded: number
  resourceLoadTime: number
  memoryUsage: number
  
  // メタデータ
  url: string
  userAgent: string
  timestamp: number
  sessionId: string
}

export interface PerformanceThresholds {
  lcp: { good: number; needsImprovement: number }
  fid: { good: number; needsImprovement: number }
  cls: { good: number; needsImprovement: number }
  fcp: { good: number; needsImprovement: number }
  ttfb: { good: number; needsImprovement: number }
  pageLoadTime: { good: number; needsImprovement: number }
  memoryUsage: { good: number; needsImprovement: number }
}

export class PerformanceMonitor {
  private static instance: PerformanceMonitor
  private metrics: PerformanceMetrics[] = []
  private observers: PerformanceObserver[] = []
  private sessionId: string
  private isMonitoring: boolean = false

  // パフォーマンス閾値（Google推奨値ベース）
  private thresholds: PerformanceThresholds = {
    lcp: { good: 2500, needsImprovement: 4000 },
    fid: { good: 100, needsImprovement: 300 },
    cls: { good: 0.1, needsImprovement: 0.25 },
    fcp: { good: 1800, needsImprovement: 3000 },
    ttfb: { good: 800, needsImprovement: 1800 },
    pageLoadTime: { good: 3000, needsImprovement: 5000 },
    memoryUsage: { good: 50 * 1024 * 1024, needsImprovement: 100 * 1024 * 1024 }, // 50MB/100MB
  }

  private constructor() {
    this.sessionId = this.generateSessionId()
  }

  public static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor()
    }
    return PerformanceMonitor.instance
  }

  /**
   * パフォーマンス監視を開始
   */
  public startMonitoring(): void {
    if (typeof window === 'undefined' || this.isMonitoring) return

    this.isMonitoring = true
    this.setupPerformanceObservers()
    this.measureInitialMetrics()

    // ページアンロード時にメトリクスを送信
    window.addEventListener('beforeunload', () => {
      this.sendMetrics()
    })

    // 定期的にメトリクスを収集
    setInterval(() => {
      this.collectCurrentMetrics()
    }, 30000) // 30秒間隔
  }

  /**
   * パフォーマンス監視を停止
   */
  public stopMonitoring(): void {
    this.isMonitoring = false
    this.observers.forEach(observer => observer.disconnect())
    this.observers = []
  }

  /**
   * Performance Observerのセットアップ
   */
  private setupPerformanceObservers(): void {
    if (!('PerformanceObserver' in window)) return

    // LCP (Largest Contentful Paint)
    try {
      const lcpObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries()
        const lastEntry = entries[entries.length - 1] as PerformanceEntry & { startTime: number }
        this.updateMetric('lcp', lastEntry.startTime)
      })
      lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true })
      this.observers.push(lcpObserver)
    } catch (e) {
      console.warn('LCP observer not supported:', e)
    }

    // FID (First Input Delay)
    try {
      const fidObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries()
        entries.forEach((entry: any) => {
          this.updateMetric('fid', entry.processingStart - entry.startTime)
        })
      })
      fidObserver.observe({ type: 'first-input', buffered: true })
      this.observers.push(fidObserver)
    } catch (e) {
      console.warn('FID observer not supported:', e)
    }

    // CLS (Cumulative Layout Shift)
    try {
      let clsValue = 0
      const clsObserver = new PerformanceObserver((entryList) => {
        entryList.getEntries().forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value
            this.updateMetric('cls', clsValue)
          }
        })
      })
      clsObserver.observe({ type: 'layout-shift', buffered: true })
      this.observers.push(clsObserver)
    } catch (e) {
      console.warn('CLS observer not supported:', e)
    }

    // FCP (First Contentful Paint)
    try {
      const fcpObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries()
        entries.forEach((entry) => {
          if (entry.name === 'first-contentful-paint') {
            this.updateMetric('fcp', entry.startTime)
          }
        })
      })
      fcpObserver.observe({ type: 'paint', buffered: true })
      this.observers.push(fcpObserver)
    } catch (e) {
      console.warn('FCP observer not supported:', e)
    }
  }

  /**
   * 初期メトリクスの測定
   */
  private measureInitialMetrics(): void {
    if (typeof window === 'undefined') return

    // Navigation Timing API
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
    if (navigation) {
      const ttfb = navigation.responseStart - navigation.requestStart
      const domContentLoaded = navigation.domContentLoadedEventEnd - navigation.startTime
      const pageLoadTime = navigation.loadEventEnd - navigation.startTime

      this.updateMetric('ttfb', ttfb)
      this.updateMetric('domContentLoaded', domContentLoaded)
      this.updateMetric('pageLoadTime', pageLoadTime)
    }

    // メモリ使用量
    if ('memory' in performance) {
      const memoryInfo = (performance as any).memory
      this.updateMetric('memoryUsage', memoryInfo.usedJSHeapSize)
    }
  }

  /**
   * 現在のメトリクスを収集
   */
  private collectCurrentMetrics(): void {
    const currentMetrics: Partial<PerformanceMetrics> = {
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: Date.now(),
      sessionId: this.sessionId,
      lcp: 0,
      fid: 0,
      cls: 0,
      fcp: 0,
      ttfb: 0,
      pageLoadTime: 0,
      domContentLoaded: 0,
      resourceLoadTime: 0,
      memoryUsage: 0,
    }

    // 最新のメトリクス値を取得
    if (this.metrics.length > 0) {
      const latestMetrics = this.metrics[this.metrics.length - 1]
      Object.assign(currentMetrics, latestMetrics)
    }

    // リソース読み込み時間の計算
    const resources = performance.getEntriesByType('resource')
    const resourceLoadTime = resources.reduce((total, resource) => {
      return total + ((resource as PerformanceResourceTiming).responseEnd - resource.startTime)
    }, 0)
    currentMetrics.resourceLoadTime = resourceLoadTime

    // メモリ使用量の更新
    if ('memory' in performance) {
      const memoryInfo = (performance as any).memory
      currentMetrics.memoryUsage = memoryInfo.usedJSHeapSize
    }

    this.metrics.push(currentMetrics as PerformanceMetrics)

    // パフォーマンス劣化の検出
    this.detectPerformanceRegression(currentMetrics as PerformanceMetrics)
  }

  /**
   * メトリクス値の更新
   */
  private updateMetric(key: keyof PerformanceMetrics, value: number): void {
    if (this.metrics.length === 0) {
      this.metrics.push({
        lcp: 0,
        fid: 0,
        cls: 0,
        fcp: 0,
        ttfb: 0,
        pageLoadTime: 0,
        domContentLoaded: 0,
        resourceLoadTime: 0,
        memoryUsage: 0,
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: Date.now(),
        sessionId: this.sessionId,
      })
    }

    const latestMetrics = this.metrics[this.metrics.length - 1]
    ;(latestMetrics as any)[key] = value
  }

  /**
   * パフォーマンス劣化の検出
   */
  private detectPerformanceRegression(metrics: PerformanceMetrics): void {
    const regressions: string[] = []

    // 各メトリクスを閾値と比較
    Object.entries(this.thresholds).forEach(([key, threshold]) => {
      const value = (metrics as any)[key]
      if (value > threshold.needsImprovement) {
        regressions.push(`${key}: ${value} (threshold: ${threshold.needsImprovement})`)
      }
    })

    if (regressions.length > 0) {
      console.warn('Performance regression detected:', regressions)
      this.sendRegressionAlert(metrics, regressions)
    }
  }

  /**
   * パフォーマンス劣化アラートの送信
   */
  private async sendRegressionAlert(metrics: PerformanceMetrics, regressions: string[]): Promise<void> {
    try {
      await fetch('/api/performance-alert', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          metrics,
          regressions,
          timestamp: Date.now(),
        }),
      })
    } catch (error) {
      console.error('Failed to send performance alert:', error)
    }
  }

  /**
   * メトリクスの送信
   */
  private async sendMetrics(): Promise<void> {
    if (this.metrics.length === 0) return

    try {
      await fetch('/api/performance-metrics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          metrics: this.metrics,
          sessionId: this.sessionId,
        }),
      })
      
      this.metrics = [] // 送信後にクリア
    } catch (error) {
      console.error('Failed to send performance metrics:', error)
    }
  }

  /**
   * セッションIDの生成
   */
  private generateSessionId(): string {
    return `perf-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * 現在のメトリクスを取得
   */
  public getCurrentMetrics(): PerformanceMetrics | null {
    return this.metrics.length > 0 ? this.metrics[this.metrics.length - 1] : null
  }

  /**
   * パフォーマンススコアの計算
   */
  public calculatePerformanceScore(metrics: PerformanceMetrics): number {
    const scores = {
      lcp: this.calculateMetricScore(metrics.lcp, this.thresholds.lcp),
      fid: this.calculateMetricScore(metrics.fid, this.thresholds.fid),
      cls: this.calculateMetricScore(metrics.cls, this.thresholds.cls),
      fcp: this.calculateMetricScore(metrics.fcp, this.thresholds.fcp),
      ttfb: this.calculateMetricScore(metrics.ttfb, this.thresholds.ttfb),
    }

    // 重み付き平均スコア
    const weights = { lcp: 0.25, fid: 0.25, cls: 0.25, fcp: 0.15, ttfb: 0.1 }
    const totalScore = Object.entries(scores).reduce((total, [key, score]) => {
      return total + score * (weights as any)[key]
    }, 0)

    return Math.round(totalScore)
  }

  /**
   * 個別メトリクススコアの計算
   */
  private calculateMetricScore(value: number, threshold: { good: number; needsImprovement: number }): number {
    if (value <= threshold.good) return 100
    if (value <= threshold.needsImprovement) {
      return Math.round(100 - ((value - threshold.good) / (threshold.needsImprovement - threshold.good)) * 50)
    }
    return Math.max(0, Math.round(50 - ((value - threshold.needsImprovement) / threshold.needsImprovement) * 50))
  }
}

// グローバルインスタンスの作成
export const performanceMonitor = PerformanceMonitor.getInstance()
