// 手動価格更新テスト
import { PrismaClient } from '@prisma/client';
// price fetch simulation
async function fetchGoldPriceDataTanaka() {
  // シミュレーション: 現在は金価格+2.5%上昇と仮定
  return { changeRatio: 0.025, retailPrice: 12000, changeDirection: 'up' };
}

async function fetchPlatinumPriceDataTanaka() {
  // シミュレーション: 現在はプラチナ価格-1.8%下落と仮定  
  return { changeRatio: -0.018, retailPrice: 4500, changeDirection: 'down' };
}

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://neondb_owner:npg_2tIky1uxoZjH@ep-rough-flower-a15ccwud-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&pgbouncer=true&connect_timeout=5"
    }
  }
});

// 価格計算関数（cronと同じロジック）
function calcFinalPriceWithStep(current, ratio, minPct01, step = 1) {
  const target = Math.max(current * (1 + ratio), current * minPct01);
  const rounded = ratio >= 0 ? Math.ceil(target / step) * step : Math.floor(target / step) * step;
  return rounded;
}

async function testPriceUpdate() {
  try {
    console.log('🚀 手動価格更新テスト開始');
    
    // 1) 金・プラチナ価格取得
    console.log('📊 金・プラチナ価格取得中...');
    const [goldData, platinumData] = await Promise.all([
      fetchGoldPriceDataTanaka(),
      fetchPlatinumPriceDataTanaka()
    ]);
    
    const goldRatio = goldData?.changeRatio;
    const platinumRatio = platinumData?.changeRatio;
    
    console.log(`🥇 金価格変動: ${goldRatio !== null ? (goldRatio * 100).toFixed(2) + '%' : 'N/A'}`);
    console.log(`🥈 プラチナ価格変動: ${platinumRatio !== null ? (platinumRatio * 100).toFixed(2) + '%' : 'N/A'}`);
    
    // 2) ショップ設定取得
    const setting = await prisma.shopSetting.findFirst();
    const minPct = setting?.minPricePct ?? 93;
    const minPct01 = minPct / 100;
    
    console.log(`⚙️ 価格下限設定: ${minPct}%`);
    
    // 3) 対象商品取得
    const targets = await prisma.selectedProduct.findMany({
      select: { productId: true, metalType: true }
    });
    
    const goldTargets = targets.filter(t => t.metalType === 'gold');
    const platinumTargets = targets.filter(t => t.metalType === 'platinum');
    
    console.log(`📦 対象商品: 金${goldTargets.length}件, プラチナ${platinumTargets.length}件`);
    
    // 4) 価格計算シミュレーション
    console.log('\n💰 価格計算シミュレーション:');
    
    // テスト用の価格で計算例を表示
    const testPrices = [50000, 100000, 200000];
    
    if (goldRatio !== null) {
      console.log(`\n🥇 金商品 (変動率: ${(goldRatio * 100).toFixed(2)}%)`);
      testPrices.forEach(current => {
        const newPrice = calcFinalPriceWithStep(current, goldRatio, minPct01, 10);
        const minPrice = current * minPct01;
        const isLimited = newPrice === Math.ceil(minPrice / 10) * 10;
        console.log(`  ${current.toLocaleString()}円 → ${newPrice.toLocaleString()}円 ${isLimited ? '(下限適用)' : ''}`);
      });
    }
    
    if (platinumRatio !== null) {
      console.log(`\n🥈 プラチナ商品 (変動率: ${(platinumRatio * 100).toFixed(2)}%)`);
      testPrices.forEach(current => {
        const newPrice = calcFinalPriceWithStep(current, platinumRatio, minPct01, 10);
        const minPrice = current * minPct01;
        const isLimited = newPrice === Math.ceil(minPrice / 10) * 10;
        console.log(`  ${current.toLocaleString()}円 → ${newPrice.toLocaleString()}円 ${isLimited ? '(下限適用)' : ''}`);
      });
    }
    
    console.log('\n✅ 価格計算テスト完了');
    console.log('💡 実際のShopify商品価格を更新するには、アプリ画面で「価格を更新」ボタンを押してください');
    
  } catch (error) {
    console.error('❌ エラー:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testPriceUpdate();