'use client';

import React from 'react';
import { useNonce } from '@/components/common/NonceProvider';

interface CSSRule {
  id: string;
  css: string;
  priority: number;
}

interface CSSRuleError {
  ruleId: string;
  error: string;
  timestamp: number;
}

class CSSRuleManager {
  private rules: Map<string, CSSRule> = new Map();
  private styleElement: HTMLStyleElement | null = null;
  private nonce: string | null = null;
  private updateTimeout: NodeJS.Timeout | null = null;
  private pendingUpdates: Set<string> = new Set();
  private errors: CSSRuleError[] = [];
  private maxErrors: number = 50;

  constructor() {
    if (typeof window !== 'undefined') {
      this.createStyleElement();
    }
  }

  private createStyleElement() {
    if (this.styleElement) return;

    this.styleElement = document.createElement('style');
    this.styleElement.setAttribute('data-css-rule-manager', 'true');
    document.head.appendChild(this.styleElement);
  }

  setNonce(nonce: string | null) {
    this.nonce = nonce;
    if (this.styleElement && nonce) {
      this.styleElement.setAttribute('nonce', nonce);
    }
  }

  addRule(id: string, css: string, priority: number = 0) {
    try {
      // CSS検証
      if (!this.validateCSS(css)) {
        this.addError(id, 'Invalid CSS syntax');
        return;
      }

      this.rules.set(id, { id, css, priority });
      this.scheduleUpdate(id);
    } catch (error) {
      this.addError(id, `Failed to add rule: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  removeRule(id: string) {
    this.rules.delete(id);
    this.scheduleUpdate(id);
  }

  updateRule(id: string, css: string, priority: number = 0) {
    this.addRule(id, css, priority);
  }

  private scheduleUpdate(ruleId: string) {
    this.pendingUpdates.add(ruleId);
    
    if (this.updateTimeout) {
      clearTimeout(this.updateTimeout);
    }
    
    this.updateTimeout = setTimeout(() => {
      this.flushUpdates();
    }, 0); // 次のイベントループで実行
  }

  private flushUpdates() {
    if (this.pendingUpdates.size === 0) return;
    
    this.updateStyleElement();
    this.pendingUpdates.clear();
    this.updateTimeout = null;
  }

  private validateCSS(css: string): boolean {
    if (!css || typeof css !== 'string') {
      return false;
    }

    // 基本的なCSS構文チェック
    const basicPattern = /^[\s\S]*\{[\s\S]*\}$/;
    if (!basicPattern.test(css.trim())) {
      return false;
    }

    // 危険な文字列のチェック
    const dangerousPatterns = [
      /javascript:/i,
      /expression\s*\(/i,
      /url\s*\(\s*['"]?javascript:/i,
      /@import/i,
      /@charset/i
    ];

    return !dangerousPatterns.some(pattern => pattern.test(css));
  }

  private addError(ruleId: string, error: string) {
    this.errors.push({
      ruleId,
      error,
      timestamp: Date.now()
    });

    // エラー数の上限を超えた場合は古いエラーを削除
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(-this.maxErrors);
    }

    console.warn(`CSS Rule Manager Error [${ruleId}]: ${error}`);
  }

  private updateStyleElement() {
    if (!this.styleElement) return;

    try {
      const sortedRules = Array.from(this.rules.values())
        .sort((a, b) => a.priority - b.priority);

      const css = sortedRules
        .map(rule => `/* ${rule.id} */\n${rule.css}`)
        .join('\n\n');

      this.styleElement.textContent = css;
    } catch (error) {
      this.addError('updateStyleElement', `Failed to update style element: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  clear() {
    this.rules.clear();
    this.pendingUpdates.clear();
    if (this.updateTimeout) {
      clearTimeout(this.updateTimeout);
      this.updateTimeout = null;
    }
    this.updateStyleElement();
  }

  destroy() {
    this.clear();
    if (this.styleElement && this.styleElement.parentNode) {
      this.styleElement.parentNode.removeChild(this.styleElement);
    }
    this.styleElement = null;
  }

  getRuleCount() {
    return this.rules.size;
  }

  getErrors(): CSSRuleError[] {
    return [...this.errors];
  }

  clearErrors() {
    this.errors = [];
  }

  getLastError(): CSSRuleError | null {
    return this.errors.length > 0 ? this.errors[this.errors.length - 1] : null;
  }
}

// シングルトンインスタンス
const cssRuleManager = new CSSRuleManager();

// React Hook for CSS Rule Management
export function useCSSRuleManager() {
  const nonce = useNonce();

  // nonceが変更されたら更新
  React.useEffect(() => {
    cssRuleManager.setNonce(nonce);
  }, [nonce]);

  return {
    addRule: (id: string, css: string, priority: number = 0) => {
      cssRuleManager.addRule(id, css, priority);
    },
    removeRule: (id: string) => {
      cssRuleManager.removeRule(id);
    },
    updateRule: (id: string, css: string, priority: number = 0) => {
      cssRuleManager.updateRule(id, css, priority);
    },
    clear: () => {
      cssRuleManager.clear();
    },
    getRuleCount: () => {
      return cssRuleManager.getRuleCount();
    },
    getErrors: () => {
      return cssRuleManager.getErrors();
    },
    clearErrors: () => {
      cssRuleManager.clearErrors();
    },
    getLastError: () => {
      return cssRuleManager.getLastError();
    }
  };
}

// コンポーネント用のCSSルール管理フック
export function useComponentCSSRule(componentId: string, css: string, priority: number = 0) {
  const { addRule, removeRule, updateRule } = useCSSRuleManager();
  const isMountedRef = React.useRef(true);

  React.useEffect(() => {
    if (!isMountedRef.current) return;
    
    addRule(componentId, css, priority);
    
    return () => {
      isMountedRef.current = false;
      removeRule(componentId);
    };
  }, [componentId, css, priority, addRule, removeRule]);

  // コンポーネントのアンマウント時にクリーンアップ
  React.useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return {
    updateCSS: (newCss: string) => {
      if (isMountedRef.current) {
        updateRule(componentId, newCss, priority);
      }
    }
  };
}

// グローバルクリーンアップ関数
export function cleanupCSSRuleManager() {
  cssRuleManager.destroy();
}

// ページアンロード時のクリーンアップ
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    cleanupCSSRuleManager();
  });
}

export default cssRuleManager;
