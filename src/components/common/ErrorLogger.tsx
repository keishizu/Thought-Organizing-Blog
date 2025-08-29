'use client';

import { useEffect } from 'react';

interface ErrorLog {
  message: string;
  stack?: string;
  timestamp: string;
  url: string;
  userAgent: string;
}

class ErrorLogger {
  private static instance: ErrorLogger;
  private logs: ErrorLog[] = [];
  private maxLogs = 100;

  private constructor() {
    this.setupGlobalErrorHandlers();
  }

  public static getInstance(): ErrorLogger {
    if (!ErrorLogger.instance) {
      ErrorLogger.instance = new ErrorLogger();
    }
    return ErrorLogger.instance;
  }

  private setupGlobalErrorHandlers() {
    // 未処理のエラーをキャッチ
    window.addEventListener('error', (event) => {
      this.logError({
        message: event.message,
        stack: event.error?.stack,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent,
      });
    });

    // 未処理のPromise拒否をキャッチ
    window.addEventListener('unhandledrejection', (event) => {
      this.logError({
        message: `Unhandled Promise Rejection: ${event.reason}`,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent,
      });
    });
  }

  public logError(error: ErrorLog) {
    this.logs.push(error);
    
    // ログ数が上限を超えた場合、古いログを削除
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // 本番環境では外部サービスに送信
    if (process.env.NODE_ENV === 'production') {
      this.sendToExternalService(error);
    }

    // 開発環境ではコンソールに出力
    if (process.env.NODE_ENV === 'development') {
      console.error('Error logged:', error);
    }
  }

  private async sendToExternalService(error: ErrorLog) {
    try {
      // ここで外部のエラー監視サービス（例：Sentry、LogRocket等）に送信
      // 現在は実装していないが、将来的に追加可能
      console.log('Error would be sent to external service:', error);
    } catch (sendError) {
      console.error('Failed to send error to external service:', sendError);
    }
  }

  public getLogs(): ErrorLog[] {
    return [...this.logs];
  }

  public clearLogs() {
    this.logs = [];
  }
}

export function ErrorLoggerProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // エラーロガーのインスタンスを初期化
    ErrorLogger.getInstance();
  }, []);

  return <>{children}</>;
}

export { ErrorLogger };
