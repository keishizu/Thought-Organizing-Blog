'use client';

import { useState } from 'react';
import { useNonce, createNonceStyle } from '@/components/common/NonceProvider';
import { Progress } from '@/components/ui/progress';
import { ChartContainer, ChartStyle } from '@/components/ui/chart';
import { LazyImage } from '@/components/common/PerformanceOptimizer';

export default function CSPTestPage() {
  // 本番環境では404を表示
  if (process.env.NODE_ENV === 'production') {
    return (
      <div className="container mx-auto p-8 text-center">
        <h1 className="text-3xl font-bold mb-4">404 - Page Not Found</h1>
        <p className="text-gray-600">このページは開発環境でのみ利用可能です。</p>
      </div>
    );
  }
  const [logs, setLogs] = useState<string[]>([]);
  const nonce = useNonce();

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testInlineScript = () => {
    addLog('インラインスクリプトのテストを実行中...');
    // これはCSP違反を引き起こすはず
    eval('console.log("This should trigger a CSP violation")');
  };

  const testExternalScript = () => {
    addLog('外部スクリプトのテストを実行中...');
    // これはCSP違反を引き起こすはず
    const script = document.createElement('script');
    script.src = 'https://example.com/malicious-script.js';
    document.head.appendChild(script);
  };

  const testInlineStyle = () => {
    addLog('インラインスタイルのテストを実行中...');
    // これはCSP違反を引き起こすはず
    const element = document.createElement('div');
    element.style.color = 'red';
    element.textContent = 'This should trigger a CSP violation for inline styles';
    document.body.appendChild(element);
  };

  const testExternalResource = () => {
    addLog('外部リソースのテストを実行中...');
    // これはCSP違反を引き起こすはず
    const img = document.createElement('img');
    img.src = 'https://example.com/malicious-image.jpg';
    document.body.appendChild(img);
  };

  const testNonceStyle = () => {
    addLog('nonce付きスタイルのテストを実行中...');
    if (nonce) {
      addLog(`nonce値: ${nonce}`);
      // nonce付きのstyleタグを作成
      const styleElement = createNonceStyle(`
        .nonce-test {
          color: blue;
          background-color: yellow;
          padding: 10px;
          border: 2px solid red;
        }
      `, nonce);
      
      // テスト用のdiv要素を作成
      const testDiv = document.createElement('div');
      testDiv.className = 'nonce-test';
      testDiv.textContent = 'nonce付きスタイルが適用されました';
      document.body.appendChild(testDiv);
      
      addLog('nonce付きスタイルが正常に適用されました');
    } else {
      addLog('nonceが利用できません');
    }
  };

  const testDynamicStyleComponents = () => {
    addLog('動的style排除コンポーネントのテストを実行中...');
    addLog('Progress、Chart、LazyImageコンポーネントが正常に動作することを確認します');
  };

  const clearLogs = () => {
    setLogs([]);
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">CSP レポートテストページ</h1>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">CSP違反テスト</h2>
        <p className="mb-4 text-gray-600">
          以下のボタンをクリックしてCSP違反を発生させ、レポートが正しく送信されるかテストしてください。
        </p>
        
        <div className="grid grid-cols-2 gap-4 mb-6">
          <button
            onClick={testInlineScript}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
          >
            インラインスクリプトテスト
          </button>
          
          <button
            onClick={testExternalScript}
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded"
          >
            外部スクリプトテスト
          </button>
          
          <button
            onClick={testInlineStyle}
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded"
          >
            インラインスタイルテスト
          </button>
          
          <button
            onClick={testExternalResource}
            className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded"
          >
            外部リソーステスト
          </button>
          
          <button
            onClick={testNonceStyle}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
          >
            nonce付きスタイルテスト
          </button>
          
          <button
            onClick={testDynamicStyleComponents}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          >
            動的style排除テスト
          </button>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">現在のCSP設定</h2>
        <div className="bg-gray-100 p-4 rounded">
          <pre className="text-sm overflow-x-auto">
            {`Content-Security-Policy-Report-Only: default-src 'self'; script-src 'self' 'nonce-<dynamic>' https://www.googletagmanager.com; style-src 'self' https://fonts.googleapis.com 'nonce-<dynamic>'; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: https: blob:; connect-src 'self' https://qprlaprnzqewcgpcvzme.supabase.co wss://qprlaprnzqewcgpcvzme.supabase.co https://www.googletagmanager.com; frame-src 'self' https://www.googletagmanager.com; frame-ancestors 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; worker-src 'self' blob:; manifest-src 'self'; report-uri /api/csp-report`}
          </pre>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">nonce情報</h2>
        <div className="bg-blue-50 p-4 rounded">
          <p className="mb-2">
            <strong>現在のnonce:</strong> {nonce ? nonce : 'nonceが利用できません'}
          </p>
          <p className="text-sm text-gray-600">
            nonceはリクエスト毎に動的に生成され、CSPポリシーで許可されたスクリプトとスタイルに使用されます。
          </p>
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">テストログ</h2>
          <button
            onClick={clearLogs}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded text-sm"
          >
            ログをクリア
          </button>
        </div>
        
        <div className="bg-black text-green-400 p-4 rounded h-64 overflow-y-auto">
          {logs.length === 0 ? (
            <p className="text-gray-500">ログがありません。上記のボタンをクリックしてテストを開始してください。</p>
          ) : (
            logs.map((log, index) => (
              <div key={index} className="mb-1">
                {log}
              </div>
            ))
          )}
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">動的style排除コンポーネントテスト</h2>
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-2">Progress コンポーネント</h3>
            <div className="space-y-2">
              <Progress value={25} className="w-full" />
              <Progress value={50} className="w-full" />
              <Progress value={75} className="w-full" />
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-2">Chart コンポーネント</h3>
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
              className="w-full h-64"
            >
              <div className="p-4 text-center text-gray-500">
                Chart component with nonce-based styling
              </div>
            </ChartContainer>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-2">LazyImage コンポーネント</h3>
            <LazyImage
              src="/placeholder-image.jpg"
              alt="Test lazy image"
              width={300}
              height={200}
              className="rounded border"
            />
          </div>
        </div>
      </div>

      <div className="mt-8 p-4 bg-blue-50 rounded">
        <h3 className="font-semibold mb-2">確認方法</h3>
        <ol className="list-decimal list-inside space-y-1 text-sm">
          <li>上記のボタンをクリックしてCSP違反を発生させてください</li>
          <li>ブラウザの開発者ツールのコンソールでCSPレポートの送信を確認してください</li>
          <li>サーバーのコンソールでCSPレポートの受信を確認してください</li>
          <li>プロジェクトルートの <code>csp-reports/</code> フォルダにレポートファイルが保存されることを確認してください</li>
          <li>動的style排除コンポーネントが正常に動作し、CSP違反が発生しないことを確認してください</li>
        </ol>
      </div>
    </div>
  );
}
