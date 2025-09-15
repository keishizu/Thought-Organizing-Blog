import { Metadata } from 'next'
import { PerformanceDashboard } from '@/components/monitoring/PerformanceDashboard'

export const metadata: Metadata = {
  title: 'パフォーマンス監視ダッシュボード',
  description: 'サイトのパフォーマンス状況とLighthouseレポートを確認',
  robots: 'noindex, nofollow', // 検索エンジンにインデックスされないように
}

export default function PerformanceDashboardPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">パフォーマンス監視ダッシュボード</h1>
        <p className="text-muted-foreground">
          サイトのパフォーマンス状況、Lighthouseレポート、CSP違反状況を監視します
        </p>
      </div>
      
      <PerformanceDashboard />
    </div>
  )
}
