'use client';

import { useState } from 'react';
import { Progress } from '@/components/ui/progress';
import { ChartContainer } from '@/components/ui/chart';
import { LazyImage, VirtualizedList } from '@/components/common/PerformanceOptimizer';

export default function CSPComponentTestPage() {
  // 本番環境では404を表示
  if (process.env.NODE_ENV === 'production') {
    return (
      <div className="container mx-auto p-8 text-center">
        <h1 className="text-3xl font-bold mb-4">404 - Page Not Found</h1>
        <p className="text-gray-600">このページは開発環境でのみ利用可能です。</p>
      </div>
    );
  }

  const [progressValue, setProgressValue] = useState(50);
  const [testResults, setTestResults] = useState<string[]>([]);

  const addResult = (component: string, result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()} - ${component}: ${result}`]);
  };

  // テストデータ
  const virtualListItems = Array.from({ length: 100 }, (_, i) => `Item ${i + 1}`);

  const testProgress = () => {
    addResult('Progress', 'Progress コンポーネントをテスト中...');
    
    // プログレスバーの値を変更してCSP違反がないか確認
    const values = [10, 25, 50, 75, 90];
    let index = 0;
    
    const interval = setInterval(() => {
      if (index < values.length) {
        setProgressValue(values[index]);
        addResult('Progress', `値を ${values[index]}% に変更`);
        index++;
      } else {
        clearInterval(interval);
        addResult('Progress', 'テスト完了 - CSP違反を確認してください');
      }
    }, 500);
  };

  const testChart = () => {
    addResult('Chart', 'Chart コンポーネントをテスト中...');
    addResult('Chart', 'チャートの動的色設定をテスト');
    addResult('Chart', 'テスト完了 - CSP違反を確認してください');
  };

  const testLazyImage = () => {
    addResult('LazyImage', 'LazyImage コンポーネントをテスト中...');
    addResult('LazyImage', 'レイジーローディングと透明度アニメーションをテスト');
    addResult('LazyImage', 'テスト完了 - CSP違反を確認してください');
  };

  const testVirtualList = () => {
    addResult('VirtualList', 'VirtualizedList コンポーネントをテスト中...');
    addResult('VirtualList', '仮想リストのスクロールと動的スタイルをテスト');
    addResult('VirtualList', 'テスト完了 - CSP違反を確認してください');
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">CSP コンポーネント別テストページ</h1>
      
      <div className="mb-8 p-4 bg-blue-50 rounded">
        <h2 className="text-xl font-semibold mb-2">テスト手順</h2>
        <ol className="list-decimal list-inside space-y-1 text-sm">
          <li>ブラウザの開発者ツールのコンソールを開いてください</li>
          <li>各コンポーネントのテストボタンをクリックしてください</li>
          <li>コンソールにCSP違反のエラーが出ないことを確認してください</li>
          <li>「[Report Only] Refused to...」のようなメッセージがないか確認してください</li>
        </ol>
      </div>

      <div className="grid grid-cols-2 gap-8">
        {/* テストコントロール */}
        <div>
          <h2 className="text-xl font-semibold mb-4">コンポーネントテスト</h2>
          
          <div className="space-y-4">
            <button
              onClick={testProgress}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
            >
              Progress コンポーネントテスト
            </button>
            
            <button
              onClick={testChart}
              className="w-full bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
            >
              Chart コンポーネントテスト
            </button>
            
            <button
              onClick={testLazyImage}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded"
            >
              LazyImage コンポーネントテスト
            </button>
            
            <button
              onClick={testVirtualList}
              className="w-full bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded"
            >
              VirtualList コンポーネントテスト
            </button>
            
            <button
              onClick={clearResults}
              className="w-full bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
            >
              結果をクリア
            </button>
          </div>

          {/* テスト結果 */}
          <div className="mt-6">
            <h3 className="text-lg font-medium mb-2">テスト結果</h3>
            <div className="bg-black text-green-400 p-4 rounded h-64 overflow-y-auto">
              {testResults.length === 0 ? (
                <p className="text-gray-500">テスト結果がありません</p>
              ) : (
                testResults.map((result, index) => (
                  <div key={index} className="mb-1 text-sm">
                    {result}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* コンポーネント表示 */}
        <div>
          <h2 className="text-xl font-semibold mb-4">コンポーネント表示</h2>
          
          <div className="space-y-8">
            {/* Progress Component */}
            <div>
              <h3 className="text-lg font-medium mb-2">Progress ({progressValue}%)</h3>
              <Progress value={progressValue} className="w-full" />
            </div>

            {/* Chart Component */}
            <div>
              <h3 className="text-lg font-medium mb-2">Chart</h3>
              <ChartContainer
                config={{
                  sales: {
                    label: "Sales",
                    color: "hsl(var(--chart-1))",
                  },
                  customers: {
                    label: "Customers", 
                    color: "hsl(var(--chart-2))",
                  },
                }}
                className="w-full h-48 border rounded"
              >
                <div className="p-4 text-center text-gray-500">
                  Chart component with nonce-based styling
                </div>
              </ChartContainer>
            </div>

            {/* LazyImage Component */}
            <div>
              <h3 className="text-lg font-medium mb-2">LazyImage</h3>
              <LazyImage
                src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+CiAgPHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkxhenlJbWFnZSBUZXN0PC90ZXh0Pgo8L3N2Zz4K"
                alt="Test lazy image"
                width={300}
                height={200}
                className="rounded border"
              />
            </div>

            {/* VirtualizedList Component */}
            <div>
              <h3 className="text-lg font-medium mb-2">VirtualizedList</h3>
              <div className="border rounded">
                <VirtualizedList
                  items={virtualListItems}
                  renderItem={(item, index) => (
                    <div className="p-2 border-b">
                      {item} (Index: {index})
                    </div>
                  )}
                  itemHeight={40}
                  containerHeight={200}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 p-4 bg-yellow-50 rounded">
        <h3 className="font-semibold mb-2">CSP違反の確認方法</h3>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li><strong>コンソール確認</strong>: 開発者ツールのコンソールでCSP違反エラーがないか確認</li>
          <li><strong>ネットワーク確認</strong>: CSPレポートが送信されていないか確認</li>
          <li><strong>動作確認</strong>: 各コンポーネントが正常に動作することを確認</li>
          <li><strong>スタイル確認</strong>: 動的スタイルが正しく適用されることを確認</li>
        </ul>
      </div>
    </div>
  );
}
