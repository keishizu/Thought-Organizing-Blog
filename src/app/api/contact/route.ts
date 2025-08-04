import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: NextRequest) {
  try {
    const { name, email, subject, message } = await request.json();

    // バリデーション
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: '必須項目が入力されていません' },
        { status: 400 }
      );
    }

    // メール送信設定
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // 管理者宛のメール
    const adminMailOptions = {
      from: process.env.SMTP_USER,
      to: process.env.CONTACT_EMAIL || process.env.SMTP_USER,
      subject: `[お問い合わせ] ${subject || '件名なし'}`,
      html: `
        <h2>新しいお問い合わせがありました</h2>
        <p><strong>お名前:</strong> ${name}</p>
        <p><strong>メールアドレス:</strong> ${email}</p>
        <p><strong>件名:</strong> ${subject || '件名なし'}</p>
        <p><strong>メッセージ:</strong></p>
        <div style="white-space: pre-wrap; background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 10px 0;">
          ${message}
        </div>
        <hr>
        <p style="font-size: 12px; color: #666;">
          このメールは自動送信されています。
        </p>
      `,
    };

    // 送信者宛の確認メール
    const userMailOptions = {
      from: process.env.SMTP_USER,
      to: email,
      subject: 'お問い合わせを受け付けました',
      html: `
        <h2>お問い合わせありがとうございます</h2>
        <p>${name} 様</p>
        <p>お問い合わせを受け付けました。内容を確認の上、2-3日以内にご返信いたします。</p>
        <hr>
        <h3>お問い合わせ内容</h3>
        <p><strong>件名:</strong> ${subject || '件名なし'}</p>
        <p><strong>メッセージ:</strong></p>
        <div style="white-space: pre-wrap; background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 10px 0;">
          ${message}
        </div>
        <hr>
        <p style="font-size: 12px; color: #666;">
          このメールは自動送信されています。返信はできませんのでご了承ください。
        </p>
      `,
    };

    // メール送信
    await transporter.sendMail(adminMailOptions);
    await transporter.sendMail(userMailOptions);

    return NextResponse.json(
      { message: 'メッセージを送信しました' },
      { status: 200 }
    );

  } catch (error) {
    console.error('メール送信エラー:', error);
    return NextResponse.json(
      { error: 'メール送信中にエラーが発生しました' },
      { status: 500 }
    );
  }
} 