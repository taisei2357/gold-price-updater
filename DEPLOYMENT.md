# 本番デプロイメント指示書

## 1. PostgreSQL本番データベース設定

### 環境変数設定（本番環境）
```bash
# PostgreSQL接続文字列に変更
DATABASE_URL="postgresql://username:password@hostname:port/database?schema=public"

# 本番用Cronシークレット
CRON_SECRET="your-production-secret-key"

# Shopify App設定
SHOPIFY_API_KEY="your-production-api-key"
SHOPIFY_API_SECRET="your-production-api-secret"
```

### データベースマイグレーション実行
```bash
# 本番DBにマイグレーション適用
npx prisma migrate deploy

# Prisma Client生成
npx prisma generate
```

## 2. マルチショップ対応

✅ **既に実装済み**: 
- 全ての`autoUpdateEnabled=true`ショップを自動処理
- ショップごとのセッション復元
- 独立したエラーハンドリング

## 3. レート制限対策

✅ **実装済み機能**:
- クエリ間待機: 150ms
- ミューテーション間待機: 300ms〜1000ms（指数バックオフ）
- ショップ間待機: 1000ms

## 4. サーキットブレーカー

✅ **自動安全停止**:
- 連続失敗3回で自動更新停止
- 失敗カウンター自動リセット（成功時）
- ログに詳細記録

## 5. GitHub Actions CRON設定

### `.github/workflows/price-update-scheduler.yml`
```yaml
name: Gold Price Auto Update
on:
  schedule:
    - cron: '0 1 * * 1-5'  # JST 10:00 (平日のみ)
  workflow_dispatch:       # 手動実行可能

jobs:
  update-prices:
    runs-on: ubuntu-latest
    steps:
      - name: Execute Price Update
        run: |
          curl -X POST "${{ secrets.APP_URL }}/api/cron/price-update" \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}" \
            -H "Content-Type: application/json"
```

### GitHub Secrets設定
```
APP_URL: https://your-production-app.com
CRON_SECRET: your-production-secret-key
```

## 6. 監視・アラート

### 実行ログ確認
- `/app/logs` でリアルタイム確認
- データベース`PriceUpdateLog`テーブル

### 失敗時通知（実装済み）
- サーキットブレーカー作動時のログ記録
- 連続失敗3回で自動停止

## 7. 本番運用開始手順

1. **PostgreSQL DB準備**
2. **環境変数設定**
3. **マイグレーション実行**: `npx prisma migrate deploy`
4. **GitHub Actions設定**
5. **各ショップで設定確認**: 自動更新ON、商品選択
6. **手動テスト実行**: `?force=1`パラメータ付きで確認
7. **自動スケジュール開始**

## 8. 運用後のメンテナンス

- 毎日の実行ログ確認
- 田中貴金属サイト変更時の調整
- レート制限調整（必要に応じて）
- サーキットブレーカー閾値調整

---

**🚀 本番準備完了**: マルチショップ対応、レート制限対策、サーキットブレーカー実装済み