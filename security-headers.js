// Plain JS helper for Next config. Avoid importing TS from next.config.js

function getBooleanEnv(name) {
  return process.env[name] === 'true';
}

// nonce を生成する関数
function generateNonce() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

function generateCSPPolicy(requestNonce) {
  const isProd = process.env.NODE_ENV === 'production';
  const useVercelAnalytics = getBooleanEnv('USE_VERCEL_ANALYTICS');
  const allowVercelLive = getBooleanEnv('ALLOW_VERCEL_LIVE');
  const reportOnlyCSP = getBooleanEnv('REPORT_ONLY_CSP');
  const useNonce = getBooleanEnv('USE_CSP_NONCE');

  // 環境変数の状態をログ出力
  console.log('CSP設定情報:', {
    NODE_ENV: process.env.NODE_ENV,
    isProd,
    REPORT_ONLY_CSP: reportOnlyCSP,
    USE_VERCEL_ANALYTICS: useVercelAnalytics,
    ALLOW_VERCEL_LIVE: allowVercelLive,
    USE_CSP_NONCE: useNonce,
    hasRequestNonce: !!requestNonce
  });

  const policies = [
    "default-src 'self'",
  ];

  const scriptSrc = ["'self'"];
  
  if (useNonce && requestNonce) {
    // middlewareから渡されたnonceを使用
    scriptSrc.push(`'nonce-${requestNonce}'`);
    // nonce をグローバルに保存（GTM コンポーネントで使用）
    global.cspNonce = requestNonce;
    // 本番環境では unsafe-inline を完全に削除、開発環境でのみ許可
    if (!isProd) {
      scriptSrc.push("'unsafe-inline'", "'unsafe-eval'");
    }
  } else if (useNonce) {
    // fallback: 独自生成
    const nonce = generateNonce();
    scriptSrc.push(`'nonce-${nonce}'`);
    global.cspNonce = nonce;
    if (!isProd) {
      scriptSrc.push("'unsafe-inline'", "'unsafe-eval'");
    }
  } else {
    // 従来の unsafe-inline ベース（非推奨：本番環境では使用しない）
    if (!isProd) {
      scriptSrc.push("'unsafe-inline'", "'unsafe-eval'");
    }
    // 本番環境では unsafe-inline を完全に削除
  }
  
  if (useVercelAnalytics) {
    scriptSrc.push('https://va.vercel-scripts.com');
  }
  // GTM ドメインを許可
  scriptSrc.push('https://www.googletagmanager.com');
  policies.push(`script-src ${scriptSrc.join(' ')}`);

  const styleSrc = ["'self'", 'https://fonts.googleapis.com'];
  if (useNonce && requestNonce) {
    // middlewareから渡されたnonceを使用
    styleSrc.push(`'nonce-${requestNonce}'`);
    // nonce をグローバルに保存（style コンポーネントで使用）
    global.cspStyleNonce = requestNonce;
    // 本番環境では unsafe-inline を完全に削除
    if (!isProd) {
      styleSrc.push("'unsafe-inline'");
    }
  } else if (useNonce) {
    // fallback: 独自生成
    const styleNonce = generateNonce();
    styleSrc.push(`'nonce-${styleNonce}'`);
    global.cspStyleNonce = styleNonce;
    if (!isProd) {
      styleSrc.push("'unsafe-inline'");
    }
  } else if (!isProd) {
    styleSrc.push("'unsafe-inline'");
  }
  policies.push(`style-src ${styleSrc.join(' ')}`);

  policies.push("font-src 'self' https://fonts.gstatic.com data:");
  policies.push("img-src 'self' data: https: blob:");

  const connectSrc = [
    "'self'",
    'https://qprlaprnzqewcgpcvzme.supabase.co',
    'wss://qprlaprnzqewcgpcvzme.supabase.co',
  ];
  if (useVercelAnalytics) {
    connectSrc.push('https://vitals.vercel-insights.com');
  }
  if (allowVercelLive) {
    connectSrc.push('https://vercel.live');
  }
  // GTM ドメインを許可
  connectSrc.push('https://www.googletagmanager.com');
  policies.push(`connect-src ${connectSrc.join(' ')}`);

  policies.push("frame-src 'self' https://www.googletagmanager.com");
  policies.push("frame-ancestors 'self'");
  policies.push("object-src 'none'");
  policies.push("base-uri 'self'");
  policies.push("form-action 'self'");
  policies.push("worker-src 'self' blob:");
  policies.push("manifest-src 'self'");
  
  // Report Only モードでは upgrade-insecure-requests を除外
  // このディレクティブは実際の動作を変更するため、Report Only では無効
  if (!reportOnlyCSP) {
    policies.push('upgrade-insecure-requests');
  }

  const reportUri = process.env.CSP_REPORT_URI;
  if (reportUri) {
    policies.push(`report-uri ${reportUri}`);
  }

  return policies.join('; ');
}

function generateSecurityHeaders(requestNonce) {
  const headers = {};
  
  // Strict-Transport-Security は本番環境でのみ設定
  // upgrade-insecure-requests と重複するため、適切に使い分け
  if (process.env.NODE_ENV === 'production') {
    headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains; preload';
  }
  
  headers['X-XSS-Protection'] = '1; mode=block';
  headers['Referrer-Policy'] = 'origin-when-cross-origin';

  const csp = generateCSPPolicy(requestNonce);
  const reportOnly = getBooleanEnv('REPORT_ONLY_CSP');
  const headerName = reportOnly ? 'Content-Security-Policy-Report-Only' : 'Content-Security-Policy';
  headers[headerName] = csp;

  return headers;
}

module.exports = { generateSecurityHeaders };


