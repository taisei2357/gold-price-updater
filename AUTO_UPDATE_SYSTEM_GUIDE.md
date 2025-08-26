# Shopify金製品価格自動更新システム構成

## 🕙 自動更新を司る主要ファイル

### 1. **`/app/routes/api.cron.ts`** - メインAPIエンドポイント
- **役割**: 価格更新のメインロジック
- **機能**: 
  - CRON認証チェック
  - 各ショップの時刻設定確認
  - 金・プラチナ価格取得
  - Shopify商品価格更新
  - メール通知送信

### 2. **`/vercel.json`** - Vercel Cronスケジュール
- **役割**: 定期実行の設定
- **設定**: `"schedule": "0 1 * * 1-5"` (UTC 1:00 = JST 10:00, 平日のみ)
- **エンドポイント**: `/api/cron`

### 3. **データベーステーブル (Prisma)**
- **`ShopSetting`**: 各ショップの自動更新設定
  - `autoUpdateEnabled`: 自動更新ON/OFF
  - `autoUpdateHour`: 実行時刻（JST）
  - `minPricePct`: 最小価格率（93%）
  - `notificationEmail`: 通知先メール
- **`SelectedProduct`**: 価格更新対象商品
- **`PriceUpdateLog`**: 実行履歴

### 4. **価格取得モジュール**
- **`/app/models/gold.server.ts`**: 田中貴金属価格取得
  - `fetchGoldPriceDataTanaka()`: 金価格取得
  - `fetchPlatinumPriceDataTanaka()`: プラチナ価格取得

### 5. **通知システム**
- **`/app/utils/email.server.ts`**: メール送信
  - `sendPriceUpdateNotification()`: 価格更新通知

## 🔄 実行フロー

1. **Vercel Cron** → 毎日JST 10:00にトリガー
2. **`api.cron.ts`** → 認証チェック・時刻確認
3. **`gold.server.ts`** → 田中貴金属から価格取得
4. **Shopify API** → 選択商品の価格更新
5. **`email.server.ts`** → 結果をメール通知
6. **データベース** → 実行ログ保存

## 🛠️ 設定変更方法

### 実行時刻の変更:
```bash
node update_schedule_to_10am.mjs
```

### 手動実行:
```bash
curl -X POST "https://gold-price-updater-pb8o.vercel.app/api/cron?force=1" \
  -H "x-vercel-cron: 1"
```

### ログ確認:
```bash
node check_db_details.mjs
```

## 📊 現在の設定

- **実行時刻**: 毎日JST 10:00（平日のみ）
- **対象商品**: 金4件 + プラチナ1件
- **最小価格率**: 93%（価格下落時の下限）
- **通知先**: taisei19971021@gmail.com
- **自動更新**: ON

## 🔧 トラブルシューティング

### 価格が更新されない場合:
1. 時刻設定確認: `node check_db_details.mjs`
2. 手動実行テスト: `curl ... ?force=1`
3. 選択商品確認: データベースで`SelectedProduct`テーブル
4. API接続確認: Shopifyアクセストークン

### Vercel Cron確認:
- Vercel Dashboard → Functions → Crons
- 実行ログでエラー確認