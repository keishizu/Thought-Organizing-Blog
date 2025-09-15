import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { SecurityMonitor } from '@/lib/utils/security'
import { randomBytes } from 'crypto'

// nonce生成関数
function generateNonce(): string {
  return randomBytes(16).toString('base64').replace(/[+/=]/g, '').substring(0, 16)
}

// CSP生成関数
function generateCSPPolicy(nonce?: string) {
  const isProd = process.env.NODE_ENV === 'production';
  const useNonce = process.env.USE_CSP_NONCE === 'true';
  const reportOnly = process.env.REPORT_ONLY_CSP === 'true';

  const policies = [
    "default-src 'self'",
  ];

  const scriptSrc = ["'self'"];
  
  if (useNonce && nonce) {
    scriptSrc.push(`'nonce-${nonce}'`);
    // 本番環境では unsafe-inline を完全に削除
    if (!isProd) {
      scriptSrc.push("'unsafe-inline'", "'unsafe-eval'");
    }
  } else {
    if (!isProd) {
      scriptSrc.push("'unsafe-inline'", "'unsafe-eval'");
    }
  }
  
  scriptSrc.push('https://www.googletagmanager.com', 'https://www.google-analytics.com');
  policies.push(`script-src ${scriptSrc.join(' ')}`);

  const styleSrc = ["'self'", 'https://fonts.googleapis.com'];
  if (useNonce && nonce) {
    styleSrc.push(`'nonce-${nonce}'`);
    if (!isProd) {
      styleSrc.push("'unsafe-inline'");
    }
  } else if (!isProd) {
    styleSrc.push("'unsafe-inline'");
  }
  policies.push(`style-src ${styleSrc.join(' ')}`);

  policies.push("font-src 'self' https://fonts.gstatic.com data:");
  policies.push("img-src 'self' data: https: blob:");
  policies.push("connect-src 'self' https://qprlaprnzqewcgpcvzme.supabase.co wss://qprlaprnzqewcgpcvzme.supabase.co https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com");
  policies.push("frame-src 'self' https://www.googletagmanager.com");
  policies.push("frame-ancestors 'self'");
  policies.push("object-src 'none'");
  policies.push("base-uri 'self'");
  policies.push("form-action 'self'");
  policies.push("worker-src 'self' blob:");
  policies.push("manifest-src 'self'");
  
  if (!reportOnly) {
    policies.push('upgrade-insecure-requests');
  }

  const reportUri = process.env.CSP_REPORT_URI;
  if (reportUri) {
    policies.push(`report-uri ${reportUri}`);
  } else {
    policies.push('report-uri /api/csp-report');
  }

  return policies.join('; ');
}

export async function middleware(request: NextRequest) {
  // CSP nonce生成（USE_CSP_NONCEが有効な場合のみ）
  const useCSPNonce = process.env.USE_CSP_NONCE === 'true'
  const nonce = useCSPNonce ? generateNonce() : undefined

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // nonceをヘッダーに追加
  if (nonce) {
    response.headers.set('x-csp-nonce', nonce)
  }

  // CSPヘッダーを設定
  const cspPolicy = generateCSPPolicy(nonce);
  const reportOnly = process.env.REPORT_ONLY_CSP === 'true';
  const headerName = reportOnly ? 'Content-Security-Policy-Report-Only' : 'Content-Security-Policy';
  response.headers.set(headerName, cspPolicy);

  // セキュリティ監視
  if (process.env.NODE_ENV === 'production') {
    const securityMonitor = SecurityMonitor.getInstance();
    const url = request.url;
    const userAgent = request.headers.get('user-agent') || '';
    const referer = request.headers.get('referer') || '';

    // 疑わしいリクエストの検出
    securityMonitor.detectSuspiciousRequest(url, userAgent, referer);
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll().map(({ name, value }) => ({ name, value })),
        setAll: (cookies) => {
          cookies.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      }
    }
  )
  
  await supabase.auth.getUser()
  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|sitemap\\.xml|robots\\.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
} 

