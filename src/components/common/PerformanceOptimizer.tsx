"use client";

import React, { useEffect, useRef, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { useComponentCSSRule } from '@/lib/css-rule-manager';

interface LazyImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  priority?: boolean;
}

export function LazyImage({ src, alt, width, height, className, priority = false }: LazyImageProps) {
  const { ref, inView } = useInView({
    triggerOnce: true,
    rootMargin: '50px 0px',
  });
  
  // React.useId()を使用してSSR対応のIDを生成
  const reactId = React.useId();
  const imageId = `lazy-image-${reactId.replace(/:/g, '-')}`;

  const css = `
    [data-lazy-image-id="${imageId}"] {
      opacity: 0;
      transition: opacity 0.3s ease-in-out;
    }
    [data-lazy-image-id="${imageId}"].loaded {
      opacity: 1;
    }
  `;

  // CSSルール管理システムを使用
  useComponentCSSRule(`lazy-image-${imageId}`, css);

  if (priority) {
    return (
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={className}
        loading="eager"
      />
    );
  }

  if (!inView) {
    // 画像がビューに入る前はプレースホルダーを表示
    return (
      <div
        ref={ref}
        className={`${className} bg-gray-200 flex items-center justify-center`}
        style={{ width, height }}
        data-lazy-image-id={imageId}
      >
        <span className="text-gray-400 text-sm">Loading...</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      loading="lazy"
      data-lazy-image-id={imageId}
      onLoad={(e) => {
        if (e.currentTarget.src) {
          e.currentTarget.classList.add('loaded');
        }
      }}
    />
  );
}

interface VirtualizedListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
}

export function VirtualizedList<T>({ 
  items, 
  renderItem, 
  itemHeight, 
  containerHeight, 
  overscan = 5 
}: VirtualizedListProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // React.useId()を使用してSSR対応のIDを生成
  const reactId = React.useId();
  const listId = `virtualized-list-${reactId.replace(/:/g, '-')}`;

  const totalHeight = items.length * itemHeight;
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    items.length - 1,
    Math.floor((scrollTop + containerHeight) / itemHeight) + overscan
  );

  const visibleItems = items.slice(startIndex, endIndex + 1);
  const offsetY = startIndex * itemHeight;

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  };

  const css = `
    [data-virtualized-list-id="${listId}"] {
      height: ${containerHeight}px;
      overflow: auto;
    }
    [data-virtualized-list-id="${listId}"] .virtualized-container {
      height: ${totalHeight}px;
      position: relative;
    }
    [data-virtualized-list-id="${listId}"] .virtualized-items {
      transform: translateY(${offsetY}px);
    }
    [data-virtualized-list-id="${listId}"] .virtualized-item {
      height: ${itemHeight}px;
    }
  `;

  // CSSルール管理システムを使用
  useComponentCSSRule(`virtualized-list-${listId}`, css);

  return (
    <div
      ref={containerRef}
      data-virtualized-list-id={listId}
      onScroll={handleScroll}
    >
      <div className="virtualized-container">
        <div className="virtualized-items">
          {visibleItems.map((item, index) => (
            <div key={startIndex + index} className="virtualized-item">
              {renderItem(item, startIndex + index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

interface DebouncedInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  delay?: number;
}

export function DebouncedInput({ 
  value, 
  onChange, 
  placeholder, 
  className, 
  delay = 300 
}: DebouncedInputProps) {
  const [inputValue, setInputValue] = useState(value);
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      onChange(inputValue);
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [inputValue, onChange, delay]);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  return (
    <input
      type="text"
      value={inputValue}
      onChange={(e) => setInputValue(e.target.value)}
      placeholder={placeholder}
      className={className}
    />
  );
}

interface MemoizedComponentProps {
  children: React.ReactNode;
  dependencies: any[];
}

export function MemoizedComponent({ children, dependencies }: MemoizedComponentProps) {
  const memoizedChildren = useRef(children);
  
  useEffect(() => {
    memoizedChildren.current = children;
  }, dependencies);

  return <>{memoizedChildren.current}</>;
}
