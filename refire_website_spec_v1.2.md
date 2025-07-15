# RE FIRE 公式 Web サイト 要件定義・設計書 (v1.2)
公開希望: **2025‑09‑15**（予備 1 週間）  
作成日: 2025‑07‑12  

---
## 1. 目的・KPI
| # | 指標 | 目標値 |
|---|------|--------|
| 1 | 防火管理代行サービスへの **月間問い合わせ件数** | 15 件以上 |
| 2 | 防火管理代行サービスの **月間契約獲得数** | 3 件以上 |

---
## 2. ターゲット
- 商業ビル・ホテル・病院・工場など **防火対象物** のオーナー／施設管理責任者  
- 「防火管理者選任が義務と分かっているが自社人員では対応が難しい」担当者

---
## 3. コアメッセージ
> **義務の先にある安心を守る ─ 防火管理を丸ごと代行します。**  

全スタッフ元消防士（災害最前線 15 年以上）の経験で、“法令 + α” の真の安全を提供。

---
## 4. サイト構成（URL ルーティング）
| URL | ページ名 | 主要コンテンツ |
|-----|----------|----------------|
| `/` | トップ | Hero・USP・代行サービス CTA |
| `/service` | **防火管理代行 (主力)** | 業務フロー・料金表・事例・FAQ・CTA |
| `/services` | サブサービス一覧 | 9 サービスカード |
| `/about` | 会社概要 | 会社情報・代表挨拶 |
| `/contact` | お問い合わせ | フォーム (RHForm + Zod) |

---
## 5. カラーパレット
| 役割 | 色 | HEX | 用途 |
|------|----|-----|------|
| ブランドベース | Black | `#000000` | 背景・ヘッダー・ロゴ枠 |
| プライマリー | Electric Blue | `#00A3FF` | CTA ボタン・リンクホバー |
| セカンダリー | Flame Orange | `#FF4E00` | 罰則リスクボックス・警告 |
| ニュートラル | White / Light Gray | `#FFFFFF` / `#F5F5F5` | 本文背景・カード |

> WCAG AA コントラスト基準: プライマリー/セカンダリーは黒背景上で 4.5:1↑ を確認済み。

---
## 6. 技術スタック
- **Next.js 14 (App Router) + TypeScript**
- Tailwind CSS + shadcn/ui + Framer Motion  
- 送信 API: `/api/contact` (Edge Function) → SendGrid/Resend 経由メール
- Vercel デプロイ (stg / prod)

---
## 7. ディレクトリ構成 (抜粋)
```
app/
├─ layout.tsx
├─ page.tsx
├─ service/page.tsx
├─ services/page.tsx
├─ about/page.tsx
└─ contact/page.tsx
components/
  ├─ NavBar.tsx
  ├─ Footer.tsx   # 住所: 〒530‑0001 大阪市北区梅田1‑2‑2 大阪駅前第2ビル12‑12
public/assets/
```
---
## 8. 機能要件
- レスポンシブ対応 (SP ↔ PC) ― Tailwind breakpoints  
- フォーム: RHF + Zod / honeypot / reCAPTCHA v3  
- メール通知: SendGrid (テンプレート ID env)  
- エラーページ: 404・500 カスタム  
- OG / JSON‑LD / GA & GSC 連携

---
## 9. 非機能要件
| 指標 | 目標 |
|------|------|
| LCP | < 2.5 s |
| インタラクティブ | < 100 ms |
| Lighthouse | 95 以上 |
| アクセシビリティ | キーボード / スクリーンリーダ対応 |

---
## 10. マイルストーン
| 週 | ゴール |
|----|--------|
| Week 0 | 要件確定 / ドメイン決定 / repo & Vercel 用意 |
| Week 1 | トップ MVP |
| Week 2 | `/service` ページ実装 |
| Week 3 | `/services` `/about` |
| Week 4 | `/contact` + API |
| Week 5 | SEO / 性能 / A11y 改善 |
| Week 6 | 本番デプロイ & レビュー |
