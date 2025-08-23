// 価格更新テストスクリプト
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://neondb_owner:npg_2tIky1uxoZjH@ep-rough-flower-a15ccwud-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&pgbouncer=true&connect_timeout=5"
    }
  }
});

async function testPriceUpdate() {
  try {
    // 1) 現在選択されている商品を確認
    const selectedProducts = await prisma.selectedProduct.findMany({
      select: {
        productId: true,
        metalType: true,
        shopDomain: true
      }
    });
    
    console.log('📊 現在選択されている商品:');
    if (selectedProducts.length === 0) {
      console.log('❌ 選択されている商品がありません');
      return;
    }
    
    // 金属種別ごとに集計
    const goldProducts = selectedProducts.filter(p => p.metalType === 'gold');
    const platinumProducts = selectedProducts.filter(p => p.metalType === 'platinum');
    
    console.log(`🥇 金商品: ${goldProducts.length}件`);
    console.log(`🥈 プラチナ商品: ${platinumProducts.length}件`);
    
    selectedProducts.forEach((product, index) => {
      const icon = product.metalType === 'gold' ? '🥇' : '🥈';
      console.log(`  ${index + 1}. ${icon} ${product.productId} (${product.metalType})`);
    });

    // 2) ショップ設定を確認
    const setting = await prisma.shopSetting.findFirst({
      select: {
        shopDomain: true,
        minPricePct: true,
        autoUpdateEnabled: true
      }
    });
    
    if (setting) {
      console.log(`⚙️ ショップ設定 (${setting.shopDomain}):`);
      console.log(`- 価格下限: ${setting.minPricePct}%`);
      console.log(`- 自動更新: ${setting.autoUpdateEnabled ? 'ON' : 'OFF'}`);
    }
    
  } catch (error) {
    console.error('❌ エラー:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testPriceUpdate();