// Plain JS helper for Next config. Avoid importing TS from next.config.js

function getBooleanEnv(name) {
  return process.env[name] === 'true';
}

function generateCSPPolicy() {
  const isProd = process.env.NODE_ENV === 'production';
  const useVercelAnalytics = getBooleanEnv('USE_VERCEL_ANALYTICS');
  const allowVercelLive = getBooleanEnv('ALLOW_VERCEL_LIVE');
  const reportOnlyCSP = getBooleanEnv('REPORT_ONLY_CSP');

  // 環境変数の状態をログ出力
  console.log('CSP設定情報:', {
    NODE_ENV: process.env.NODE_ENV,
    isProd,
    REPORT_ONLY_CSP: reportOnlyCSP,
    USE_VERCEL_ANALYTICS: useVercelAnalytics,
    ALLOW_VERCEL_LIVE: allowVercelLive
  });

  const policies = [
    "default-src 'self'",
  ];

  const scriptSrc = ["'self'"];
  if (!isProd) {
    scriptSrc.push("'unsafe-inline'", "'unsafe-eval'");
  }
  if (useVercelAnalytics) {
    scriptSrc.push('https://va.vercel-scripts.com');
  }
  policies.push(`script-src ${scriptSrc.join(' ')}`);

  const styleSrc = ["'self'", 'https://fonts.googleapis.com'];
  if (!isProd) {
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
  policies.push(`connect-src ${connectSrc.join(' ')}`);

  policies.push("frame-src 'self'");
  policies.push("frame-ancestors 'self'");
  policies.push("object-src 'none'");
  policies.push("base-uri 'self'");
  policies.push("form-action 'self'");
  policies.push("worker-src 'self' blob:");
  policies.push("manifest-src 'self'");
  policies.push('upgrade-insecure-requests');

  const reportUri = process.env.CSP_REPORT_URI;
  if (reportUri) {
    policies.push(`report-uri ${reportUri}`);
  }

  return policies.join('; ');
}

function generateSecurityHeaders() {
  const headers = {};
  headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains; preload';
  headers['X-XSS-Protection'] = '1; mode=block';
  headers['Referrer-Policy'] = 'origin-when-cross-origin';

  const csp = generateCSPPolicy();
  const reportOnly = getBooleanEnv('REPORT_ONLY_CSP');
  const headerName = reportOnly ? 'Content-Security-Policy-Report-Only' : 'Content-Security-Policy';
  headers[headerName] = csp;

  return headers;
}

module.exports = { generateSecurityHeaders };


