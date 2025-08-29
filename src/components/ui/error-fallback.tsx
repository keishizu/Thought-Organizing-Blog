"use client";

import { Button } from "@/components/ui/button";

interface ErrorFallbackProps {
  title?: string;
  message?: string;
  buttonText?: string;
}

export default function ErrorFallback({
  title = "申し訳ございません",
  message = "ページの読み込み中にエラーが発生しました。しばらく時間をおいてから再度お試しください。",
  buttonText = "ページを再読み込み"
}: ErrorFallbackProps) {
  const handleReload = () => {
    window.location.reload();
  };

  return (
    <div className="container-custom py-20">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          {title}
        </h1>
        <p className="text-gray-600 mb-8">
          {message}
        </p>
        <Button onClick={handleReload} className="btn-primary">
          {buttonText}
        </Button>
      </div>
    </div>
  );
}
