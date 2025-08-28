"use client";

import { useEffect, useRef, useState } from 'react';
import { useInView } from 'react-intersection-observer';

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

  return (
    <img
      ref={ref}
      src={inView ? src : ''}
      alt={alt}
      width={width}
      height={height}
      className={className}
      loading="lazy"
      onLoad={(e) => {
        if (e.currentTarget.src) {
          e.currentTarget.style.opacity = '1';
        }
      }}
      style={{ opacity: 0, transition: 'opacity 0.3s ease-in-out' }}
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

  return (
    <div
      ref={containerRef}
      style={{ height: containerHeight, overflow: 'auto' }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div style={{ transform: `translateY(${offsetY}px)` }}>
          {visibleItems.map((item, index) => (
            <div key={startIndex + index} style={{ height: itemHeight }}>
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
