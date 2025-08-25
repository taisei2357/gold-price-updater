// 環境変数確認用スクリプト
console.log('🔍 環境変数確認:');
console.log('CRON_SECRET:', process.env.CRON_SECRET ? '設定済み' : '未設定');
console.log('DATABASE_URL:', process.env.DATABASE_URL ? '設定済み' : '未設定'); 
console.log('SHOPIFY_API_KEY:', process.env.SHOPIFY_API_KEY ? '設定済み' : '未設定');

// CRON_SECRET の値（セキュリティのため最初の4文字のみ）
if (process.env.CRON_SECRET) {
  console.log('CRON_SECRET prefix:', process.env.CRON_SECRET.substring(0, 4) + '***');
}