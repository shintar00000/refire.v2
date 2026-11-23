# RE FIRE ウェブサイト

株式会社RE FIRE（共同住宅の防火管理者外部委託）のコーポレートサイトです。
ビルドの要らない静的サイト（HTML / CSS / JavaScript）です。

## バージョン

| バージョン | 内容 | 保存場所 |
| --- | --- | --- |
| v2（現行） | 2026年11月。大阪府行政書士会の注意書（大行発第626号）への表記修正、保有資格の追加、セキュリティ対策とリファクタリング | `main` |
| v1 | 2025年11月19日時点の公開版 | ブランチ `archive/v1-2025-11-19` |

v1 に戻すときは、`archive/v1-2025-11-19` の内容を `main` に反映します。

## 表記のルール

行政書士法に配慮し、次の書き方を守ります。

- 消防計画は「当社スタッフが防火管理者として作成する」と、作成する立場を必ず書く
- 消防計画の作成だけを請け負うような書き方をしない
- 防火管理者の選任届は、管理権原者が記入・提出し、当社は記入方法を案内する
- 届出・作成・提出・申請の「代行」という言葉を使わない

## ファイル構成

```
index.html                     トップページ
services.html                  サービス内容
pricing.html                   料金
company.html                   会社概要
case-studies.html              導入事例
contact.html                   お問い合わせ（フォーム送信先は Formspree）
privacy-policy.html            プライバシーポリシー
outsourcing/index.html         防火管理 外部委託
outsourcing/manager/index.html 防火管理者の外部委託
styles.css                     全ページ共通のスタイル
script.js                      全ページ共通のスクリプト
image/  logo/                  画像
.htaccess                      Apache で公開する場合のセキュリティヘッダー
```

## セキュリティ

- 全ページに Content-Security-Policy を meta で設定（`script-src 'self'`。インラインスクリプトとインラインのイベント属性は使わない）
- 外部から読み込むのは Google Fonts と、フォーム送信先の Formspree だけ
- お問い合わせフォームのスパム対策は、Formspree のハニーポット `_gotcha` を使う
- Apache で公開する場合は `.htaccess` で X-Frame-Options などのヘッダーも付く

## 更新するときの注意

- `styles.css` と `script.js` を変えたら、各 HTML の `?v=` の日付を更新する（ブラウザのキャッシュ対策）
- 新しいページを作ったら、既存ページの `<head>` にある CSP の meta と、`</body>` 直前の `script.js` の読み込みを同じように入れる
- 画像は WebP に変換して軽くしてから使う
