'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, FileQuestion, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function TestPages() {
  const [isLoading, setIsLoading] = useState(false);

  const triggerError = () => {
    throw new Error('テスト用のエラーです。これは意図的に発生させたエラーです。');
  };

  const simulateLoading = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 3000);
  };

  return (
    <div className="container mx-auto p-8 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">テストページ一覧</h1>
        <p className="text-muted-foreground">
          404ページ、エラーページ、ローディングページの動作確認ができます
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* 404ページテスト */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileQuestion className="w-5 h-5 text-blue-500" />
              404ページテスト
            </CardTitle>
            <CardDescription>
              存在しないページにアクセスして404ページを確認
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              以下のリンクをクリックして404ページを表示させてください
            </p>
            <div className="space-y-2">
              <Button variant="outline" asChild className="w-full">
                <Link href="/存在しないページ">存在しないページ</Link>
              </Button>
              <Button variant="outline" asChild className="w-full">
                <Link href="/not-found-test">not-found-test</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* エラーページテスト */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              エラーページテスト
            </CardTitle>
            <CardDescription>
              意図的にエラーを発生させてエラーページを確認
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              以下のボタンをクリックするとエラーページが表示されます
            </p>
            <Button 
              onClick={triggerError} 
              variant="destructive" 
              className="w-full"
            >
              エラーを発生させる
            </Button>
          </CardContent>
        </Card>

        {/* ローディングページテスト */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Loader2 className="w-5 h-5 text-green-500" />
              ローディングテスト
            </CardTitle>
            <CardDescription>
              ローディング状態の表示を確認
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              3秒間のローディング状態をシミュレートします
            </p>
            <Button 
              onClick={simulateLoading} 
              variant="secondary" 
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ローディング中...
                </>
              ) : (
                'ローディング開始'
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* 説明 */}
      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle>テスト方法の説明</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-semibold">1. 404ページの確認</h4>
            <p className="text-sm text-muted-foreground">
              上記の「存在しないページ」リンクをクリックすると、404ページが表示されます。
              美しいデザインで、ホームページや図書一覧への導線が提供されます。
            </p>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-semibold">2. エラーページの確認</h4>
            <p className="text-sm text-muted-foreground">
              「エラーを発生させる」ボタンをクリックすると、エラーページが表示されます。
              開発環境ではエラーの詳細情報も確認できます。
            </p>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-semibold">3. ローディング状態の確認</h4>
            <p className="text-sm text-muted-foreground">
              「ローディング開始」ボタンをクリックすると、3秒間のローディング状態が表示されます。
              実際のページ遷移時のローディング状態をシミュレートできます。
            </p>
          </div>
        </CardContent>
      </Card>

      {/* ホームに戻る */}
      <div className="text-center">
        <Button asChild>
          <Link href="/">ホームに戻る</Link>
        </Button>
      </div>
    </div>
  );
}
