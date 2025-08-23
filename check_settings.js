// 価格下限設定確認スクリプト
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://neondb_owner:npg_2tIky1uxoZjH@ep-rough-flower-a15ccwud-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&pgbouncer=true&connect_timeout=5"
    }
  }
});

async function checkSettings() {
  try {
    const settings = await prisma.shopSetting.findMany({
      select: {
        shopDomain: true,
        minPricePct: true,
        autoUpdateEnabled: true
      }
    });
    
    console.log('📊 現在の価格下限設定:');
    settings.forEach(setting => {
      console.log(`- ${setting.shopDomain}: ${setting.minPricePct}% (自動更新: ${setting.autoUpdateEnabled ? 'ON' : 'OFF'})`);
    });
    
    // テスト計算例
    console.log('\n💡 価格下限テスト例 (現在価格10万円):');
    const testPrice = 100000;
    settings.forEach(setting => {
      const minPrice = testPrice * (setting.minPricePct / 100);
      console.log(`- ${setting.shopDomain}: 最低価格 ${minPrice.toLocaleString()}円`);
    });
    
  } catch (error) {
    console.error('❌ エラー:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkSettings();