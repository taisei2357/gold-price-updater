// test_gold_price.mjs - 金価格取得のテスト
import { fetchGoldPriceDataTanaka } from './app/models/gold.server.ts';

console.log('🧪 金価格取得機能をテスト中...\n');

try {
  const goldData = await fetchGoldPriceDataTanaka();
  
  if (!goldData) {
    console.error('❌ 金価格データの取得に失敗しました');
    process.exit(1);
  }
  
  console.log('✅ 金価格データを正常に取得:');
  console.log(`📈 店頭小売価格: ${goldData.retailPriceFormatted}`);
  console.log(`📊 前日比: ${goldData.changePercent}`);
  console.log(`🎯 変動方向: ${goldData.changeDirection}`);
  console.log(`🔢 変動率（小数）: ${goldData.changeRatio}`);
  console.log(`⏰ 取得時刻: ${goldData.lastUpdated.toLocaleString('ja-JP')}`);
  
  if (goldData.changeRatio === null) {
    console.warn('⚠️  変動率がnullです - 価格更新処理はスキップされます');
  } else {
    console.log(`✅ 変動率OK: ${(goldData.changeRatio * 100).toFixed(4)}%`);
  }
  
} catch (error) {
  console.error('❌ エラーが発生しました:', error.message);
  process.exit(1);
}