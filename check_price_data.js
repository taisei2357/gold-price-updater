import { PrismaClient } from '@prisma/client';

// 統一的な金属価格取得関数（gold.server.tsから移植）
async function fetchMetalPriceData(metalType) {
  try {
    // 金属種別に応じたURL取得
    const url = metalType === 'gold' 
      ? 'https://gold.tanaka.co.jp/commodity/souba/d-gold.php'
      : 'https://gold.tanaka.co.jp/commodity/souba/d-platinum.php';
      
    const resp = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
    if (!resp.ok) throw new Error(`Tanaka request failed: ${resp.status}`);
    const html = await resp.text();

    console.log(`${metalType} HTML取得成功、長さ:`, html.length);

    // HTMLテキスト抽出ユーティリティ（タグ除去 + 空白正規化）
    const textify = (s) => (s || "").replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();

    // 正確なHTML構造に基づく価格抽出
    let retailPrice = null;
    let changeYen = null;
    let buyPrice = null;
    
    // まず d-gold.php / d-platinum.php の 行ベース抽出
    try {
      const metalRowLabel = metalType === 'gold' ? '金' : 'プラチナ';
      const rowMatch = html.match(new RegExp(`<tr[^>]*>\\s*<td[^>]*class="metal_name"[^>]*>\\s*${metalRowLabel}\\s*<\\/td>[\\s\\S]*?<\\/tr>`, 'i'));
      if (rowMatch) {
        const rowHtml = rowMatch[0];
        const tds = [...rowHtml.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)].map(m => textify(m[1]));
        if (tds.length >= 5) {
          const numFrom = (s) => {
            const m = s.match(/([\d,]+)\s*円/);
            return m ? parseInt(m[1].replace(/,/g, '')) : null;
          };
          const yenChangeFrom = (s) => {
            const m = s.match(/([+\-]?\d+(?:\.\d+)?)\s*円/);
            return m ? parseFloat(m[1]) : null;
          };
          retailPrice = numFrom(tds[1]);
          changeYen = yenChangeFrom(tds[2]);  
          buyPrice = numFrom(tds[3]);
        }
      }
    } catch {}

    // 小売価格変動率を計算
    let changeRatio = (changeYen !== null && retailPrice !== null)
      ? changeYen / retailPrice
      : null;
    if (typeof changeRatio === 'number' && !Number.isFinite(changeRatio)) {
      changeRatio = null;
    }
    
    const changePercent = changeRatio !== null 
      ? `${(changeRatio * 100).toFixed(2)}%` 
      : '0.00%';
    
    // 変動方向を判定
    let changeDirection = 'flat';
    if (changeRatio !== null) {
      if (changeRatio > 0) changeDirection = 'up';
      else if (changeRatio < 0) changeDirection = 'down';
    }

    return {
      metalType,
      retailPrice,
      retailPriceFormatted: retailPrice ? `¥${retailPrice.toLocaleString()}/g` : '取得失敗',
      buyPrice,
      buyPriceFormatted: buyPrice ? `¥${buyPrice.toLocaleString()}/g` : '取得失敗',
      changeRatio,
      changePercent: changeRatio !== null ? (changeRatio >= 0 ? `+${changePercent}` : changePercent) : '0.00%',
      changeDirection,
      lastUpdated: new Date().toISOString()
    };
    
  } catch (error) {
    console.error(`田中貴金属${metalType}価格取得エラー:`, error);
    return null;
  }
}

// Function to fetch gold price data directly
async function fetchGoldPriceDataTanaka() {
  return await fetchMetalPriceData('gold');
}

// Function to fetch platinum price data directly
async function fetchPlatinumPriceDataTanaka() {
  return await fetchMetalPriceData('platinum');
}

async function checkPriceData() {
  try {
    console.log('🔍 現在の金・プラチナ価格データ確認');
    console.log('📅 確認日時:', new Date().toLocaleString('ja-JP'));
    console.log('=' * 50);
    
    console.log('\n💰 金価格データ取得中...');
    const goldData = await fetchGoldPriceDataTanaka();
    
    console.log('💎 プラチナ価格データ取得中...');
    const platinumData = await fetchPlatinumPriceDataTanaka();
    
    console.log('\n🥇 金価格情報:');
    console.log(`   変動率: ${goldData.changeRatio} (${(goldData.changeRatio * 100).toFixed(4)}%)`);
    console.log(`   変動方向: ${goldData.changeDirection}`);
    console.log(`   小売価格: ${goldData.retailPriceFormatted}`);
    console.log(`   買取価格: ${goldData.buyPriceFormatted}`);
    console.log(`   前日比: ${goldData.changePercent}`);
    console.log(`   最終更新: ${goldData.lastUpdated}`);
    
    console.log('\n💎 プラチナ価格情報:');
    console.log(`   変動率: ${platinumData.changeRatio} (${(platinumData.changeRatio * 100).toFixed(4)}%)`);
    console.log(`   変動方向: ${platinumData.changeDirection}`);
    console.log(`   小売価格: ${platinumData.retailPriceFormatted}`);
    console.log(`   買取価格: ${platinumData.buyPriceFormatted}`);
    console.log(`   前日比: ${platinumData.changePercent}`);
    console.log(`   最終更新: ${platinumData.lastUpdated}`);
    
    // 価格更新判定ロジック
    const goldRatio = goldData.changeRatio || 0;
    const platinumRatio = platinumData.changeRatio || 0;
    
    console.log('\n📊 価格更新判定:');
    console.log(`   金変動率: ${(goldRatio * 100).toFixed(4)}%`);
    console.log(`   プラチナ変動率: ${(platinumRatio * 100).toFixed(4)}%`);
    
    const significantChange = Math.abs(goldRatio) >= 0.005 || Math.abs(platinumRatio) >= 0.005;
    console.log(`   有意な変動（0.5%以上）: ${significantChange ? '✅ あり' : '❌ なし'}`);
    
    if (!significantChange) {
      console.log('\n⚠️ 価格更新がスキップされる理由:');
      console.log(`   - 金変動率: ${Math.abs(goldRatio * 100).toFixed(4)}% < 0.5%`);
      console.log(`   - プラチナ変動率: ${Math.abs(platinumRatio * 100).toFixed(4)}% < 0.5%`);
      console.log('   - システムは0.5%未満の変動では価格更新を行いません');
    }
    
    // ゼロ変動のチェック
    if (goldRatio === 0 && platinumRatio === 0) {
      console.log('\n🚨 重要: 金・プラチナ両方の変動率が0%');
      console.log('   - 田中貴金属のサイトで価格が更新されていない可能性');
      console.log('   - または価格取得の問題');
    }
    
    // 現在時刻チェック
    const now = new Date();
    const jstHour = now.getHours();
    console.log(`\n🕐 現在時刻: ${jstHour}時`);
    console.log(`   自動実行時刻（10時）: ${jstHour === 10 ? '✅ 実行時間' : '❌ 実行時間外'}`);
    
  } catch (error) {
    console.error('❌ 価格データ取得エラー:', error.message);
    console.error('スタックトレース:', error.stack);
  }
}

checkPriceData();