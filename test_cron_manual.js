import { PrismaClient } from '@prisma/client';
import { fetchGoldPriceDataTanaka, fetchPlatinumPriceDataTanaka } from './app/models/gold.server.ts';

const prisma = new PrismaClient();

async function testCronLogic() {
  try {
    console.log('🧪 手動でcronロジックをテスト実行');
    console.log('📅 現在時刻:', new Date().toLocaleString('ja-JP'));
    console.log('=' + '='.repeat(50));

    // 1) 金・プラチナ価格変動率取得
    console.log('\n💰 金・プラチナ価格データ取得中...');
    const [goldData, platinumData] = await Promise.all([
      fetchGoldPriceDataTanaka(),
      fetchPlatinumPriceDataTanaka()
    ]);

    const gold = goldData && goldData.changeRatio !== null ? goldData.changeRatio : null;
    const platinum = platinumData && platinumData.changeRatio !== null ? platinumData.changeRatio : null;

    console.log(`📊 金価格情報: ${goldData?.retailPriceFormatted}, 前日比: ${goldData?.changePercent}, 変動率: ${gold ? (gold * 100).toFixed(2) + '%' : 'N/A'}`);
    console.log(`📊 プラチナ価格情報: ${platinumData?.retailPriceFormatted}, 前日比: ${platinumData?.changePercent}, 変動率: ${platinum ? (platinum * 100).toFixed(2) + '%' : 'N/A'}`);

    // 2) 自動更新有効なショップ取得
    console.log('\n🏪 自動更新有効なショップを確認中...');
    const enabledShops = await prisma.shopSetting.findMany({
      where: { autoUpdateEnabled: true },
      select: { shopDomain: true }
    });

    console.log(`📈 自動更新有効ショップ数: ${enabledShops.length}`);
    enabledShops.forEach(shop => {
      console.log(`  - ${shop.shopDomain}`);
    });

    // 3) 各ショップの対象商品数確認
    for (const shop of enabledShops) {
      const targets = await prisma.selectedProduct.findMany({
        where: { 
          shopDomain: shop.shopDomain,
          selected: true,
        },
        select: { productId: true, metalType: true },
      });

      const goldTargets = targets.filter(t => (t.metalType || '').trim().toLowerCase() === 'gold');
      const platinumTargets = targets.filter(t => (t.metalType || '').trim().toLowerCase() === 'platinum');

      console.log(`\n🎯 ${shop.shopDomain}:`);
      console.log(`   総対象商品: ${targets.length}件`);
      console.log(`   金商品: ${goldTargets.length}件`);
      console.log(`   プラチナ商品: ${platinumTargets.length}件`);

      // セッション確認
      const session = await prisma.session.findFirst({
        where: { 
          shop: shop.shopDomain,
          isOnline: false
        },
        orderBy: { expires: 'desc' }
      });

      console.log(`   セッション: ${session ? '✅ 有効' : '❌ 無効'}`);
    }

    // 4) 価格変動判定
    console.log('\n📊 価格更新実行判定:');
    
    const goldNoChange = gold === 0;
    const platinumNoChange = platinum === 0;
    
    if (goldNoChange && platinumNoChange) {
      console.log('❌ 金・プラチナ両方とも変動なし - 価格更新スキップ');
      return;
    }

    if (gold !== null) {
      console.log(`💰 金価格変動: ${(gold * 100).toFixed(4)}% - ${Math.abs(gold) >= 0.005 ? '✅ 更新対象' : '⏭️ スキップ（0.5%未満）'}`);
    }

    if (platinum !== null) {
      console.log(`💎 プラチナ価格変動: ${(platinum * 100).toFixed(4)}% - ${Math.abs(platinum) >= 0.005 ? '✅ 更新対象' : '⏭️ スキップ（0.5%未満）'}`);
    }

    console.log('\n✅ Cronロジックテスト完了');

  } catch (error) {
    console.error('❌ テスト実行エラー:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testCronLogic();