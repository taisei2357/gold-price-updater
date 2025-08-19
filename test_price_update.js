// 価格更新テストスクリプト
import { fetchGoldPriceDataTanaka } from './app/models/gold.server.ts';

async function testPriceUpdate() {
  try {
    console.log('🔍 金価格データを取得中...');
    const goldData = await fetchGoldPriceDataTanaka();
    
    if (!goldData) {
      console.error('❌ 金価格データの取得に失敗');
      return;
    }
    
    console.log('✅ 金価格データ取得成功:');
    console.log(`- 小売価格: ${goldData.retailPriceFormatted}`);
    console.log(`- 前日比: ${goldData.changePercent}`);
    console.log(`- 変動方向: ${goldData.changeDirection}`);
    console.log(`- 変動比率: ${goldData.changeRatio}`);
    
    // 手動で価格更新APIを呼び出し
    console.log('\n🔄 手動価格更新を実行中...');
    const response = await fetch('http://localhost:3000/api/cron', {
      method: 'POST',
      headers: {
        'Authorization': process.env.CRON_SECRET ? `Bearer ${process.env.CRON_SECRET}` : undefined,
        'Content-Type': 'application/json'
      }
    });
    
    const result = await response.json();
    console.log('✅ 価格更新結果:', JSON.stringify(result, null, 2));
    
  } catch (error) {
    console.error('❌ テストエラー:', error.message);
  }
}

testPriceUpdate();