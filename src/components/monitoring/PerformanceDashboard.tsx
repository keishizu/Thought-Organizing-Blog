'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { AlertTriangle, CheckCircle, Clock, Activity, Zap, Eye } from 'lucide-react'

interface PerformanceMetrics {
  lcp: number
  fid: number
  cls: number
  fcp: number
  ttfb: number
  pageLoadTime: number
  memoryUsage: number
  timestamp: string
  url: string
}

interface LighthouseReport {
  pageName: string
  url: string
  timestamp: string
  scores: {
    performance: number
    accessibility: number
    bestPractices: number
    seo: number
  }
  passed: {
    performance: boolean
    accessibility: boolean
    bestPractices: boolean
    seo: boolean
  }
  coreWebVitals: {
    lcp: number
    fid: number
    cls: number
    fcp: number
    ttfb: number
  }
}

interface PerformanceAlert {
  alertId: string
  timestamp: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  url: string
  regressions: string[]
  metrics: PerformanceMetrics
}

export function PerformanceDashboard() {
  const [currentMetrics, setCurrentMetrics] = useState<PerformanceMetrics | null>(null)
  const [lighthouseReports, setLighthouseReports] = useState<LighthouseReport[]>([])
  const [performanceAlerts, setPerformanceAlerts] = useState<PerformanceAlert[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  // パフォーマンスデータの読み込み
  useEffect(() => {
    loadPerformanceData()
    
    // 定期的にデータを更新
    const interval = setInterval(loadPerformanceData, 60000) // 1分間隔
    
    return () => clearInterval(interval)
  }, [])

  const loadPerformanceData = async () => {
    try {
      // 実際の実装では、APIエンドポイントからデータを取得
      // ここではダミーデータを使用
      
      // 現在のパフォーマンスメトリクス（クライアントサイドで取得）
      if (typeof window !== 'undefined') {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
        if (navigation) {
          setCurrentMetrics({
            lcp: 2200,
            fid: 80,
            cls: 0.08,
            fcp: 1600,
            ttfb: navigation.responseStart - navigation.requestStart,
            pageLoadTime: navigation.loadEventEnd - navigation.startTime,
            memoryUsage: (performance as any).memory?.usedJSHeapSize || 0,
            timestamp: new Date().toISOString(),
            url: window.location.href,
          })
        }
      }

      // Lighthouseレポートの読み込み（実際の実装ではファイルシステムやAPIから取得）
      setLighthouseReports([
        {
          pageName: 'home',
          url: '/',
          timestamp: new Date(Date.now() - 3600000).toISOString(), // 1時間前
          scores: {
            performance: 95,
            accessibility: 98,
            bestPractices: 92,
            seo: 96,
          },
          passed: {
            performance: true,
            accessibility: true,
            bestPractices: true,
            seo: true,
          },
          coreWebVitals: {
            lcp: 2200,
            fid: 80,
            cls: 0.08,
            fcp: 1600,
            ttfb: 450,
          }
        },
        {
          pageName: 'posts',
          url: '/posts',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          scores: {
            performance: 88,
            accessibility: 96,
            bestPractices: 89,
            seo: 94,
          },
          passed: {
            performance: false,
            accessibility: true,
            bestPractices: false,
            seo: true,
          },
          coreWebVitals: {
            lcp: 2800,
            fid: 120,
            cls: 0.12,
            fcp: 1900,
            ttfb: 600,
          }
        }
      ])

      // パフォーマンスアラートの読み込み
      setPerformanceAlerts([
        {
          alertId: 'alert-001',
          timestamp: new Date(Date.now() - 1800000).toISOString(), // 30分前
          severity: 'medium',
          url: '/posts',
          regressions: ['lcp: 2800 (threshold: 2500)', 'cls: 0.12 (threshold: 0.1)'],
          metrics: {
            lcp: 2800,
            fid: 120,
            cls: 0.12,
            fcp: 1900,
            ttfb: 600,
            pageLoadTime: 3200,
            memoryUsage: 45 * 1024 * 1024,
            timestamp: new Date(Date.now() - 1800000).toISOString(),
            url: '/posts',
          }
        }
      ])

      setLastUpdated(new Date())
    } catch (error) {
      console.error('Failed to load performance data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getScoreColor = (score: number): string => {
    if (score >= 90) return 'text-green-600'
    if (score >= 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 90) return 'default'
    if (score >= 70) return 'secondary'
    return 'destructive'
  }

  const getSeverityColor = (severity: string): string => {
    switch (severity) {
      case 'critical': return 'text-red-600'
      case 'high': return 'text-orange-600'
      case 'medium': return 'text-yellow-600'
      default: return 'text-blue-600'
    }
  }

  const formatMetricValue = (value: number, unit: string): string => {
    if (unit === 'ms') return `${Math.round(value)}ms`
    if (unit === 'MB') return `${Math.round(value / 1024 / 1024)}MB`
    return value.toFixed(3)
  }

  const getCoreWebVitalStatus = (metric: string, value: number): 'good' | 'needs-improvement' | 'poor' => {
    const thresholds = {
      lcp: { good: 2500, poor: 4000 },
      fid: { good: 100, poor: 300 },
      cls: { good: 0.1, poor: 0.25 },
      fcp: { good: 1800, poor: 3000 },
      ttfb: { good: 800, poor: 1800 },
    }

    const threshold = thresholds[metric as keyof typeof thresholds]
    if (!threshold) return 'good'

    if (value <= threshold.good) return 'good'
    if (value <= threshold.poor) return 'needs-improvement'
    return 'poor'
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Activity className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p>パフォーマンスデータを読み込み中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex justify-between items-center">
        <div>
          {lastUpdated && (
            <p className="text-sm text-muted-foreground">
              最終更新: {lastUpdated.toLocaleString('ja-JP')}
            </p>
          )}
        </div>
        <Button onClick={loadPerformanceData} variant="outline" size="sm">
          <Activity className="h-4 w-4 mr-2" />
          更新
        </Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">概要</TabsTrigger>
          <TabsTrigger value="lighthouse">Lighthouse</TabsTrigger>
          <TabsTrigger value="alerts">アラート</TabsTrigger>
          <TabsTrigger value="core-web-vitals">Core Web Vitals</TabsTrigger>
        </TabsList>

        {/* 概要タブ */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">全体スコア</CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">92/100</div>
                <p className="text-xs text-muted-foreground">
                  前回から +2ポイント
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">アクティブアラート</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{performanceAlerts.length}</div>
                <p className="text-xs text-muted-foreground">
                  要対応: {performanceAlerts.filter(a => a.severity === 'high' || a.severity === 'critical').length}件
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">監視ページ数</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{lighthouseReports.length}</div>
                <p className="text-xs text-muted-foreground">
                  合格: {lighthouseReports.filter(r => Object.values(r.passed).every(p => p)).length}ページ
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">平均応答時間</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {currentMetrics ? formatMetricValue(currentMetrics.ttfb, 'ms') : 'N/A'}
                </div>
                <p className="text-xs text-muted-foreground">
                  TTFB (Time to First Byte)
                </p>
              </CardContent>
            </Card>
          </div>

          {/* 最新のパフォーマンスメトリクス */}
          {currentMetrics && (
            <Card>
              <CardHeader>
                <CardTitle>現在のパフォーマンス</CardTitle>
                <CardDescription>
                  リアルタイムのパフォーマンス指標
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm font-medium">LCP</p>
                    <p className="text-2xl font-bold">{formatMetricValue(currentMetrics.lcp, 'ms')}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">FID</p>
                    <p className="text-2xl font-bold">{formatMetricValue(currentMetrics.fid, 'ms')}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">CLS</p>
                    <p className="text-2xl font-bold">{currentMetrics.cls.toFixed(3)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">メモリ使用量</p>
                    <p className="text-2xl font-bold">{formatMetricValue(currentMetrics.memoryUsage, 'MB')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Lighthouseタブ */}
        <TabsContent value="lighthouse" className="space-y-4">
          <div className="grid gap-4">
            {lighthouseReports.map((report, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{report.pageName} ({report.url})</span>
                    <Badge variant={Object.values(report.passed).every(p => p) ? 'default' : 'destructive'}>
                      {Object.values(report.passed).every(p => p) ? '合格' : '要改善'}
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    {new Date(report.timestamp).toLocaleString('ja-JP')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm font-medium">Performance</p>
                      <div className="flex items-center space-x-2">
                        <Progress value={report.scores.performance} className="flex-1" />
                        <Badge variant={getScoreBadgeVariant(report.scores.performance)}>
                          {report.scores.performance}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Accessibility</p>
                      <div className="flex items-center space-x-2">
                        <Progress value={report.scores.accessibility} className="flex-1" />
                        <Badge variant={getScoreBadgeVariant(report.scores.accessibility)}>
                          {report.scores.accessibility}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Best Practices</p>
                      <div className="flex items-center space-x-2">
                        <Progress value={report.scores.bestPractices} className="flex-1" />
                        <Badge variant={getScoreBadgeVariant(report.scores.bestPractices)}>
                          {report.scores.bestPractices}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium">SEO</p>
                      <div className="flex items-center space-x-2">
                        <Progress value={report.scores.seo} className="flex-1" />
                        <Badge variant={getScoreBadgeVariant(report.scores.seo)}>
                          {report.scores.seo}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* アラートタブ */}
        <TabsContent value="alerts" className="space-y-4">
          {performanceAlerts.length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center h-32">
                <div className="text-center">
                  <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <p>現在、アクティブなアラートはありません</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {performanceAlerts.map((alert, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>パフォーマンス劣化検出</span>
                      <Badge variant={alert.severity === 'critical' ? 'destructive' : 'secondary'}>
                        {alert.severity.toUpperCase()}
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      {alert.url} - {new Date(alert.timestamp).toLocaleString('ja-JP')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="font-medium">検出された問題:</p>
                      <ul className="list-disc list-inside space-y-1">
                        {alert.regressions.map((regression, i) => (
                          <li key={i} className="text-sm text-muted-foreground">
                            {regression}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Core Web Vitalsタブ */}
        <TabsContent value="core-web-vitals" className="space-y-4">
          {lighthouseReports.map((report, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle>{report.pageName} - Core Web Vitals</CardTitle>
                <CardDescription>{report.url}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  <div>
                    <p className="text-sm font-medium">LCP</p>
                    <p className={`text-2xl font-bold ${
                      getCoreWebVitalStatus('lcp', report.coreWebVitals.lcp) === 'good' ? 'text-green-600' :
                      getCoreWebVitalStatus('lcp', report.coreWebVitals.lcp) === 'needs-improvement' ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {formatMetricValue(report.coreWebVitals.lcp, 'ms')}
                    </p>
                    <p className="text-xs text-muted-foreground">目標: &lt;2.5s</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">FID</p>
                    <p className={`text-2xl font-bold ${
                      getCoreWebVitalStatus('fid', report.coreWebVitals.fid) === 'good' ? 'text-green-600' :
                      getCoreWebVitalStatus('fid', report.coreWebVitals.fid) === 'needs-improvement' ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {formatMetricValue(report.coreWebVitals.fid, 'ms')}
                    </p>
                    <p className="text-xs text-muted-foreground">目標: &lt;100ms</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">CLS</p>
                    <p className={`text-2xl font-bold ${
                      getCoreWebVitalStatus('cls', report.coreWebVitals.cls) === 'good' ? 'text-green-600' :
                      getCoreWebVitalStatus('cls', report.coreWebVitals.cls) === 'needs-improvement' ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {report.coreWebVitals.cls.toFixed(3)}
                    </p>
                    <p className="text-xs text-muted-foreground">目標: &lt;0.1</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">FCP</p>
                    <p className={`text-2xl font-bold ${
                      getCoreWebVitalStatus('fcp', report.coreWebVitals.fcp) === 'good' ? 'text-green-600' :
                      getCoreWebVitalStatus('fcp', report.coreWebVitals.fcp) === 'needs-improvement' ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {formatMetricValue(report.coreWebVitals.fcp, 'ms')}
                    </p>
                    <p className="text-xs text-muted-foreground">目標: &lt;1.8s</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">TTFB</p>
                    <p className={`text-2xl font-bold ${
                      getCoreWebVitalStatus('ttfb', report.coreWebVitals.ttfb) === 'good' ? 'text-green-600' :
                      getCoreWebVitalStatus('ttfb', report.coreWebVitals.ttfb) === 'needs-improvement' ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {formatMetricValue(report.coreWebVitals.ttfb, 'ms')}
                    </p>
                    <p className="text-xs text-muted-foreground">目標: &lt;800ms</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  )
}
