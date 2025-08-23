// 実際の田中貴金属価格を取得してテスト
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://neondb_owner:npg_2tIky1uxoZjH@ep-rough-flower-a15ccwud-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&pgbouncer=true&connect_timeout=5"
    }
  }
});

// 田中貴金属から実際の価格を取得
async function fetchRealMetalPrice(metalType) {
  const urls = {
    gold: 'https://gold.tanaka.co.jp/commodity/souba/',
    platinum: 'https://gold.tanaka.co.jp/commodity/souba/d-platinum.php'
  };
  
  const rowClasses = {
    gold: 'gold',
    platinum: 'pt'
  };
  
  try {
    const resp = await fetch(urls[metalType], { 
      headers: { "User-Agent": "Mozilla/5.0" } 
    });
    
    if (!resp.ok) throw new Error(`Request failed: ${resp.status}`);
    const html = await resp.text();

    const metalRowClass = rowClasses[metalType];
    const metalRowMatch = html.match(new RegExp(`<tr[^>]*class="${metalRowClass}"[^>]*>.*?</tr>`, 'is'));
    
    if (metalRowMatch) {
      const metalRow = metalRowMatch[0];
      
      // 小売価格抽出
      const priceMatch = metalRow.match(/<td[^>]*class="retail_tax"[^>]*>([\d,]+)\s*円/);
      const retailPrice = priceMatch ? parseInt(priceMatch[1].replace(/,/g, '')) : null;
      
      // 前日比抽出
      const changeMatch = metalRow.match(/<td[^>]*class="retail_ratio"[^>]*>([+\-]?\d+(?:\.\d+)?)\s*[　\s]*円/);
      const changeYen = changeMatch ? parseFloat(changeMatch[1]) : null;
      
      const changeRatio = (changeYen !== null && retailPrice !== null) 
        ? changeYen / retailPrice 
        : null;
      
      return {
        metalType,
        retailPrice,
        changeYen,
        changeRatio,
        changePercent: changeRatio ? `${(changeRatio * 100).toFixed(2)}%` : 'N/A'
      };
    }
    
    return null;
  } catch (error) {
    console.error(`${metalType}価格取得エラー:`, error);
    return null;
  }
}

async function testRealPriceUpdate() {
  try {
    console.log('🌐 田中貴金属から実際の価格データを取得中...');
    
    // 実際の金・プラチナ価格取得
    const [goldData, platinumData] = await Promise.all([
      fetchRealMetalPrice('gold'),
      fetchRealMetalPrice('platinum')
    ]);
    
    console.log('\n📊 現在の実際の価格情報:');
    if (goldData) {
      console.log(`🥇 金: ${goldData.retailPrice?.toLocaleString()}円/g, 前日比: ${goldData.changeYen}円 (${goldData.changePercent})`);
    } else {
      console.log('🥇 金: 価格取得失敗');
    }
    
    if (platinumData) {
      console.log(`🥈 プラチナ: ${platinumData.retailPrice?.toLocaleString()}円/g, 前日比: ${platinumData.changeYen}円 (${platinumData.changePercent})`);
    } else {
      console.log('🥈 プラチナ: 価格取得失敗');
    }
    
    // データベースから対象商品を取得
    const targets = await prisma.selectedProduct.findMany({
      select: { productId: true, metalType: true }
    });
    
    const goldTargets = targets.filter(t => t.metalType === 'gold');
    const platinumTargets = targets.filter(t => t.metalType === 'platinum');
    
    console.log(`\n📦 登録商品: 金${goldTargets.length}件, プラチナ${platinumTargets.length}件`);
    
    // 設定取得
    const setting = await prisma.shopSetting.findFirst();
    const minPct = setting?.minPricePct ?? 93;
    const minPct01 = minPct / 100;
    
    console.log(`⚙️ 価格下限設定: ${minPct}%`);
    
    // 価格計算シミュレーション
    console.log('\n💰 実際のデータでの価格計算シミュレーション:');
    
    function calcFinalPriceWithStep(current, ratio, minPct01, step = 1) {
      const target = Math.max(current * (1 + ratio), current * minPct01);
      const rounded = ratio >= 0 ? Math.ceil(target / step) * step : Math.floor(target / step) * step;
      return rounded;
    }
    
    const testPrices = [50000, 100000, 200000];
    
    if (goldData && goldData.changeRatio !== null && goldTargets.length > 0) {
      console.log(`\n🥇 金商品 (変動率: ${goldData.changePercent})`);
      testPrices.forEach(current => {
        const newPrice = calcFinalPriceWithStep(current, goldData.changeRatio, minPct01, 10);
        const minPrice = current * minPct01;
        const isLimited = newPrice === Math.ceil(minPrice / 10) * 10;
        console.log(`  ${current.toLocaleString()}円 → ${newPrice.toLocaleString()}円 ${isLimited ? '(下限適用)' : ''}`);
      });
    }
    
    if (platinumData && platinumData.changeRatio !== null && platinumTargets.length > 0) {
      console.log(`\n🥈 プラチナ商品 (変動率: ${platinumData.changePercent})`);
      testPrices.forEach(current => {
        const newPrice = calcFinalPriceWithStep(current, platinumData.changeRatio, minPct01, 10);
        const minPrice = current * minPct01;
        const isLimited = newPrice === Math.ceil(minPrice / 10) * 10;
        console.log(`  ${current.toLocaleString()}円 → ${newPrice.toLocaleString()}円 ${isLimited ? '(下限適用)' : ''}`);
      });
    }
    
    // 価格更新が必要かチェック
    let shouldUpdate = false;
    if (goldData && goldData.changeRatio !== null && goldTargets.length > 0) {
      shouldUpdate = true;
    }
    if (platinumData && platinumData.changeRatio !== null && platinumTargets.length > 0) {
      shouldUpdate = true;
    }
    
    console.log(`\n${shouldUpdate ? '✅' : '❌'} 価格更新実行可能: ${shouldUpdate ? 'はい' : 'いいえ'}`);
    
    if (shouldUpdate) {
      console.log('\n🚀 実際の価格更新を実行するには、以下のコマンドを実行してください:');
      console.log('curl -X POST http://localhost:3000/api/manual-update -H "Content-Type: application/json"');
    }
    
  } catch (error) {
    console.error('❌ エラー:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testRealPriceUpdate();