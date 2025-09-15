#!/bin/bash

# CSPレポートファイルの自動クリーンアップスクリプト
# 使用方法: ./scripts/cleanup-csp-reports.sh

CSP_REPORTS_DIR="./csp-reports"
KEEP_DAYS=7  # 7日以上古いファイルを削除

echo "CSPレポートファイルのクリーンアップを開始します..."

# ディレクトリが存在するかチェック
if [ ! -d "$CSP_REPORTS_DIR" ]; then
    echo "エラー: $CSP_REPORTS_DIR ディレクトリが見つかりません"
    exit 1
fi

# ファイル数をカウント
TOTAL_FILES=$(find "$CSP_REPORTS_DIR" -name "*.json" -type f | wc -l)
echo "現在のCSPレポートファイル数: $TOTAL_FILES"

if [ "$TOTAL_FILES" -eq 0 ]; then
    echo "削除対象のファイルがありません"
    exit 0
fi

# 7日以上古いファイルを削除
OLD_FILES=$(find "$CSP_REPORTS_DIR" -name "*.json" -type f -mtime +$KEEP_DAYS)
OLD_FILES_COUNT=$(echo "$OLD_FILES" | grep -c . 2>/dev/null || echo "0")

if [ "$OLD_FILES_COUNT" -gt 0 ]; then
    echo "$KEEP_DAYS 日以上古いファイルを削除します: $OLD_FILES_COUNT 個"
    find "$CSP_REPORTS_DIR" -name "*.json" -type f -mtime +$KEEP_DAYS -delete
    echo "削除完了"
else
    echo "削除対象の古いファイルはありません"
fi

# 残りのファイル数を表示
REMAINING_FILES=$(find "$CSP_REPORTS_DIR" -name "*.json" -type f | wc -l)
echo "クリーンアップ後のファイル数: $REMAINING_FILES"

echo "CSPレポートファイルのクリーンアップが完了しました"
