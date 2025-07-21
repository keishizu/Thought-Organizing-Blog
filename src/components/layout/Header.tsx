'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, Book, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const navItems = [
    { name: 'ホーム', href: '/' },
    { name: '記事一覧', href: '/articles' },
    { name: 'About', href: '/about' },
    { name: 'お問い合わせ', href: '/contact' },
  ];

  const categoryItems = [
    { name: '思考と行動', href: '/categories/thinking-action' },
    { name: 'キャリアと選択', href: '/categories/career-choice' },
    { name: '気づきと日常', href: '/categories/insights-daily' },
  ];

  return (
    <header className={`nav-header ${scrolled ? 'shadow-md' : ''}`}>
      <div className="nav-container">
        <div className="flex items-center">
          <Link href="/" className="nav-logo flex items-center space-x-2">
            <Book size={24} />
            <span>静かな図書室</span>
          </Link>
        </div>

        {/* デスクトップナビゲーション */}
        <nav className="nav-menu">
          {/* ホーム */}
          <Link href="/" className="nav-link">
            ホーム
          </Link>
          
          {/* カテゴリードロップダウン */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="nav-link flex items-center space-x-1 group">
                <span>カテゴリー</span>
                <ChevronDown size={16} className="transition-transform duration-200 group-data-[state=open]:rotate-180" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="nav-dropdown w-48">
              {categoryItems.map((item) => (
                <DropdownMenuItem key={item.name} asChild>
                  <Link href={item.href} className="nav-dropdown-item">
                    {item.name}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          
          {/* その他のナビゲーション項目 */}
          {navItems.slice(1).map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="nav-link"
            >
              {item.name}
            </Link>
          ))}
        </nav>

        {/* モバイルメニューボタン */}
        <button
          className="md:hidden p-2"
          onClick={toggleMenu}
          aria-label="メニューを開く"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* モバイルナビゲーション */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <nav className="container-custom py-4">
            {/* ホーム */}
            <Link
              href="/"
              className="block py-3 nav-link"
              onClick={() => setIsMenuOpen(false)}
            >
              ホーム
            </Link>
            
            {/* モバイルカテゴリー */}
            <div className="border-t border-gray-100 mt-4 pt-4">
              <div className="text-sm font-medium text-gray-500 mb-2 px-4">カテゴリー</div>
              {categoryItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="block py-3 nav-link px-4"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
            </div>
            
            {/* その他のナビゲーション項目 */}
            {navItems.slice(1).map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="block py-3 nav-link"
                onClick={() => setIsMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}