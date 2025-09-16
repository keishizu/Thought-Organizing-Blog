#!/usr/bin/env node

/**
 * 自動Lighthouseテストスクリプト
 * CI/CDパイプラインやcronジョブで使用
 */

const fs = require('fs')
const path = require('path')

// 設定
const CONFIG = {
  // テスト対象URL（環境に応じて変更）
  baseUrl: process.env.LIGHTHOUSE_BASE_URL || 'http://localhost:3000',
  
  // テスト対象ページ
  pages: [
    { name: 'home', path: '/', critical: true },
    { name: 'posts', path: '/posts', critical: true },
    { name: 'about', path: '/about', critical: true },
    { name: 'csp-test', path: '/csp-test', critical: false },
  ],
  
  // パフォーマンス閾値
  thresholds: {
    performance: 90,
    accessibility: 95,
    bestPractices: 90,
    seo: 90,
  },
  
  // レポート出力設定
  outputDir: './lighthouse-reports',
  
  // Chrome起動オプション
  chromeFlags: [
    '--headless',
    '--no-sandbox',
    '--disable-dev-shm-usage',
    '--disable-gpu',
  ]
}

/**
 * Lighthouseテストの実行
 */
async function runLighthouseAudit(url, pageName) {
  console.log(`🔍 Running Lighthouse audit for: ${pageName} (${url})`)
  
  let chrome
  try {
    // Chrome起動（ESM: 動的インポートで対応）
    const { default: chromeLauncher } = await import('chrome-launcher')
    chrome = await chromeLauncher.launch({
      chromeFlags: CONFIG.chromeFlags
    })

    // Lighthouse設定
    const options = {
      logLevel: 'info',
      output: ['html', 'json'],
      onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
      port: chrome.port,
    }

    // Lighthouse実行（ESM: 動的インポートで対応）
    const { default: lighthouse } = await import('lighthouse')
    const runnerResult = await lighthouse(url, options)

    if (!runnerResult) {
      throw new Error('Lighthouse audit failed - no results returned')
    }

    // スコア取得
    const { lhr } = runnerResult
    const scores = {
      performance: Math.round(lhr.categories.performance.score * 100),
      accessibility: Math.round(lhr.categories.accessibility.score * 100),
      bestPractices: Math.round(lhr.categories['best-practices'].score * 100),
      seo: Math.round(lhr.categories.seo.score * 100),
    }

    // レポート保存
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const reportDir = path.join(CONFIG.outputDir, `${pageName}-${timestamp}`)
    
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true })
    }

    // HTMLレポート保存
    const htmlReport = runnerResult.report[0]
    const htmlPath = path.join(reportDir, 'report.html')
    fs.writeFileSync(htmlPath, htmlReport)

    // JSONレポート保存
    const jsonReport = runnerResult.report[1]
    const jsonPath = path.join(reportDir, 'report.json')
    fs.writeFileSync(jsonPath, jsonReport)

    // サマリー保存
    const summary = {
      url,
      pageName,
      timestamp: new Date().toISOString(),
      scores,
      thresholds: CONFIG.thresholds,
      passed: checkThresholds(scores),
      coreWebVitals: extractCoreWebVitals(lhr),
      reportPaths: {
        html: htmlPath,
        json: jsonPath,
      }
    }

    const summaryPath = path.join(reportDir, 'summary.json')
    fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2))

    console.log(`✅ Audit completed for ${pageName}:`)
    console.log(`   Performance: ${scores.performance}/100`)
    console.log(`   Accessibility: ${scores.accessibility}/100`)
    console.log(`   Best Practices: ${scores.bestPractices}/100`)
    console.log(`   SEO: ${scores.seo}/100`)
    console.log(`   Report saved to: ${reportDir}`)

    return summary

  } catch (error) {
    console.error(`❌ Lighthouse audit failed for ${pageName}:`, error.message)
    throw error
  } finally {
    if (chrome) {
      await chrome.kill()
    }
  }
}

/**
 * 閾値チェック
 */
function checkThresholds(scores) {
  const results = {}
  Object.entries(CONFIG.thresholds).forEach(([category, threshold]) => {
    results[category] = scores[category] >= threshold
  })
  return results
}

/**
 * Core Web Vitalsの抽出
 */
