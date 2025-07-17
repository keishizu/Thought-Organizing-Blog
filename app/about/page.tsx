'use client';

import { User, Heart, BookOpen, Coffee } from 'lucide-react';

export default function AboutPage() {
  return (
    <div>
      {/* ページヘッダー */}
      <section className="page-header">
        <div className="container-custom">
          <h1 className="page-title">About</h1>
          <p className="page-subtitle">
            このサイトを運営している私について、少しお話しさせてください。
          </p>
        </div>
      </section>

      {/* メインコンテンツ */}
      <section className="section-padding">
        <div className="container-custom max-w-4xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* プロフィール画像 */}
            <div className="lg:col-span-1">
              <div className="card-base p-6 text-center">
                <div className="w-32 h-32 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
                  <User size={48} className="text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2">管理者</h3>
                <p className="text-gray-600 text-sm">
                  思考の整理と言葉の力を信じて
                </p>
              </div>
            </div>

            {/* プロフィール内容 */}
            <div className="lg:col-span-2 space-y-8">
              <div>
                <h2 className="text-2xl font-semibold mb-4 flex items-center">
                  <Heart className="mr-2 text-primary" size={24} />
                  はじめまして
                </h2>
                <div className="prose prose-lg text-gray-700 leading-relaxed space-y-4">
                  <p>
                    こんにちは。この「静かな図書室」を運営しています。
                  </p>
                  <p>
                    普段は会社員として働きながら、日々感じる小さな気づきや内省を言葉にして、このサイトに綴っています。
                    完璧ではない日常の中で見つけた、ささやかな発見や学びを、静かに共有する場所でありたいと思っています。
                  </p>
                  <p>
                    人生には正解がないからこそ、立ち止まって考える時間が大切だと感じています。
                    忙しい毎日の中で、少しでも自分の思考を整理したり、新しい視点を得るきっかけになれば嬉しいです。
                  </p>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-semibold mb-4 flex items-center">
                  <BookOpen className="mr-2 text-primary" size={24} />
                  このサイトを始めた理由
                </h2>
                <div className="prose prose-lg text-gray-700 leading-relaxed space-y-4">
                  <p>
                    社会人になってから、自分の感情や考えを言葉にする機会が減っていることに気づきました。
                    忙しい日々の中で、立ち止まって考える時間を意識的に作ることの大切さを実感し、それを記録として残したいと思ったのがきっかけです。
                  </p>
                  <p>
                    また、同じように日々の中で感じるモヤモヤや迷いを抱えている人たちと、
                    静かに思いを共有できる場所があればいいなという想いもありました。
                  </p>
                  <p>
                    このサイトが、読んでくださる方の思考を整理したり、
                    新しい気づきを得るための小さなきっかけになれば、それ以上の喜びはありません。
                  </p>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-semibold mb-4 flex items-center">
                  <Coffee className="mr-2 text-primary" size={24} />
                  こんな人に読んでほしい
                </h2>
                <div className="prose prose-lg text-gray-700 leading-relaxed">
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-start">
                      <span className="inline-block w-2 h-2 bg-primary rounded-full mr-3 mt-2 flex-shrink-0"></span>
                      日々の選択や決断について、立ち止まって考えてみたい人
                    </li>
                    <li className="flex items-start">
                      <span className="inline-block w-2 h-2 bg-primary rounded-full mr-3 mt-2 flex-shrink-0"></span>
                      自分の気持ちや考えを言葉にするのが苦手だと感じている人
                    </li>
                    <li className="flex items-start">
                      <span className="inline-block w-2 h-2 bg-primary rounded-full mr-3 mt-2 flex-shrink-0"></span>
                      キャリアや人生の方向性について悩んでいる人
                    </li>
                    <li className="flex items-start">
                      <span className="inline-block w-2 h-2 bg-primary rounded-full mr-3 mt-2 flex-shrink-0"></span>
                      日常の小さな美しさや気づきを大切にしたい人
                    </li>
                    <li className="flex items-start">
                      <span className="inline-block w-2 h-2 bg-primary rounded-full mr-3 mt-2 flex-shrink-0"></span>
                      静かな時間の中で、ゆっくりと文章を読むのが好きな人
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA セクション */}
      <section className="section-padding bg-gradient-to-r from-amber-50 to-orange-50">
        <div className="container-custom text-center">
          <h2 className="section-title">一緒に歩んでいきませんか</h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            このサイトがあなたにとって、思考を整理し、新しい気づきを得る場所になれば幸いです。
            ご感想やご質問など、お気軽にお声がけください。
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/" className="btn-primary">
              記事を読む
            </a>
            <a href="/contact" className="btn-secondary">
              お問い合わせ
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}