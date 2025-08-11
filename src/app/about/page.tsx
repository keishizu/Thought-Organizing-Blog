'use client';

import { User, Heart, BookOpen, Coffee } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function AboutPage() {
  const [adminName, setAdminName] = useState("管理者");
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminProfile = async () => {
      try {
        const response = await fetch('/api/admin/profile');
        const data = await response.json();
        setAdminName(data.adminName);
        setProfileImage(data.profileImage);
      } catch (error) {
        console.error('Error fetching admin profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminProfile();
  }, []);
  return (
    <div>
      {/* ページヘッダー */}
      <section className="page-header">
        <div className="container-custom">
          <h1 className="page-title">思整図書館とは</h1>
        </div>
      </section>

      {/* メインコンテンツ */}
      <section className="section-padding">
        <div className="container-custom max-w-4xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* プロフィール画像 */}
            <div className="lg:col-span-1">
              <div className="card-base p-6 text-center">
                {loading ? (
                  <div className="w-32 h-32 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <div className="w-32 h-32 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                    {profileImage ? (
                      <img 
                        src={profileImage} 
                        alt="プロフィール画像" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User size={48} className="text-gray-400" />
                    )}
                  </div>
                )}
                <h3 className="text-xl font-semibold mb-2">管理者：{adminName}</h3>
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
                    こんにちは。この「思整図書館」を管理・運営をしている{adminName}と申します。
                  </p>
                  <p>
                    ここは、心のモヤモヤや迷いを少しずつ言葉に変え、思考を整える場所です。
                    日々感じる小さな気づきや内省を言葉にして、ここに綴っています。
                  </p>
                  <p>
                    慌ただしい毎日の中で、自分と向き合える“もうひとつの居場所”を目指しているので、
                    良ければ少し立ち止まり、一緒に思考を整える時間を作ってみませんか？
                  </p>
              
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-semibold mb-4 flex items-center">
                  <BookOpen className="mr-2 text-primary" size={24} />
                  この図書館を創ったキッカケ
                </h2>
                <div className="prose prose-lg text-gray-700 leading-relaxed space-y-4">
                  <p>
                  社会人になってから、知らず知らずのうちに自分の感情や考えを言葉にする機会が減っていました。
                  気づけば、頭の中に表現のしようがない“思考のゴミ”が散らばり、言葉にするのこと自体が面倒に......
                  そして、次第に考えることさえ放棄していました。
                  </p>
                  <p>  
                  そんなとき、ふと「このままではいけない」と思い、  
                  忙しい日々の中であえて立ち止まり、ゆっくり考え、
                  それを記録として残そうと決めました。  
                  </p>
                  <p>
                    また、同じようなモヤモヤや迷いを抱えている人たちと、
                    せわしない日常の中で見つけた、ささやかな発見や学びを
                    共有できる場所があれば——。そういった想いから、この図書館を立ち上げました。
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
            ここがあなたにとって思考を整え、新しい気づきを得る、場所になれば幸いです。
            ご感想やご質問など、お気軽にお声がけください。
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/articles" className="btn-primary">
              図書を読む
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