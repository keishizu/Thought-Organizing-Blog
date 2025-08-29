import type { Metadata } from 'next';
import { Shield, Eye, Database, Lock, Mail, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'プライバシーポリシー - 思整図書館',
  description: '思整図書館のプライバシーポリシーです。当サイトでの個人情報の取り扱いについて説明しています。',
};

export default function PrivacyPage() {
  return (
    <div>
      {/* ページヘッダー */}
      <section className="page-header">
        <div className="container-custom">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <Shield size={24} className="text-primary" />
            </div>
            <div>
              <h1 className="page-title">プライバシーポリシー</h1>
              <p className="page-subtitle">
                個人情報の取り扱いについて
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 戻るボタン */}
      <div className="container-custom py-4">
        <Link href="/" className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors">
          <ArrowLeft size={20} className="mr-2" />
          ホームに戻る
        </Link>
      </div>

      {/* プライバシーポリシー内容 */}
      <section className="section-padding">
        <div className="container-custom max-w-4xl">
          <div className="card-base p-8">
            <div className="prose prose-gray max-w-none">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 font-secondary">
                  1. 基本方針
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  思整図書館（以下「当サイト」）は、お客様の個人情報の重要性を認識し、個人情報の保護に関する法律（個人情報保護法）を遵守し、適切な収集、利用、管理を行います。
                </p>
              </div>

              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 font-secondary">
                  2. 収集する個人情報
                </h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">アクセスログ情報</h3>
                    <p className="text-gray-700 leading-relaxed">
                      当サイトでは、Google Analyticsを使用してアクセス解析を行っています。これにより収集される情報には、IPアドレス、ブラウザの種類、アクセス日時、閲覧ページなどが含まれます。
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">お問い合わせ情報</h3>
                    <p className="text-gray-700 leading-relaxed">
                      お問い合わせフォームから送信される情報（お名前、メールアドレス、お問い合わせ内容）を収集します。
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">コメント情報</h3>
                    <p className="text-gray-700 leading-relaxed">
                      図書へのコメント機能を利用する際に、コメント内容とお名前（任意）を収集します。
                    </p>
                  </div>
                </div>
              </div>

              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 font-secondary">
                  3. 個人情報の利用目的
                </h2>
                <ul className="list-disc list-inside space-y-2 text-gray-700 leading-relaxed">
                  <li>当サイトの運営・改善のため</li>
                  <li>お問い合わせへの対応のため</li>
                  <li>コメント機能の提供のため</li>
                  <li>アクセス解析によるサイト改善のため</li>
                  <li>法令に基づく対応のため</li>
                </ul>
              </div>

              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 font-secondary">
                  4. 個人情報の第三者提供
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  当サイトでは、以下の場合を除き、個人情報を第三者に提供いたしません。
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 leading-relaxed">
                  <li>お客様の同意がある場合</li>
                  <li>法令に基づき開示することが必要である場合</li>
                  <li>人の生命、身体または財産の保護のために必要な場合</li>
                </ul>
              </div>

              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 font-secondary">
                  5. アクセス解析ツールについて
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  当サイトでは、Google Analyticsを使用してアクセス解析を行っています。Google Analyticsはトラフィックデータの収集のためにCookieを使用しています。このトラフィックデータは匿名で収集されており、個人を特定するものではありません。
                </p>
              </div>

              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 font-secondary">
                  6. プライバシーポリシーの変更
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  当サイトは、必要に応じてこのプライバシーポリシーを予告無く内容を変更することがあります。予めご了承ください。
                </p>
              </div>

              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'var(--font-secondary)' }}>
                  7. 免責事項
                </h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">コンテンツについて</h3>
                    <p className="text-gray-700 leading-relaxed">
                      当サイトに掲載されている図書やコンテンツは、筆者の個人的な経験や考えに基づいて作成されています。これらの内容は一般的な情報提供を目的としており、特定の結果を保証するものではありません。
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">アフィリエイトリンクについて</h3>
                    <p className="text-gray-700 leading-relaxed">
                      当サイトでは、一部の図書にアフィリエイトリンクが含まれている場合があります。商品やサービスの選択は、お客様ご自身の判断でお願いいたします。
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">外部リンクについて</h3>
                    <p className="text-gray-700 leading-relaxed">
                      当サイトからリンクしている外部サイトについては、当サイトが管理しているものではありません。外部サイトの内容やプライバシーポリシーについては、各サイトの責任において管理されています。
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">技術的な問題について</h3>
                    <p className="text-gray-700 leading-relaxed">
                      当サイトの利用により生じた技術的な問題、データの損失、またはその他の損害について、当サイトは責任を負いかねます。サイトの利用は、お客様の自己責任でお願いいたします。
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">情報の正確性について</h3>
                    <p className="text-gray-700 leading-relaxed">
                      当サイトに掲載されている情報は、掲載時点での情報であり、時間の経過により内容が変更されている可能性があります。最新の情報については、各提供元の公式サイト等でご確認ください。
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  制定日: 2024年8月1日<br />
                  最終更新日: 2024年8月1日
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
} 