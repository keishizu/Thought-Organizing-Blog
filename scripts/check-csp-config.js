#!/usr/bin/env node

/**
 * CSP設定確認スクリプト
 * 本番環境でのCSPポリシーの状態を確認します
 */

require('dotenv').config({ path: '.env.local' });

function getBooleanEnv(name) {
  return process.env[name] === 'true';
}

function checkCSPConfig() {
  console.log('=== CSP設定確認 ===');
  console.log(`NODE_ENV: ${process.env.NODE_ENV}`);
  console.log(`REPORT_ONLY_CSP: ${process.env.REPORT_ONLY_CSP}`);
  console.log(`USE_VERCEL_ANALYTICS: ${process.env.USE_VERCEL_ANALYTICS}`);
  console.log(`ALLOW_VERCEL_LIVE: ${process.env.ALLOW_VERCEL_LIVE}`);
  
  const isProd = process.env.NODE_ENV === 'production';
  const reportOnlyCSP = getBooleanEnv('REPORT_ONLY_CSP');
  
  console.log('\n=== 設定結果 ===');
  console.log(`本番環境: ${isProd ? 'はい' : 'いいえ'}`);
  console.log(`CSP REPORT_ONLY: ${reportOnlyCSP ? 'はい' : 'いいえ'}`);
  
  if (isProd && reportOnlyCSP) {
    console.log('\n✅ 本番環境でCSPポリシーがREPORT_ONLYモードで動作します');
  } else if (isProd && !reportOnlyCSP) {
    console.log('\n⚠️  本番環境でCSPポリシーが強制適用モードで動作します');
  } else {
    console.log('\nℹ️  開発環境でCSPポリシーが動作します');
  }
  
  console.log('\n=== 推奨設定 ===');
  console.log('本番環境でもREPORT_ONLYにする場合:');
  console.log('REPORT_ONLY_CSP=true');
  console.log('NODE_ENV=production');
}

checkCSPConfig();