function extractCoreWebVitals(lhr) {
  const audits = lhr.audits
  return {
    lcp: audits['largest-contentful-paint']?.numericValue || null,
    fid: audits['max-potential-fid']?.numericValue || null, // FIDの代替
    cls: audits['cumulative-layout-shift']?.numericValue || null,
    fcp: audits['first-contentful-paint']?.numericValue || null,
    ttfb: audits['server-response-time']?.numericValue || null,
  }
}

/**
 * 全体サマリーの生成
 */
function generateOverallSummary(results) {
  const summary = {
    timestamp: new Date().toISOString(),
    totalPages: results.length,
    passedPages: results.filter(r => Object.values(r.passed).every(p => p)).length,
    failedPages: results.filter(r => !Object.values(r.passed).every(p => p)).length,
    averageScores: {},
    criticalFailures: [],
    results: results.map(r => ({
      pageName: r.pageName,
      url: r.url,
      scores: r.scores,
      passed: r.passed,
      reportPath: r.reportPaths.html,
    }))
  }

  // 平均スコア計算
  const categories = ['performance', 'accessibility', 'bestPractices', 'seo']
  categories.forEach(category => {
    const scores = results.map(r => r.scores[category]).filter(s => s !== null)
    summary.averageScores[category] = scores.length > 0 
      ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length)
      : 0
  })

  // 重要なページでの失敗をチェック
  results.forEach(result => {
    const page = CONFIG.pages.find(p => p.name === result.pageName)
    if (page?.critical && !Object.values(result.passed).every(p => p)) {
      summary.criticalFailures.push({
        pageName: result.pageName,
        url: result.url,
        failedCategories: Object.entries(result.passed)
          .filter(([_, passed]) => !passed)
          .map(([category, _]) => category)
      })
    }
  })

  return summary
}

/**
 * メイン実行関数
 */
async function main() {
  console.log('🚀 Starting Lighthouse audit suite...')
  console.log(`Base URL: ${CONFIG.baseUrl}`)
  console.log(`Pages to test: ${CONFIG.pages.length}`)

  // 出力ディレクトリ作成
  if (!fs.existsSync(CONFIG.outputDir)) {
    fs.mkdirSync(CONFIG.outputDir, { recursive: true })
  }

  const results = []
  let hasErrors = false

  // 各ページをテスト
  for (const page of CONFIG.pages) {
    try {
      const url = `${CONFIG.baseUrl}${page.path}`
      const result = await runLighthouseAudit(url, page.name)
      results.push(result)

      // 重要なページでの失敗をチェック
      if (page.critical && !Object.values(result.passed).every(p => p)) {
        console.error(`❌ Critical page ${page.name} failed threshold checks`)
        hasErrors = true
      }
    } catch (error) {
      console.error(`❌ Failed to audit ${page.name}:`, error.message)
      if (page.critical) {
        hasErrors = true
      }
    }
  }

  // 全体サマリー生成
  const overallSummary = generateOverallSummary(results)
  const summaryPath = path.join(CONFIG.outputDir, 'overall-summary.json')
  fs.writeFileSync(summaryPath, JSON.stringify(overallSummary, null, 2))

  // 結果出力
  console.log('\n📊 Lighthouse Audit Summary:')
  console.log(`   Total Pages: ${overallSummary.totalPages}`)
  console.log(`   Passed: ${overallSummary.passedPages}`)
  console.log(`   Failed: ${overallSummary.failedPages}`)
  console.log(`   Average Performance: ${overallSummary.averageScores.performance}/100`)
  console.log(`   Average Accessibility: ${overallSummary.averageScores.accessibility}/100`)
  console.log(`   Average Best Practices: ${overallSummary.averageScores.bestPractices}/100`)
  console.log(`   Average SEO: ${overallSummary.averageScores.seo}/100`)

  if (overallSummary.criticalFailures.length > 0) {
    console.log('\n🚨 Critical Failures:')
    overallSummary.criticalFailures.forEach(failure => {
      console.log(`   ${failure.pageName}: ${failure.failedCategories.join(', ')}`)
    })
  }

  console.log(`\n📁 Reports saved to: ${CONFIG.outputDir}`)

  // 終了コード設定
  if (hasErrors) {
    console.log('\n❌ Audit completed with errors')
    process.exit(1)
  } else {
    console.log('\n✅ All audits passed')
    process.exit(0)
  }
}

// スクリプト実行
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Lighthouse audit suite failed:', error)
    process.exit(1)
  })
}

module.exports = {
  runLighthouseAudit,
  CONFIG
}
