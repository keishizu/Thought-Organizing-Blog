'use client';

import { createContext, useContext, ReactNode } from 'react';
import type { JSX } from 'react';

interface NonceContextType {
  nonce: string | null;
}

const NonceContext = createContext<NonceContextType>({
  nonce: null,
});

interface NonceProviderProps {
  nonce: string | null;
  children: ReactNode;
}

export function NonceProvider({ nonce, children }: NonceProviderProps) {
  return (
    <NonceContext.Provider value={{ nonce }}>
      {children}
    </NonceContext.Provider>
  );
}

export function useNonce(): string | null {
  const context = useContext(NonceContext);
  if (context === undefined) {
    throw new Error('useNonce must be used within a NonceProvider');
  }
  return context.nonce;
}

// nonce付きのstyleタグを作成するヘルパー関数
export function createNonceStyle(css: string, nonce: string | null): JSX.Element {
  return (
    <style
      nonce={nonce || undefined}
      dangerouslySetInnerHTML={{ __html: css }}
    />
  );
}

// nonce付きのscriptタグを作成するヘルパー関数
export function createNonceScript(js: string, nonce: string | null): JSX.Element {
  return (
    <script
      nonce={nonce || undefined}
      dangerouslySetInnerHTML={{ __html: js }}
    />
  );
}
