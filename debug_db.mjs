// データベース状態確認用スクリプト
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkDatabase() {
  try {
    console.log('🔍 データベース接続確認...');
    
    // 1. ショップ設定確認
    const shopSettings = await prisma.shopSetting.findMany({
      select: {
        shopDomain: true,
        autoUpdateEnabled: true,
        minPricePct: true,
        notificationEmail: true
      }
    });
    console.log('\n📊 ショップ設定:');
    shopSettings.forEach(shop => {
      console.log(`  - ${shop.shopDomain}: 自動更新${shop.autoUpdateEnabled ? '有効' : '無効'}, 下限${shop.minPricePct}%`);
    });

    // 2. セッション確認 
    const sessions = await prisma.session.findMany({
      select: {
        shop: true,
        isOnline: true,
        expires: true,
        accessToken: true
      },
      orderBy: { expires: 'desc' },
      take: 5
    });
    console.log('\n🔐 セッション状況:');
    sessions.forEach(session => {
      const hasToken = !!session.accessToken;
      const expiry = session.expires ? session.expires.toISOString() : 'なし';
      console.log(`  - ${session.shop}: ${session.isOnline ? 'オンライン' : 'オフライン'}, トークン${hasToken ? 'あり' : 'なし'}, 期限: ${expiry}`);
    });

    // 3. 選択商品確認
    const selectedProducts = await prisma.selectedProduct.findMany({
      select: {
        shopDomain: true,
        productId: true,
        metalType: true,
        selected: true,
        updatedAt: true
      },
      orderBy: { updatedAt: 'desc' },
      take: 10
    });
    console.log('\n📦 選択商品状況:');
    selectedProducts.forEach(product => {
      console.log(`  - ${product.shopDomain}: ${product.productId.substring(0, 30)}... (${product.metalType}, ${product.selected ? '選択済' : '未選択'})`);
    });

    // 4. 価格更新ログ確認
    const updateLogs = await prisma.priceUpdateLog.findMany({
      select: {
        shopDomain: true,
        executionType: true,
        metalType: true,
        success: true,
        updatedCount: true,
        failedCount: true,
        errorMessage: true,
        executedAt: true
      },
      orderBy: { executedAt: 'desc' },
      take: 10
    });
    console.log('\n📋 最新の価格更新ログ:');
    updateLogs.forEach(log => {
      const status = log.success ? '成功' : '失敗';
      const time = log.executedAt.toISOString();
      console.log(`  - ${log.shopDomain} (${log.executionType}, ${log.metalType}): ${status}, 更新${log.updatedCount}件, 失敗${log.failedCount}件 - ${time}`);
      if (log.errorMessage) {
        console.log(`    エラー: ${log.errorMessage}`);
      }
    });

  } catch (error) {
    console.error('❌ データベース確認エラー:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();