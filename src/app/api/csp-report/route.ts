import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const report = await request.json();
    
    // CSPレポートの詳細をログに出力（開発環境のみ）
    if (process.env.NODE_ENV === 'development') {
      console.log('=== CSP Violation Report ===');
      console.log('Timestamp:', new Date().toISOString());
      console.log('User-Agent:', request.headers.get('user-agent'));
      console.log('Report:', JSON.stringify(report, null, 2));
      console.log('============================');
    }
    
    // レポートをファイルに保存（開発環境用）
    if (process.env.NODE_ENV === 'development') {
      const fs = require('fs');
      const path = require('path');
      
      const reportDir = path.join(process.cwd(), 'csp-reports');
      if (!fs.existsSync(reportDir)) {
        fs.mkdirSync(reportDir, { recursive: true });
      }
      
      const reportFile = path.join(reportDir, `csp-report-${Date.now()}.json`);
      fs.writeFileSync(reportFile, JSON.stringify({
        timestamp: new Date().toISOString(),
        userAgent: request.headers.get('user-agent'),
        report: report
      }, null, 2));
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`CSP report saved to: ${reportFile}`);
      }
    }
    
    return NextResponse.json({ status: 'received' }, { status: 200 });
  } catch (error) {
    console.error('Error processing CSP report:', error);
    return NextResponse.json(
      { error: 'Failed to process CSP report' },
      { status: 500 }
    );
  }
}

// OPTIONS リクエストに対応（CORS用）
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
