/**
 * 文字数から読了時間を計算するユーティリティ関数
 */

// 日本語の読了速度（1分あたりの文字数）
const JAPANESE_READING_SPEED = 400; // 1分あたり約400文字

// 英語の読了速度（1分あたりの単語数）
const ENGLISH_READING_SPEED = 200; // 1分あたり約200単語

/**
 * HTMLコンテンツからテキストのみを抽出する
 * @param htmlContent HTMLコンテンツ
 * @returns テキストのみの文字列
 */
export function extractTextFromHTML(htmlContent: string): string {
  if (!htmlContent) return '';
  
  // HTMLタグを除去
  const textContent = htmlContent.replace(/<[^>]*>/g, '');
  
  // 改行文字をスペースに変換
  const normalizedText = textContent.replace(/\n/g, ' ');
  
  // 連続するスペースを単一のスペースに変換
  const cleanedText = normalizedText.replace(/\s+/g, ' ');
  
  return cleanedText.trim();
}

/**
 * 文字数から読了時間を計算する
 * @param text テキスト内容
 * @returns 読了時間の文字列（例：「約3分」）
 */
export function calculateReadTime(text: string): string {
  if (!text) return '約1分';
  
  // 文字数をカウント（スペースと改行を除く）
  const characterCount = text.replace(/\s/g, '').length;
  
  // 日本語と英語の比率を推定
  const japaneseRatio = (text.match(/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/g) || []).length / characterCount;
  const englishRatio = 1 - japaneseRatio;
  
  // 日本語と英語の読了時間を計算
  const japaneseTime = (characterCount * japaneseRatio) / JAPANESE_READING_SPEED;
  const englishTime = (characterCount * englishRatio) / ENGLISH_READING_SPEED;
  
  // 合計読了時間（分）
  const totalTimeInMinutes = japaneseTime + englishTime;
  
  // 最小1分、最大60分で制限
  const clampedTime = Math.max(1, Math.min(60, Math.ceil(totalTimeInMinutes)));
  
  return `約${clampedTime}分`;
}

/**
 * HTMLコンテンツから直接読了時間を計算する
 * @param htmlContent HTMLコンテンツ
 * @returns 読了時間の文字列
 */
export function calculateReadTimeFromHTML(htmlContent: string): string {
  const textContent = extractTextFromHTML(htmlContent);
  return calculateReadTime(textContent);
}

/**
 * 複数のテキストを結合して読了時間を計算する
 * @param texts テキストの配列
 * @returns 読了時間の文字列
 */
export function calculateReadTimeFromMultipleTexts(texts: string[]): string {
  const combinedText = texts.filter(Boolean).join(' ');
  return calculateReadTime(combinedText);
}
