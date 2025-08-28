import LoadingSpinner from '@/components/common/LoadingSpinner';

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted">
      <div className="text-center space-y-6">
        {/* ローディングスピナー */}
        <LoadingSpinner />
        
        {/* ローディングメッセージ */}
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-foreground">
            読み込み中...
          </h2>
          <p className="text-muted-foreground">
            図書を準備しています
          </p>
        </div>
        
        {/* アニメーション付きドット */}
        <div className="flex justify-center space-x-1">
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
        </div>
      </div>
    </div>
  );
}
