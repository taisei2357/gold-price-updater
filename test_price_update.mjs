// 価格更新テストスクリプト (ESM)
import fetch from 'node-fetch';

async function testGoldPrice() {
  try {
    console.log('🔍 田中貴金属から金価格を直接取得中...');
    
    const response = await fetch('https://www.tanaka.co.jp/home');
    const html = await response.text();
    
    // 金価格の行を抽出
    const goldRowMatch = html.match(/<tr[^>]*class="gold"[^>]*>.*?<\/tr>/is);
    if (!goldRowMatch) {
      console.error('❌ 金価格の行が見つかりません');
      return null;
    }
    
    const goldRow = goldRowMatch[0];
    
    // 小売価格を抽出
    const priceMatch = goldRow.match(/<td[^>]*class="retail_price"[^>]*>([0-9,]+)\s*円/);
    const retailPrice = priceMatch ? priceMatch[1] : null;
    
    // 前日比を抽出
    const changeMatch = goldRow.match(/<td[^>]*class="retail_ratio"[^>]*>([+\-]?\d+(?:\.\d+)?)\s*[　\s]*円/);
    const change = changeMatch ? parseFloat(changeMatch[1]) : null;
    
    if (!retailPrice || change === null) {
      console.error('❌ 金価格データの解析に失敗');
      console.log('金価格行:', goldRow);
      return null;
    }
    
    const price = parseFloat(retailPrice.replace(/,/g, ''));
    const changeRatio = change / price;
    
    console.log('✅ 金価格データ取得成功:');
    console.log(`- 小売価格: ${retailPrice}円`);
    console.log(`- 前日比: ${change > 0 ? '+' : ''}${change}円`);
    console.log(`- 変動比率: ${(changeRatio * 100).toFixed(4)}%`);
    
    return { retailPrice, change, changeRatio };
    
  } catch (error) {
    console.error('❌ 金価格取得エラー:', error.message);
    return null;
  }
}

async function testPriceUpdate() {
  try {
    // 1. 金価格取得テスト
    const goldData = await testGoldPrice();
    if (!goldData) return;
    
    // 2. 手動価格更新テスト
    console.log('\n🔄 手動価格更新を実行中...');
    const response = await fetch('http://localhost:3000/api/cron', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      console.error(`❌ API呼び出しエラー: ${response.status} ${response.statusText}`);
      const text = await response.text();
      console.log('レスポンス:', text);
      return;
    }
    
    const result = await response.json();
    console.log('\n✅ 価格更新結果:');
    console.log(JSON.stringify(result, null, 2));
    
  } catch (error) {
    console.error('❌ テストエラー:', error.message);
  }
}

testPriceUpdate();