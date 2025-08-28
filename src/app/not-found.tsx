import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted">
      <div className="text-center space-y-8 p-8">
        {/* 404 アイコン */}
        <div className="text-9xl font-bold text-muted-foreground/20">404</div>

        {/* メッセージ */}
        <div className="space-y-4">
          <h1 className="text-3xl font-bold text-foreground">
            ページが見つかりません
          </h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            お探しのページは存在しないか、移動または削除された可能性があります。
          </p>
        </div>

        {/* アクションボタン */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg">
            <Link href="/" className="flex items-center gap-2">
              <Home className="w-4 h-4" />
              ホームに戻る
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
