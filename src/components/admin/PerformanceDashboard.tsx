"use client";

import { usePerformance } from '@/hooks/usePerformance';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, CheckCircle, Clock, Zap, HardDrive, Package } from 'lucide-react';

export function PerformanceDashboard() {
  const { metrics, bundleInfo, memoryInfo, isLoading } = usePerformance();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        <span className="ml-2">パフォーマンス測定中...</span>
      </div>
    );
  }

  const getScoreColor = (score: number, threshold: number) => {
    if (score <= threshold) return 'bg-green-100 text-green-800';
    if (score <= threshold * 1.5) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getScoreBadge = (score: number, threshold: number, label: string) => {
    const color = getScoreColor(score, threshold);
    const isGood = score <= threshold;
    
    return (
      <Badge className={color}>
        {isGood ? <CheckCircle className="w-3 h-3 mr-1" /> : <AlertTriangle className="w-3 h-3 mr-1" />}
        {label}: {score.toFixed(2)}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Zap className="w-6 h-6 text-blue-600" />
        <h2 className="text-2xl font-bold">パフォーマンス監視ダッシュボード</h2>
      </div>

      {/* Core Web Vitals */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="w-5 h-5" />
            <span>Core Web Vitals</span>
          </CardTitle>
          <CardDescription>
            ページのパフォーマンス指標を監視します
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {metrics && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">FCP</span>
                  {getScoreBadge(metrics.fcp, 1800, 'FCP')}
                </div>
                <Progress value={Math.min((metrics.fcp / 1800) * 100, 100)} className="h-2" />
                <p className="text-xs text-gray-500">First Contentful Paint</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">LCP</span>
                  {getScoreBadge(metrics.lcp, 2500, 'LCP')}
                </div>
                <Progress value={Math.min((metrics.lcp / 2500) * 100, 100)} className="h-2" />
                <p className="text-xs text-gray-500">Largest Contentful Paint</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">FID</span>
                  {getScoreBadge(metrics.fid, 100, 'FID')}
                </div>
                <Progress value={Math.min((metrics.fid / 100) * 100, 100)} className="h-2" />
                <p className="text-xs text-gray-500">First Input Delay</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">CLS</span>
                  {getScoreBadge(metrics.cls, 0.1, 'CLS')}
                </div>
                <Progress value={Math.min((metrics.cls / 0.1) * 100, 100)} className="h-2" />
                <p className="text-xs text-gray-500">Cumulative Layout Shift</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">TTFB</span>
                  {getScoreBadge(metrics.ttfb, 600, 'TTFB')}
                </div>
                <Progress value={Math.min((metrics.ttfb / 600) * 100, 100)} className="h-2" />
                <p className="text-xs text-gray-500">Time to First Byte</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* バンドル情報 */}
      {bundleInfo && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Package className="w-5 h-5" />
              <span>バンドル情報</span>
            </CardTitle>
            <CardDescription>
              JavaScriptバンドルのサイズとリソース情報
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {(bundleInfo.totalSize / 1024).toFixed(1)}
                </div>
                <div className="text-sm text-gray-500">KB</div>
                <div className="text-xs text-gray-400">合計サイズ</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {bundleInfo.jsResources}
                </div>
                <div className="text-sm text-gray-500">ファイル</div>
                <div className="text-xs text-gray-400">JSリソース数</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {(bundleInfo.averageSize / 1024).toFixed(1)}
                </div>
                <div className="text-sm text-gray-500">KB</div>
                <div className="text-xs text-gray-400">平均サイズ</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* メモリ使用量 */}
      {memoryInfo && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <HardDrive className="w-5 h-5" />
              <span>メモリ使用量</span>
            </CardTitle>
            <CardDescription>
              ブラウザのメモリ使用状況
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">使用率</span>
                  <span className="text-sm font-bold">
                    {memoryInfo.usagePercentage.toFixed(1)}%
                  </span>
                </div>
                <Progress value={memoryInfo.usagePercentage} className="h-2" />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-lg font-bold text-blue-600">
                    {(memoryInfo.usedJSHeapSize / 1024 / 1024).toFixed(1)}
                  </div>
                  <div className="text-sm text-gray-500">MB</div>
                  <div className="text-xs text-gray-400">使用中</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-green-600">
                    {(memoryInfo.totalJSHeapSize / 1024 / 1024).toFixed(1)}
                  </div>
                  <div className="text-sm text-gray-500">MB</div>
                  <div className="text-xs text-gray-400">割り当て済み</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-purple-600">
                    {(memoryInfo.jsHeapSizeLimit / 1024 / 1024).toFixed(1)}
                  </div>
                  <div className="text-sm text-gray-500">MB</div>
                  <div className="text-xs text-gray-400">制限</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* パフォーマンス警告 */}
      {metrics && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
              <span>パフォーマンス警告</span>
            </CardTitle>
            <CardDescription>
              改善が必要な項目
            </CardDescription>
          </CardHeader>
          <CardContent>
            {(() => {
              const warnings = [];
              if (metrics.fcp > 1800) warnings.push('FCPが1800msを超えています');
              if (metrics.lcp > 2500) warnings.push('LCPが2500msを超えています');
              if (metrics.fid > 100) warnings.push('FIDが100msを超えています');
              if (metrics.cls > 0.1) warnings.push('CLSが0.1を超えています');
              if (metrics.ttfb > 600) warnings.push('TTFBが600msを超えています');

              if (warnings.length === 0) {
                return (
                  <Alert>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription>
                      すべてのパフォーマンス指標が良好です！
                    </AlertDescription>
                  </Alert>
                );
              }

              return (
                <div className="space-y-2">
                  {warnings.map((warning, index) => (
                    <Alert key={index}>
                      <AlertTriangle className="h-4 w-4 text-yellow-600" />
                      <AlertDescription>{warning}</AlertDescription>
                    </Alert>
                  ))}
                </div>
              );
            })()}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
