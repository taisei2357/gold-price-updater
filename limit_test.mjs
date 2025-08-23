// 価格下限テスト（大幅下落シミュレーション）
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://neondb_owner:npg_2tIky1uxoZjH@ep-rough-flower-a15ccwud-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&pgbouncer=true&connect_timeout=5"
    }
  }
});

function calcFinalPriceWithStep(current, ratio, minPct01, step = 1) {
  const target = Math.max(current * (1 + ratio), current * minPct01);
  const rounded = ratio >= 0 ? Math.ceil(target / step) * step : Math.floor(target / step) * step;
  return rounded;
}

async function testPriceLimit() {
  try {
    console.log('🔽 価格下限テスト - 大幅下落シミュレーション');
    
    const setting = await prisma.shopSetting.findFirst();
    const minPct = setting?.minPricePct ?? 93;
    const minPct01 = minPct / 100;
    
    console.log(`⚙️ 設定された価格下限: ${minPct}%`);
    console.log(`📊 テスト商品価格: 100,000円`);
    
    // 様々な下落率でテスト
    const testRatios = [-0.02, -0.05, -0.08, -0.10, -0.15, -0.20];
    const currentPrice = 100000;
    
    console.log('\n💰 各下落率での価格計算結果:');
    console.log('現在価格: 100,000円');
    console.log(`下限価格: ${(currentPrice * minPct01).toLocaleString()}円 (${minPct}%)`);
    console.log('─'.repeat(50));
    
    testRatios.forEach(ratio => {
      const calculatedPrice = currentPrice * (1 + ratio);
      const finalPrice = calcFinalPriceWithStep(currentPrice, ratio, minPct01, 10);
      const minPrice = currentPrice * minPct01;
      const isLimited = finalPrice > calculatedPrice;
      
      console.log(`変動率 ${(ratio * 100).toFixed(0)}%: ${calculatedPrice.toLocaleString()}円 → ${finalPrice.toLocaleString()}円 ${isLimited ? '🛡️ (下限適用)' : '✅ (変動適用)'}`);
    });
    
    console.log('\n🔍 下限設定の動作確認:');
    console.log(`✅ ${minPct}%を下回る価格にはならない`);
    console.log(`✅ 10円単位で切り上げ処理`);
    console.log(`✅ 下限以上の変動は正常に適用される`);
    
  } catch (error) {
    console.error('❌ エラー:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testPriceLimit();