// 画像最適化ユーティリティ

export interface ImageOptimizationOptions {
  quality?: number;
  format?: 'webp' | 'avif' | 'jpeg' | 'png';
  width?: number;
  height?: number;
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
  placeholder?: 'blur' | 'dominant' | 'none';
}

export interface OptimizedImage {
  src: string;
  srcSet: string;
  sizes: string;
  placeholder?: string;
  width: number;
  height: number;
  alt: string;
}

// 画像の遅延読み込み属性を生成
export function generateLazyLoadingAttributes(
  src: string,
  options: ImageOptimizationOptions = {}
): Record<string, string> {
  const attrs: Record<string, string> = {
    loading: 'lazy',
    decoding: 'async',
  };

  if (options.placeholder === 'blur') {
    attrs['data-src'] = src;
    attrs['src'] = generatePlaceholder(src);
  } else {
    attrs['data-src'] = src;
  }

  return attrs;
}

// プレースホルダー画像の生成
export function generatePlaceholder(src: string): string {
  // 実際の実装では、画像の低解像度版やSVGプレースホルダーを生成
  // ここでは簡易的なデータURIを返す
  return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2YzZjRmNiIvPjx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEyIiBmaWxsPSIjOTNhMGE0IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+TG9hZGluZy4uLjwvdGV4dD48L3N2Zz4=';
}

// 画像のサイズ最適化
export function optimizeImageSize(
  originalWidth: number,
  originalHeight: number,
  maxWidth: number,
  maxHeight: number
): { width: number; height: number } {
  const aspectRatio = originalWidth / originalHeight;
  
  let width = originalWidth;
  let height = originalHeight;

  if (width > maxWidth) {
    width = maxWidth;
    height = width / aspectRatio;
  }

  if (height > maxHeight) {
    height = maxHeight;
    width = height * aspectRatio;
  }

  return { width: Math.round(width), height: Math.round(height) };
}

// レスポンシブ画像のsrcSetを生成
export function generateSrcSet(
  src: string,
  widths: number[],
  options: ImageOptimizationOptions = {}
): string {
  return widths
    .map(width => {
      const optimizedSize = optimizeImageSize(
        options.width || 800,
        options.height || 600,
        width,
        width
      );
      
      // 実際の実装では、画像のリサイズ処理を行う
      const optimizedSrc = `${src}?w=${optimizedSize.width}&h=${optimizedSize.height}&q=${options.quality || 80}`;
      
      return `${optimizedSrc} ${width}w`;
    })
    .join(', ');
}

// 画像のsizes属性を生成
export function generateSizes(breakpoints: Record<string, number>): string {
  return Object.entries(breakpoints)
    .map(([media, width]) => {
      if (media === 'default') {
        return `${width}px`;
      }
      return `(${media}) ${width}px`;
    })
    .join(', ');
}

// 画像の最適化設定を生成
export function generateImageOptimizationConfig(
  src: string,
  alt: string,
  originalWidth: number,
  originalHeight: number,
  options: ImageOptimizationOptions = {}
): OptimizedImage {
  const maxWidth = options.width || 1200;
  const maxHeight = options.height || 800;
  
  const { width, height } = optimizeImageSize(
    originalWidth,
    originalHeight,
    maxWidth,
    maxHeight
  );

  const responsiveWidths = [320, 640, 768, 1024, 1280, 1920];
  const srcSet = generateSrcSet(src, responsiveWidths, options);
  
  const sizes = generateSizes({
    'max-width: 640px': 320,
    'max-width: 768px': 640,
    'max-width: 1024px': 768,
    'max-width: 1280px': 1024,
    'max-width: 1920px': 1280,
    'default': 1920,
  });

  return {
    src,
    srcSet,
    sizes,
    placeholder: options.placeholder === 'blur' ? generatePlaceholder(src) : undefined,
    width,
    height,
    alt,
  };
}

// 画像のプリロード設定
export function generatePreloadLinks(images: OptimizedImage[]): string[] {
  return images
    .filter(img => img.placeholder === 'blur') // プレースホルダーがある画像のみ
    .map(img => `<link rel="preload" as="image" href="${img.src}">`);
}

// 画像の遅延読み込み最適化
export function optimizeImageLoading() {
  if (typeof window === 'undefined') return;

  const images = document.querySelectorAll('img[data-src]');
  
  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const img = entry.target as HTMLImageElement;
        const src = img.dataset.src;
        
        if (src) {
          img.src = src;
          img.classList.remove('lazy');
          imageObserver.unobserve(img);
        }
      }
    });
  }, {
    rootMargin: '50px 0px',
    threshold: 0.1,
  });

  images.forEach((img) => {
    img.classList.add('lazy');
    imageObserver.observe(img);
  });
}

// 画像のエラーハンドリング
export function handleImageError(
  img: HTMLImageElement,
  fallbackSrc?: string
): void {
  if (fallbackSrc) {
    img.src = fallbackSrc;
  } else {
    img.style.display = 'none';
  }
  
  img.classList.add('image-error');
}

// 画像の読み込み完了イベント
export function onImageLoad(
  img: HTMLImageElement,
  callback?: () => void
): void {
  if (img.complete) {
    callback?.();
  } else {
    img.addEventListener('load', callback || (() => {}), { once: true });
  }
}

// 画像の最適化設定を適用
export function applyImageOptimization(
  img: HTMLImageElement,
  options: ImageOptimizationOptions = {}
): void {
  // 遅延読み込み
  if (options.placeholder !== 'none') {
    img.loading = 'lazy';
    img.decoding = 'async';
  }

  // エラーハンドリング
  img.addEventListener('error', () => {
    handleImageError(img);
  });

  // 読み込み完了
  onImageLoad(img, () => {
    img.classList.add('image-loaded');
  });
}
