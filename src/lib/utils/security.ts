/**
 * セキュリティ監視のためのユーティリティ関数
 */

export interface SecurityEvent {
  type: 'suspicious_request' | 'authentication_failure' | 'authorization_failure' | 'rate_limit_exceeded';
  details: {
    url?: string;
    userAgent?: string;
    ip?: string;
    userId?: string;
    timestamp: string;
    [key: string]: any;
  };
}

class SecurityMonitor {
  private static instance: SecurityMonitor;
  private events: SecurityEvent[] = [];
  private maxEvents = 1000;

  private constructor() {}

  public static getInstance(): SecurityMonitor {
    if (!SecurityMonitor.instance) {
      SecurityMonitor.instance = new SecurityMonitor();
    }
    return SecurityMonitor.instance;
  }

  /**
   * セキュリティイベントを記録
   */
  public logEvent(event: SecurityEvent): void {
    this.events.push(event);
    
    // イベント数が上限を超えた場合、古いイベントを削除
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(-this.maxEvents);
    }

    // 本番環境では外部のセキュリティ監視サービスに送信
    if (process.env.NODE_ENV === 'production') {
      this.sendToExternalService(event);
    }

    // 開発環境ではコンソールに出力
    if (process.env.NODE_ENV === 'development') {
      console.warn('Security event logged:', event);
    }
  }

  /**
   * 疑わしいリクエストを検出
   */
  public detectSuspiciousRequest(url: string, userAgent: string, referer?: string): boolean {
    const suspiciousPatterns = [
      /\.\.\//, // ディレクトリトラバーサル攻撃
      /<script/i, // XSS攻撃
      /javascript:/i, // JavaScriptインジェクション
      /on\w+\s*=/i, // イベントハンドラーインジェクション
      /union\s+select/i, // SQLインジェクション
      /<iframe/i, // iframeインジェクション
      /eval\s*\(/i, // eval関数の使用
    ];

    for (const pattern of suspiciousPatterns) {
      if (pattern.test(url) || pattern.test(userAgent) || (referer && pattern.test(referer))) {
        this.logEvent({
          type: 'suspicious_request',
          details: {
            url,
            userAgent,
            referer,
            pattern: pattern.source,
            timestamp: new Date().toISOString(),
          },
        });
        return true;
      }
    }

    return false;
  }

  /**
   * 認証失敗を記録
   */
  public logAuthenticationFailure(userId: string, reason: string, ip?: string): void {
    this.logEvent({
      type: 'authentication_failure',
      details: {
        userId,
        reason,
        ip,
        timestamp: new Date().toISOString(),
      },
    });
  }

  /**
   * 認可失敗を記録
   */
  public logAuthorizationFailure(userId: string, resource: string, action: string, ip?: string): void {
    this.logEvent({
      type: 'authorization_failure',
      details: {
        userId,
        resource,
        action,
        ip,
        timestamp: new Date().toISOString(),
      },
    });
  }

  /**
   * レート制限超過を記録
   */
  public logRateLimitExceeded(identifier: string, limit: number, window: number, ip?: string): void {
    this.logEvent({
      type: 'rate_limit_exceeded',
      details: {
        identifier,
        limit,
        window,
        ip,
        timestamp: new Date().toISOString(),
      },
    });
  }

  /**
   * 外部サービスにセキュリティイベントを送信
   */
  private async sendToExternalService(event: SecurityEvent): Promise<void> {
    try {
      // ここで外部のセキュリティ監視サービス（例：Sentry、LogRocket等）に送信
      // 現在は実装していないが、将来的に追加可能
      console.log('Security event would be sent to external service:', event);
    } catch (error) {
      console.error('Failed to send security event to external service:', error);
    }
  }

  /**
   * 記録されたイベントを取得
   */
  public getEvents(): SecurityEvent[] {
    return [...this.events];
  }

  /**
   * イベントをクリア
   */
  public clearEvents(): void {
    this.events = [];
  }

  /**
   * 特定のタイプのイベント数を取得
   */
  public getEventCount(type: SecurityEvent['type']): number {
    return this.events.filter(event => event.type === type).length;
  }
}

export { SecurityMonitor };
