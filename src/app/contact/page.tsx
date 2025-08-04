'use client';

import React, { useState } from 'react';
import { Mail, Send, MessageCircle } from 'lucide-react';
import Button from '@/components/common/Button';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        alert('メッセージを送信しました。ありがとうございます！');
        setFormData({
          name: '',
          email: '',
          subject: '',
          message: '',
        });
      } else {
        alert(result.error || '送信中にエラーが発生しました。もう一度お試しください。');
      }
    } catch (error) {
      console.error('送信エラー:', error);
      alert('送信中にエラーが発生しました。もう一度お試しください。');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      {/* ページヘッダー */}
      <section className="page-header">
        <div className="container-custom">
          <h1 className="page-title">お問い合わせ</h1>
          <p className="page-subtitle">
            ご質問、ご感想、ご提案など、お気軽にお声がけください。
          </p>
        </div>
      </section>

      {/* メインコンテンツ */}
      <section className="section-padding">
        <div className="container-custom max-w-2xl">
          <div className="card-base p-8">
            <div className="flex items-center mb-6">
              <MessageCircle className="mr-3 text-primary" size={24} />
              <h2 className="text-2xl font-semibold">メッセージを送る</h2>
            </div>
            
            <p className="text-gray-600 mb-8 leading-relaxed">
              記事へのご感想、サイトへのご意見、ご質問など、どんなことでもお気軽にお聞かせください。
              いただいたメッセージには、必ずお返事いたします。
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="form-group">
                <label htmlFor="name" className="form-label">
                  お名前 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="form-input"
                  required
                  placeholder="山田太郎"
                />
              </div>

              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  メールアドレス <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="form-input"
                  required
                  placeholder="example@email.com"
                />
              </div>

              <div className="form-group">
                <label htmlFor="subject" className="form-label">
                  件名
                </label>
                <select
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="form-input"
                >
                  <option value="">件名を選択してください</option>
                  <option value="記事への感想">記事への感想</option>
                  <option value="サイトについて">サイトについて</option>
                  <option value="ご質問">ご質問</option>
                  <option value="ご提案">ご提案</option>
                  <option value="その他">その他</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="message" className="form-label">
                  メッセージ <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  className="form-textarea"
                  required
                  placeholder="ご質問やご感想をお聞かせください..."
                  rows={6}
                />
              </div>

              <div className="text-center">
                <Button
                  type="submit"
                  variant="primary"
                  disabled={isSubmitting}
                  className="flex items-center space-x-2"
                >
                  {isSubmitting ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Send size={16} />
                  )}
                  <span>{isSubmitting ? '送信中...' : 'メッセージを送信'}</span>
                </Button>
              </div>
            </form>
          </div>

          {/* 補足情報 */}
          <div className="mt-8 card-base p-6">
            <div className="flex items-center mb-4">
              <Mail className="mr-3 text-primary" size={20} />
              <h3 className="text-lg font-semibold">お返事について</h3>
            </div>
            <ul className="text-gray-600 space-y-2 text-sm">
              <li>• いただいたメッセージには、通常2-3日以内にお返事いたします</li>
              <li>• ご質問の内容によっては、お返事にお時間をいただく場合があります</li>
              <li>• プライベートなご相談も、お気軽にどうぞ</li>
              <li>• メッセージの内容は、プライバシーを厳守いたします</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}