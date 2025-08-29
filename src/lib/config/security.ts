/**
 * セキュリティ・監視の設定
 */

export interface SecurityConfig {
  // CSP設定
  csp: {
    enabled: boolean;
    reportOnly: boolean;
    reportUri?: string;
    useVercelAnalytics: boolean;
    allowVercelLive: boolean;
  };
  
  // 監視設定
  monitoring: {
    errorLogging: boolean;
    performanceMonitoring: boolean;
    securityMonitoring: boolean;
    externalServices: {
      errorTracking?: string;
      performanceMonitoring?: string;
      securityMonitoring?: string;
    };
  };
  
  // レート制限設定
  rateLimit: {
    enabled: boolean;
    windowMs: number;
    maxRequests: number;
    skipSuccessfulRequests: boolean;
    skipFailedRequests: boolean;
  };
  
  // セキュリティヘッダー設定
  headers: {
    hsts: boolean;
    xssProtection: boolean;
    contentSecurityPolicy: boolean;
    referrerPolicy: boolean;
  };
}

// 開発環境用の設定
export const developmentConfig: SecurityConfig = {
  csp: {
    enabled: true,
    reportOnly: true,
    useVercelAnalytics: process.env.USE_VERCEL_ANALYTICS === 'true',
    allowVercelLive: process.env.ALLOW_VERCEL_LIVE === 'true',
  },
  monitoring: {
    errorLogging: true,
    performanceMonitoring: true,
    securityMonitoring: true,
    externalServices: {},
  },
  rateLimit: {
    enabled: false,
    windowMs: 15 * 60 * 1000, // 15分
    maxRequests: 100,
    skipSuccessfulRequests: false,
    skipFailedRequests: false,
  },
  headers: {
    hsts: false,
    xssProtection: true,
    contentSecurityPolicy: true,
    referrerPolicy: true,
  },
};

// 本番環境用の設定
export const productionConfig: SecurityConfig = {
  csp: {
    enabled: true,
    reportOnly: false,
    reportUri: process.env.CSP_REPORT_URI,
    useVercelAnalytics: process.env.USE_VERCEL_ANALYTICS === 'true',
    allowVercelLive: process.env.ALLOW_VERCEL_LIVE === 'true',
  },
  monitoring: {
    errorLogging: true,
    performanceMonitoring: true,
    securityMonitoring: true,
    externalServices: {
      errorTracking: process.env.ERROR_TRACKING_SERVICE,
      performanceMonitoring: process.env.PERFORMANCE_MONITORING_SERVICE,
      securityMonitoring: process.env.SECURITY_MONITORING_SERVICE,
    },
  },
  rateLimit: {
    enabled: true,
    windowMs: 15 * 60 * 1000, // 15分
    maxRequests: 100,
    skipSuccessfulRequests: false,
    skipFailedRequests: false,
  },
  headers: {
    hsts: true,
    xssProtection: true,
    contentSecurityPolicy: true,
    referrerPolicy: true,
  },
};

// 環境に応じた設定を取得
export function getSecurityConfig(): SecurityConfig {
  const baseConfig = process.env.NODE_ENV === 'production' ? productionConfig : developmentConfig;
  
  // REPORT_ONLY_CSP環境変数で強制的にReport-Onlyモードに切り替え
  if (process.env.REPORT_ONLY_CSP === 'true') {
    return {
      ...baseConfig,
      csp: {
        ...baseConfig.csp,
        reportOnly: true,
      },
    };
  }
  
  return baseConfig;
}

// CSPポリシーの生成
export function generateCSPPolicy(): string {
  const config = getSecurityConfig();
  
  if (!config.csp.enabled) {
    return '';
  }

  const policies = [
    "default-src 'self'",
  ];

  // script-src: 本番ではunsafe-*を除外、開発では許可
  const scriptSrc = ["'self'"];
  if (process.env.NODE_ENV !== 'production') {
    scriptSrc.push("'unsafe-inline'", "'unsafe-eval'");
  }
  if (config.csp.useVercelAnalytics) {
    scriptSrc.push("https://va.vercel-scripts.com");
  }
  policies.push(`script-src ${scriptSrc.join(' ')}`);

  // style-src: 本番ではunsafe-inlineを除外、開発では許可
  const styleSrc = ["'self'", "https://fonts.googleapis.com"];
  if (process.env.NODE_ENV !== 'production') {
    styleSrc.push("'unsafe-inline'");
  }
  policies.push(`style-src ${styleSrc.join(' ')}`);

  // font-src
  policies.push("font-src 'self' https://fonts.gstatic.com data:");

  // img-src
  policies.push("img-src 'self' data: https: blob:");

  // connect-src: Supabase + 条件付きVercelサービス
  const connectSrc = [
    "'self'",
    "https://qprlaprnzqewcgpcvzme.supabase.co",
    "wss://qprlaprnzqewcgpcvzme.supabase.co"
  ];
  if (config.csp.useVercelAnalytics) {
    connectSrc.push("https://vitals.vercel-insights.com");
  }
  if (config.csp.allowVercelLive) {
    connectSrc.push("https://vercel.live");
  }
  policies.push(`connect-src ${connectSrc.join(' ')}`);

  // frame-src: 必要に応じて'self'を許可
  policies.push("frame-src 'self'");

  // frame-ancestors: クリックジャッキング対策
  policies.push("frame-ancestors 'self'");

  // object-src: 完全に無効化
  policies.push("object-src 'none'");

  // base-uri
  policies.push("base-uri 'self'");

  // form-action
  policies.push("form-action 'self'");

  // worker-src
  policies.push("worker-src 'self' blob:");

  // manifest-src
  policies.push("manifest-src 'self'");

  // upgrade-insecure-requests
  policies.push("upgrade-insecure-requests");

  // レポートURIが設定されている場合
  if (config.csp.reportUri) {
    policies.push(`report-uri ${config.csp.reportUri}`);
  }

  return policies.join('; ');
}

// セキュリティヘッダーの生成
export function generateSecurityHeaders(): Record<string, string> {
  const config = getSecurityConfig();
  const headers: Record<string, string> = {};

  if (config.headers.hsts) {
    headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains; preload';
  }

  if (config.headers.xssProtection) {
    headers['X-XSS-Protection'] = '1; mode=block';
  }

  if (config.headers.contentSecurityPolicy) {
    const cspPolicy = generateCSPPolicy();
    if (cspPolicy) {
      // Report-Onlyモードの場合は適切なヘッダー名を使用
      const headerName = config.csp.reportOnly 
        ? 'Content-Security-Policy-Report-Only' 
        : 'Content-Security-Policy';
      headers[headerName] = cspPolicy;
    }
  }

  if (config.headers.referrerPolicy) {
    headers['Referrer-Policy'] = 'origin-when-cross-origin';
  }

  return headers;
}
