# Vercel デプロイ状況確認

## 最新のコミット情報
- **最新コミット**: 0dec9b9 (Vercel自動デプロイのトリガー用空コミット)
- **前回コミット**: 51d3c3e (動的時刻設定とメール通知機能の実装)
- **リポジトリ**: https://github.com/taisei2357/gold-price-updater.git
- **ブランチ**: main

## 確認すべきVercel設定項目

### 1. プロジェクト設定
- [ ] GitHub連携が有効になっているか
- [ ] デプロイブランチが `main` に設定されているか
- [ ] Auto-deploy が有効になっているか

### 2. 環境変数
以下の環境変数が設定されているか確認：
- [ ] `DATABASE_URL` (Neon PostgreSQL)
- [ ] `SHOPIFY_API_KEY`
- [ ] `SHOPIFY_API_SECRET`
- [ ] `CRON_SECRET`
- [ ] `E2E_SEED_TOKEN` (テスト用、任意)
- [ ] `SENDGRID_API_KEY` or `RESEND_API_KEY` (メール送信用、任意)

### 3. ビルド設定
- **Build Command**: `npm run build`
- **Output Directory**: `build`
- **Install Command**: `npm ci`
- **Node.js Version**: 18.x or 20.x

## デプロイが始まらない場合の対処法

1. **Vercel Dashboard確認**
   - https://vercel.com/dashboard
   - プロジェクト → Settings → Git

2. **手動デプロイ実行**
   - プロジェクト画面で「Deploy」ボタンクリック

3. **GitHub Webhook再設定**
   - Settings → Git → Disconnect and Reconnect

## 動作テスト手順
デプロイ完了後：
1. `https://your-domain.vercel.app/api/cron?force=1` でCron API動作確認
2. アプリ設定画面でメール通知テスト
3. 商品選択・価格更新の動作確認