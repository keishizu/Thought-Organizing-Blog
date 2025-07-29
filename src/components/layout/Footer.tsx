'use client';

import Link from 'next/link';
import { Book, Mail, Twitter, Github } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    categories: [
      { name: '思考と行動', href: '/categories/thinking-action' },
      { name: 'キャリアと選択', href: '/categories/career-choice' },
      { name: '気づきと日常', href: '/categories/insights-daily' },
    ],
    pages: [
      { name: 'About', href: '/about' },
      { name: 'お問い合わせ', href: '/contact' },
      { name: 'プライバシーポリシー', href: '/privacy' },
      { name: '管理者ページ', href: '/admin' },
    ],
    social: [
      // { name: 'Twitter', href: '#', icon: Twitter },
      // { name: 'GitHub', href: '#', icon: Github },
      { name: 'Email', href: '/contact', icon: Mail },
    ],
  };

  return (
    <footer className="footer-section">
      <div className="footer-content">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* ブランド情報 */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <Book size={24} className="text-primary" />
              <span className="nav-logo">静かな図書室</span>
            </div>
            <p className="text-gray-600 mb-4">
              思考を言葉に、前へ進むヒントを。<br />
              悩みやモヤモヤを整理するための、静かな図書室です。
            </p>
            <div className="flex space-x-4">
              {footerLinks.social.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="footer-link"
                    aria-label={item.name}
                  >
                    <Icon size={20} />
                  </Link>
                );
              })}
            </div>
          </div>

          {/* カテゴリー */}
          <div>
            <h3 className="footer-title">カテゴリー</h3>
            <ul className="space-y-2">
              {footerLinks.categories.map((item) => (
                <li key={item.name}>
                  <Link href={item.href} className="footer-link">
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* その他のページ */}
          <div>
            <h3 className="footer-title">ページ</h3>
            <ul className="space-y-2">
              {footerLinks.pages.map((item) => (
                <li key={item.name}>
                  <Link href={item.href} className="footer-link">
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* コピーライト */}
        <div className="pt-8 border-t border-gray-200 text-center">
          <p className="text-gray-600">
            © {currentYear} 静かな図書室. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}