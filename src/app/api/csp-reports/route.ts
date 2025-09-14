import { NextResponse } from 'next/server';
import { readdir, readFile, stat } from 'fs/promises';
import { join } from 'path';

export async function GET() {
  try {
    const reportsDir = join(process.cwd(), 'csp-reports');
    
    // ディレクトリが存在するかチェック
    try {
      await stat(reportsDir);
    } catch {
      return NextResponse.json({ reports: [] });
    }

    const files = await readdir(reportsDir);
    const jsonFiles = files.filter(file => file.endsWith('.json'));

    const reports = await Promise.all(
      jsonFiles.map(async (file) => {
        try {
          const filePath = join(reportsDir, file);
          const content = await readFile(filePath, 'utf8');
          
          // JSON解析の安全性チェック
          let report;
          try {
            report = JSON.parse(content);
          } catch (parseError) {
            console.warn(`Invalid JSON in file ${file}:`, parseError);
            return null;
          }
          
          // レポート構造の基本チェック
          if (!report || typeof report !== 'object') {
            console.warn(`Invalid report structure in file ${file}`);
            return null;
          }
          
          const stats = await stat(filePath);
          
          return {
            filename: file,
            timestamp: stats.mtime,
            report
          };
        } catch (error) {
          console.error(`Error reading file ${file}:`, error);
          return null;
        }
      })
    );

    // エラーがあったファイルを除外し、タイムスタンプでソート
    const validReports = reports
      .filter(report => report !== null)
      .sort((a, b) => b!.timestamp.getTime() - a!.timestamp.getTime());

    return NextResponse.json({ 
      reports: validReports,
      count: validReports.length
    });
  } catch (error) {
    console.error('Error fetching CSP reports:', error);
    return NextResponse.json(
      { error: 'Failed to fetch CSP reports' },
      { status: 500 }
    );
  }
}
