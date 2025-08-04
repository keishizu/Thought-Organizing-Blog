# メール送信機能の設定

## 環境変数の設定

`.env.local`ファイルに以下の環境変数を設定してください：

```env
# メール送信設定
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
CONTACT_EMAIL=your_contact_email@example.com
```

## Gmailでの設定手順

### 1. アプリパスワードの生成

1. Googleアカウントの設定にアクセス
2. セキュリティ → 2段階認証を有効化
3. アプリパスワードを生成
4. 生成されたパスワードを`SMTP_PASS`に設定

### 2. 環境変数の設定例

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_16_digit_app_password
CONTACT_EMAIL=your_contact_email@example.com
```

## その他のメールサービス

### Outlook/Hotmail
```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
```

### Yahoo Mail
```env
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
```

## 機能

- お問い合わせフォームから送信されたメッセージが指定のメールアドレスに届きます
- 送信者にも確認メールが自動送信されます
- 管理者宛のメールには送信者の情報とメッセージ内容が含まれます 

