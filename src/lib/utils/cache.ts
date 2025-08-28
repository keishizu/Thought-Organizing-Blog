// キャッシュ戦略ユーティリティ

interface CacheOptions {
  maxAge?: number; // 秒
  staleWhileRevalidate?: number; // 秒
  maxItems?: number;
}

interface CacheItem<T> {
  data: T;
  timestamp: number;
  maxAge: number;
  staleWhileRevalidate: number;
}

class MemoryCache<T> {
  private cache = new Map<string, CacheItem<T>>();
  private maxItems: number;

  constructor(options: CacheOptions = {}) {
    this.maxItems = options.maxItems || 100;
  }

  set(key: string, data: T, options: CacheOptions = {}): void {
    const now = Date.now();
    const maxAge = (options.maxAge || 300) * 1000; // デフォルト5分
    const staleWhileRevalidate = (options.staleWhileRevalidate || 60) * 1000; // デフォルト1分

    // キャッシュサイズ制限
    if (this.cache.size >= this.maxItems) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }

    this.cache.set(key, {
      data,
      timestamp: now,
      maxAge,
      staleWhileRevalidate,
    });
  }

  get(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;

    const now = Date.now();
    const age = now - item.timestamp;

    // 有効期限切れ
    if (age > item.maxAge + item.staleWhileRevalidate) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  isStale(key: string): boolean {
    const item = this.cache.get(key);
    if (!item) return true;

    const now = Date.now();
    const age = now - item.timestamp;

    return age > item.maxAge;
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}

// グローバルキャッシュインスタンス
const globalCache = new MemoryCache();

// ローカルストレージベースのキャッシュ
export class LocalStorageCache<T> {
  private prefix: string;

  constructor(prefix: string = 'app_cache') {
    this.prefix = prefix;
  }

  set(key: string, data: T, maxAge: number = 300): void {
    if (typeof window === 'undefined') return;

    const item = {
      data,
      timestamp: Date.now(),
      maxAge: maxAge * 1000,
    };

    try {
      localStorage.setItem(`${this.prefix}:${key}`, JSON.stringify(item));
    } catch (error) {
      console.warn('LocalStorage cache set failed:', error);
    }
  }

  get(key: string): T | null {
    if (typeof window === 'undefined') return null;

    try {
      const stored = localStorage.getItem(`${this.prefix}:${key}`);
      if (!stored) return null;

      const item = JSON.parse(stored);
      const now = Date.now();

      if (now - item.timestamp > item.maxAge) {
        this.delete(key);
        return null;
      }

      return item.data;
    } catch (error) {
      console.warn('LocalStorage cache get failed:', error);
      return null;
    }
  }

  delete(key: string): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.removeItem(`${this.prefix}:${key}`);
    } catch (error) {
      console.warn('LocalStorage cache delete failed:', error);
    }
  }

  clear(): void {
    if (typeof window === 'undefined') return;

    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(this.prefix)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.warn('LocalStorage cache clear failed:', error);
    }
  }
}

// HTTP キャッシュヘッダーの生成
export function generateCacheHeaders(options: CacheOptions = {}): Record<string, string> {
  const maxAge = options.maxAge || 300;
  const staleWhileRevalidate = options.staleWhileRevalidate || 60;

  return {
    'Cache-Control': `public, max-age=${maxAge}, stale-while-revalidate=${staleWhileRevalidate}`,
    'Expires': new Date(Date.now() + maxAge * 1000).toUTCString(),
  };
}

// ETag の生成
export function generateETag(data: string | Buffer): string {
  if (typeof data === 'string') {
    return `"${Buffer.from(data).toString('base64').slice(0, 8)}"`;
  }
  return `"${data.toString('base64').slice(0, 8)}"`;
}

// 条件付きリクエストの処理
export function handleConditionalRequest(
  etag: string,
  ifNoneMatch?: string,
  ifModifiedSince?: string,
  lastModified?: Date
): { shouldReturn304: boolean; headers: Record<string, string> } {
  const headers: Record<string, string> = {
    'ETag': etag,
  };

  if (lastModified) {
    headers['Last-Modified'] = lastModified.toUTCString();
  }

  // ETag の比較
  if (ifNoneMatch && ifNoneMatch === etag) {
    return { shouldReturn304: true, headers };
  }

  // Last-Modified の比較
  if (ifModifiedSince && lastModified) {
    const ifModifiedSinceDate = new Date(ifModifiedSince);
    if (lastModified <= ifModifiedSinceDate) {
      return { shouldReturn304: true, headers };
    }
  }

  return { shouldReturn304: false, headers };
}

// キャッシュキーの生成
export function generateCacheKey(...parts: (string | number | boolean)[]): string {
  return parts.map(part => String(part)).join(':');
}

// メモリキャッシュのエクスポート
export { globalCache, MemoryCache };

// キャッシュ統計の取得
export function getCacheStats() {
  return {
    memoryCacheSize: globalCache.size(),
    localStorageAvailable: typeof window !== 'undefined' && 'localStorage' in window,
  };
}
