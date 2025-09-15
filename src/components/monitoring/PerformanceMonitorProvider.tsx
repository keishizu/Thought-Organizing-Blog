'use client'

import { createContext, useContext, useEffect, useRef } from 'react'
import { performanceMonitor, PerformanceMetrics } from '@/lib/monitoring/performance-monitor'

interface PerformanceMonitorContextType {
  getCurrentMetrics: () => PerformanceMetrics | null
  getPerformanceScore: () => number
}

const PerformanceMonitorContext = createContext<PerformanceMonitorContextType | null>(null)

interface PerformanceMonitorProviderProps {
  children: React.ReactNode
  enableInProduction?: boolean
  enableInDevelopment?: boolean
}

export function PerformanceMonitorProvider({ 
  children, 
  enableInProduction = true,
  enableInDevelopment = true 
}: PerformanceMonitorProviderProps) {
  const isInitialized = useRef(false)

  useEffect(() => {
    if (typeof window === 'undefined' || isInitialized.current) return

    // 環境に応じた監視の有効化
    const shouldEnable = (
      (process.env.NODE_ENV === 'production' && enableInProduction) ||
      (process.env.NODE_ENV === 'development' && enableInDevelopment)
    )

    if (!shouldEnable) return

    // パフォーマンス監視を開始
    performanceMonitor.startMonitoring()
    isInitialized.current = true

    // デバッグ情報の出力（開発環境のみ）
    if (process.env.NODE_ENV === 'development') {
      console.log('🚀 Performance Monitor initialized')
      
      // 5秒後に初期メトリクスを表示
      setTimeout(() => {
        const metrics = performanceMonitor.getCurrentMetrics()
        if (metrics) {
          const score = performanceMonitor.calculatePerformanceScore(metrics)
          console.log('📊 Initial Performance Metrics:', {
            score: `${score}/100`,
            lcp: `${metrics.lcp}ms`,
            fid: `${metrics.fid}ms`,
            cls: metrics.cls,
            fcp: `${metrics.fcp}ms`,
            ttfb: `${metrics.ttfb}ms`,
            memoryUsage: `${Math.round(metrics.memoryUsage / 1024 / 1024)}MB`,
          })
        }
      }, 5000)
    }

    // クリーンアップ
    return () => {
      performanceMonitor.stopMonitoring()
      isInitialized.current = false
    }
  }, [enableInProduction, enableInDevelopment])

  const contextValue: PerformanceMonitorContextType = {
    getCurrentMetrics: () => performanceMonitor.getCurrentMetrics(),
    getPerformanceScore: () => {
      const metrics = performanceMonitor.getCurrentMetrics()
      return metrics ? performanceMonitor.calculatePerformanceScore(metrics) : 0
    }
  }

  return (
    <PerformanceMonitorContext.Provider value={contextValue}>
      {children}
    </PerformanceMonitorContext.Provider>
  )
}

export function usePerformanceMonitor() {
  const context = useContext(PerformanceMonitorContext)
  if (!context) {
    throw new Error('usePerformanceMonitor must be used within a PerformanceMonitorProvider')
  }
  return context
}

// パフォーマンス情報を表示するデバッグコンポーネント（開発環境のみ）
export function PerformanceDebugInfo() {
  const { getCurrentMetrics, getPerformanceScore } = usePerformanceMonitor()

  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return

    const interval = setInterval(() => {
      const metrics = getCurrentMetrics()
      const score = getPerformanceScore()
      
      if (metrics && score > 0) {
        // パフォーマンス情報をコンソールに表示
        console.group('🔍 Performance Debug Info')
        console.log('Overall Score:', `${score}/100`)
        console.log('Core Web Vitals:', {
          LCP: `${metrics.lcp}ms (${metrics.lcp <= 2500 ? '✅' : metrics.lcp <= 4000 ? '⚠️' : '❌'})`,
          FID: `${metrics.fid}ms (${metrics.fid <= 100 ? '✅' : metrics.fid <= 300 ? '⚠️' : '❌'})`,
          CLS: `${metrics.cls} (${metrics.cls <= 0.1 ? '✅' : metrics.cls <= 0.25 ? '⚠️' : '❌'})`,
        })
        console.log('Additional Metrics:', {
          FCP: `${metrics.fcp}ms`,
          TTFB: `${metrics.ttfb}ms`,
          'Page Load': `${metrics.pageLoadTime}ms`,
          'Memory Usage': `${Math.round(metrics.memoryUsage / 1024 / 1024)}MB`,
        })
        console.groupEnd()
      }
    }, 30000) // 30秒間隔

    return () => clearInterval(interval)
  }, [getCurrentMetrics, getPerformanceScore])

  // 開発環境以外では何も表示しない
  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  return null // UIは表示せず、コンソールログのみ
}
