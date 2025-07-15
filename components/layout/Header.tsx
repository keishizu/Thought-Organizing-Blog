'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, Book } from 'lucide-react';

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
    { name: 'About', href: '/about' },
    { name: '思考と行動', href: '/categories/thinking-action' },
    { name: 'キャリアと選択', href: '/categories/career-choice' },
    { name: '気づきと日常', href: '/categories/insights-daily' },
    { name: 'お問い合わせ', href: '/contact' },
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
          {navItems.map((item) => (
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
            {navItems.map((item) => (
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