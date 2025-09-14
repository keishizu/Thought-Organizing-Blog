'use client';

import { useState, useEffect } from 'react';

interface CSPReport {
  'csp-report': {
    'document-uri': string;
    referrer: string;
    'violated-directive': string;
    'effective-directive': string;
    'original-policy': string;
    disposition: string;
    'blocked-uri': string;
    'line-number'?: number;
    'column-number'?: number;
    'source-file'?: string;
    'status-code': number;
    'script-sample'?: string;
  };
}

interface ReportFile {
  filename: string;
  timestamp: Date;
  report: CSPReport;
}

export default function CSPReportAnalyzerPage() {
  // 本番環境では404を表示
  if (process.env.NODE_ENV === 'production') {
    return (
      <div className="container mx-auto p-8 text-center">
        <h1 className="text-3xl font-bold mb-4">404 - Page Not Found</h1>
        <p className="text-gray-600">このページは開発環境でのみ利用可能です。</p>
      </div>
    );
  }

  const [reports, setReports] = useState<ReportFile[]>([]);
  const [filteredReports, setFilteredReports] = useState<ReportFile[]>([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/csp-reports');
      if (response.ok) {
        const data = await response.json();
        setReports(data.reports || []);
      } else {
        console.error('Failed to fetch CSP reports');
      }
    } catch (error) {
      console.error('Error fetching CSP reports:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  useEffect(() => {
    let filtered = reports;
    
    if (filter === 'style') {
      filtered = reports.filter(report => {
        try {
          const cspReport = report?.report?.['csp-report'];
          return cspReport?.['violated-directive']?.includes('style-src') || false;
        } catch {
          return false;
        }
      });
    } else if (filter === 'script') {
      filtered = reports.filter(report => {
        try {
          const cspReport = report?.report?.['csp-report'];
          return cspReport?.['violated-directive']?.includes('script-src') || false;
        } catch {
          return false;
        }
      });
    } else if (filter === 'our-components') {
      // 私たちのコンポーネント関連のみ
      filtered = reports.filter(report => {
        try {
          const cspReport = report?.report?.['csp-report'];
          if (!cspReport) return false;
          
          const sourceFile = cspReport['source-file'] || '';
          const documentUri = cspReport['document-uri'] || '';
          return documentUri.includes('/csp-test') || 
                 documentUri.includes('/csp-component-test') ||
                 sourceFile.includes('progress') ||
                 sourceFile.includes('chart') ||
                 sourceFile.includes('performance');
        } catch {
          return false;
        }
      });
    }
    
    setFilteredReports(filtered);
  }, [reports, filter]);

  const getViolationSummary = () => {
    const summary = {
      total: reports.length,
      styleViolations: 0,
      scriptViolations: 0,
      ourComponents: 0,
      nextJsInternal: 0
    };

    reports.forEach(report => {
      try {
        // 安全にデータにアクセス
        const cspReport = report?.report?.['csp-report'];
        if (!cspReport) return;

        const violatedDirective = cspReport['violated-directive'] || '';
        const sourceFile = cspReport['source-file'] || '';
        
        if (violatedDirective.includes('style-src')) {
          summary.styleViolations++;
        }
        if (violatedDirective.includes('script-src')) {
          summary.scriptViolations++;
        }
        if (sourceFile.includes('webpack-internal') || sourceFile.includes('index.js')) {
          summary.nextJsInternal++;
        } else {
          summary.ourComponents++;
        }
      } catch (error) {
        console.warn('Error processing report:', error, report);
      }
    });

    return summary;
  };

  const summary = getViolationSummary();

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">CSP レポート分析</h1>
      
      {/* サマリー */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-blue-50 p-4 rounded">
          <div className="text-2xl font-bold text-blue-600">{summary.total}</div>
          <div className="text-sm text-gray-600">総違反数</div>
        </div>
        <div className="bg-red-50 p-4 rounded">
          <div className="text-2xl font-bold text-red-600">{summary.styleViolations}</div>
          <div className="text-sm text-gray-600">Style違反</div>
        </div>
        <div className="bg-yellow-50 p-4 rounded">
          <div className="text-2xl font-bold text-yellow-600">{summary.scriptViolations}</div>
          <div className="text-sm text-gray-600">Script違反</div>
        </div>
        <div className="bg-green-50 p-4 rounded">
          <div className="text-2xl font-bold text-green-600">{summary.ourComponents}</div>
          <div className="text-sm text-gray-600">我々のコンポーネント</div>
        </div>
        <div className="bg-gray-50 p-4 rounded">
          <div className="text-2xl font-bold text-gray-600">{summary.nextJsInternal}</div>
          <div className="text-sm text-gray-600">Next.js内部</div>
        </div>
      </div>

      {/* フィルター */}
      <div className="mb-6">
        <div className="flex space-x-4">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded ${filter === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            すべて ({reports.length})
          </button>
          <button
            onClick={() => setFilter('style')}
            className={`px-4 py-2 rounded ${filter === 'style' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            Style違反 ({summary.styleViolations})
          </button>
          <button
            onClick={() => setFilter('script')}
            className={`px-4 py-2 rounded ${filter === 'script' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            Script違反 ({summary.scriptViolations})
          </button>
          <button
            onClick={() => setFilter('our-components')}
            className={`px-4 py-2 rounded ${filter === 'our-components' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            我々のコンポーネント ({summary.ourComponents})
          </button>
          <button
            onClick={fetchReports}
            className="px-4 py-2 rounded bg-green-500 text-white hover:bg-green-600"
          >
            更新
          </button>
        </div>
      </div>

      {/* レポート一覧 */}
      <div>
        <h2 className="text-xl font-semibold mb-4">
          CSP違反レポート ({filteredReports.length}件)
        </h2>
        
        {loading ? (
          <div className="text-center py-8">
            <div className="text-gray-500">レポートを読み込み中...</div>
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-500">該当するCSP違反レポートがありません</div>
            <div className="text-sm text-gray-400 mt-2">
              これは良いことです！コンポーネントが正しく動作しています。
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredReports.map((reportFile, index) => (
              <div key={index} className="border rounded p-4 bg-white">
                <div className="flex justify-between items-start mb-2">
                  <div className="text-sm text-gray-500">
                    {reportFile.timestamp.toLocaleString()}
                  </div>
                  <div className={`px-2 py-1 rounded text-xs ${
                    (reportFile.report?.['csp-report']?.['violated-directive'] || '').includes('style') 
                      ? 'bg-red-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {reportFile.report?.['csp-report']?.['violated-directive'] || 'Unknown'}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong>ドキュメント URI:</strong><br />
                    <code className="text-xs bg-gray-100 p-1 rounded">
                      {reportFile.report?.['csp-report']?.['document-uri'] || 'N/A'}
                    </code>
                  </div>
                  <div>
                    <strong>ソースファイル:</strong><br />
                    <code className="text-xs bg-gray-100 p-1 rounded">
                      {reportFile.report?.['csp-report']?.['source-file'] || 'N/A'}
                    </code>
                  </div>
                </div>
                
                {reportFile.report?.['csp-report']?.['line-number'] && (
                  <div className="mt-2 text-sm">
                    <strong>位置:</strong> 
                    行 {reportFile.report['csp-report']['line-number']}
                    {reportFile.report?.['csp-report']?.['column-number'] && 
                      `, 列 ${reportFile.report['csp-report']['column-number']}`
                    }
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
