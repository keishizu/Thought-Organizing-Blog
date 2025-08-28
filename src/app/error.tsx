'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // エラーログの記録（本番環境では適切なログサービスに送信）
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted">
      <div className="text-center space-y-8 p-8 max-w-2xl">
        {/* エラーアイコン */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="w-24 h-24 bg-destructive/10 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-12 h-12 text-destructive" />
            </div>
          </div>
        </div>

        {/* エラーメッセージ */}
        <div className="space-y-4">
          <h1 className="text-3xl font-bold text-foreground">
            予期しないエラーが発生しました
          </h1>
          <p className="text-muted-foreground">
            申し訳ございません。一時的な問題が発生しています。
            しばらく時間をおいてから再度お試しください。
          </p>
          
          {/* 開発環境でのみエラー詳細を表示 */}
          {process.env.NODE_ENV === 'development' && (
            <details className="text-left bg-muted p-4 rounded-lg">
              <summary className="cursor-pointer font-medium text-sm">
                エラー詳細（開発環境のみ）
              </summary>
              <div className="mt-2 text-xs font-mono text-muted-foreground break-all">
                <p><strong>メッセージ:</strong> {error.message}</p>
                {error.digest && (
                  <p><strong>エラーID:</strong> {error.digest}</p>
                )}
                <p><strong>スタック:</strong></p>
                <pre className="whitespace-pre-wrap">{error.stack}</pre>
              </div>
            </details>
          )}
        </div>

        {/* アクションボタン */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button onClick={reset} size="lg" className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            再試行
          </Button>
          <Button variant="outline" asChild size="lg">
            <Link href="/" className="flex items-center gap-2">
              <Home className="w-4 h-4" />
              ホームに戻る
            </Link>
          </Button>
        </div>

        {/* 追加情報 */}
        <div className="text-sm text-muted-foreground">
          <p>
            問題が解決しない場合は、しばらく時間をおいてから再度アクセスしてください。
          </p>
        </div>
      </div>
    </div>
  );
}
