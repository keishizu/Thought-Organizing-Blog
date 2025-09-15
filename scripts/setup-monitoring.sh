#!/bin/bash

# パフォーマンス監視セットアップスクリプト
# 本番環境でのcronジョブやシステムサービスのセットアップ

set -e

echo "🚀 Setting up Performance Monitoring System..."

# 必要なディレクトリの作成
echo "📁 Creating monitoring directories..."
mkdir -p lighthouse-reports
mkdir -p performance-metrics
mkdir -p performance-alerts
mkdir -p logs/monitoring

# ログファイルの作成
touch logs/monitoring/lighthouse.log
touch logs/monitoring/performance.log
touch logs/monitoring/errors.log

# 権限設定
chmod +x scripts/lighthouse-audit.js
chmod +x scripts/setup-monitoring.sh

echo "📋 Setting up monitoring configuration..."

# 環境変数の設定例を作成
cat > .env.monitoring.example << 'EOF'
# パフォーマンス監視設定
LIGHTHOUSE_BASE_URL=https://your-production-url.com
PERFORMANCE_ALERT_EMAIL=admin@yourdomain.com
MONITORING_ENABLED=true

# Slack通知設定（オプション）
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK
SLACK_CHANNEL=#performance-alerts

# 外部監視サービス設定（オプション）
DATADOG_API_KEY=your_datadog_api_key
NEW_RELIC_LICENSE_KEY=your_newrelic_license_key
EOF

# crontab設定の例を作成
cat > crontab.example << 'EOF'
# パフォーマンス監視のcronジョブ設定例
# 注意: 実際の環境に合わせてパスを調整してください

# 毎時間Lighthouseテストを実行（本番環境）
0 * * * * cd /path/to/your/project && npm run lighthouse:prod >> logs/monitoring/lighthouse.log 2>&1

# 毎日午前2時にフルパフォーマンステストを実行
0 2 * * * cd /path/to/your/project && npm run performance:monitor >> logs/monitoring/performance.log 2>&1

# 毎週月曜日午前3時に古いレポートをクリーンアップ
0 3 * * 1 cd /path/to/your/project && find lighthouse-reports -name "*.html" -mtime +30 -delete

# 毎月1日にパフォーマンス履歴をアーカイブ
0 4 1 * * cd /path/to/your/project && tar -czf "performance-archive-$(date +\%Y\%m).tar.gz" performance-metrics/
EOF

# systemd service設定の例を作成（Linux環境用）
cat > performance-monitor.service.example << 'EOF'
[Unit]
Description=Performance Monitor Service
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/path/to/your/project
Environment=NODE_ENV=production
ExecStart=/usr/bin/npm run performance:monitor
Restart=on-failure
RestartSec=30

[Install]
WantedBy=multi-user.target
EOF

# Docker Compose設定の例を作成
cat > docker-compose.monitoring.yml << 'EOF'
version: '3.8'

services:
  performance-monitor:
    build: .
    environment:
      - NODE_ENV=production
      - LIGHTHOUSE_BASE_URL=https://your-production-url.com
    volumes:
      - ./lighthouse-reports:/app/lighthouse-reports
      - ./performance-metrics:/app/performance-metrics
      - ./logs:/app/logs
    command: |
      sh -c '
        while true; do
          npm run lighthouse:prod
          sleep 3600
        done
      '
    restart: unless-stopped

  lighthouse-scheduler:
    build: .
    environment:
      - NODE_ENV=production
    volumes:
      - ./lighthouse-reports:/app/lighthouse-reports
      - ./logs:/app/logs
    command: |
      sh -c '
        echo "0 */2 * * * cd /app && npm run lighthouse:prod >> logs/monitoring/lighthouse.log 2>&1" | crontab -
        crond -f
      '
    restart: unless-stopped
EOF

# 監視用スクリプトの作成
cat > scripts/check-performance-health.sh << 'EOF'
#!/bin/bash

# パフォーマンス監視システムのヘルスチェック

echo "🔍 Checking Performance Monitoring Health..."

# 最新のLighthouseレポートをチェック
LATEST_REPORT=$(find lighthouse-reports -name "overall-summary.json" -mtime -1 | head -1)

if [ -z "$LATEST_REPORT" ]; then
    echo "❌ No recent Lighthouse reports found (last 24 hours)"
    exit 1
else
    echo "✅ Recent Lighthouse report found: $LATEST_REPORT"
    
    # パフォーマンススコアをチェック
    PERFORMANCE_SCORE=$(cat "$LATEST_REPORT" | jq -r '.averageScores.performance')
    
    if [ "$PERFORMANCE_SCORE" -lt 90 ]; then
        echo "⚠️  Performance score below threshold: $PERFORMANCE_SCORE/100"
    else
        echo "✅ Performance score is healthy: $PERFORMANCE_SCORE/100"
    fi
fi

# CSPアラートをチェック
RECENT_ALERTS=$(find performance-alerts -name "*.json" -mtime -1 | wc -l)

if [ "$RECENT_ALERTS" -gt 0 ]; then
    echo "⚠️  $RECENT_ALERTS performance alerts in the last 24 hours"
else
    echo "✅ No recent performance alerts"
fi

# ログファイルサイズをチェック
LOG_SIZE=$(du -sh logs/monitoring/ | cut -f1)
echo "📊 Monitoring logs size: $LOG_SIZE"

echo "✅ Performance monitoring health check completed"
EOF

chmod +x scripts/check-performance-health.sh

# package.jsonにヘルスチェックスクリプトを追加するための提案
echo ""
echo "📝 Add the following script to your package.json:"
echo '  "monitoring:health": "bash scripts/check-performance-health.sh",'

echo ""
echo "🎉 Performance Monitoring Setup Complete!"
echo ""
echo "Next Steps:"
echo "1. Copy .env.monitoring.example to .env.local and configure your settings"
echo "2. Set up cron jobs using crontab.example as reference"
echo "3. For production servers, consider using the systemd service"
echo "4. Test the setup with: npm run lighthouse:dev"
echo "5. Check system health with: npm run monitoring:health"
echo ""
echo "📚 Documentation:"
echo "- Lighthouse reports will be saved to: lighthouse-reports/"
echo "- Performance metrics will be saved to: performance-metrics/"
echo "- Performance alerts will be saved to: performance-alerts/"
echo "- Monitoring logs will be saved to: logs/monitoring/"
echo ""
echo "⚠️  Important:"
echo "- Adjust file paths in crontab.example to match your deployment"
echo "- Configure proper monitoring alerts for production use"
echo "- Set up log rotation to prevent disk space issues"
echo "- Monitor the monitoring system itself for reliability"
EOF

chmod +x scripts/setup-monitoring.sh
