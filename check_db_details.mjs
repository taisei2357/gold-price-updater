// データベース詳細確認用スクリプト
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkDatabaseDetails() {
  try {
    console.log('🔍 データベース詳細確認...');
    
    // 1. 自動更新ONか
    console.log('\n📊 ショップ設定詳細:');
    const shopSettings = await prisma.shopSetting.findMany();
    shopSettings.forEach(shop => {
      console.log(`- ${shop.shopDomain}:`);
      console.log(`  自動更新: ${shop.autoUpdateEnabled ? 'ON' : 'OFF'}`);
      console.log(`  最小価格率: ${shop.minPricePct}%`);
      console.log(`  通知メール: ${shop.notificationEmail || 'なし'}`);
      console.log(`  連続失敗: ${shop.consecutiveFailures}回`);
    });

    // 2. オフラインセッションがあるか
    console.log('\n🔐 セッション詳細:');
    const sessions = await prisma.session.findMany({
      where: { isOnline: false }
    });
    sessions.forEach(session => {
      const hasToken = !!session.accessToken;
      const tokenLength = session.accessToken ? session.accessToken.length : 0;
      console.log(`- ${session.shop}:`);
      console.log(`  オンライン: ${session.isOnline ? 'YES' : 'NO'}`);
      console.log(`  トークン: ${hasToken ? 'あり' : 'なし'} (${tokenLength}文字)`);
      console.log(`  期限: ${session.expires ? session.expires.toISOString() : 'なし'}`);
    });

    // 3. 対象商品があるか
    console.log('\n📦 選択商品詳細:');
    const productCounts = await prisma.selectedProduct.groupBy({
      by: ['shopDomain', 'metalType'],
      _count: { _all: true },
      where: { selected: true }
    });
    productCounts.forEach(count => {
      console.log(`- ${count.shopDomain} (${count.metalType}): ${count._count._all}件`);
    });

    // 4. 最新の価格更新ログ（より詳細）
    console.log('\n📋 最新価格更新ログ（詳細）:');
    const recentLogs = await prisma.priceUpdateLog.findMany({
      orderBy: { executedAt: 'desc' },
      take: 5
    });
    
    recentLogs.forEach(log => {
      console.log(`\n- ${log.executedAt.toISOString()} | ${log.shopDomain}`);
      console.log(`  実行種別: ${log.executionType} | 金属: ${log.metalType}`);
      console.log(`  成功: ${log.success} | 更新: ${log.updatedCount}件 | 失敗: ${log.failedCount}件`);
      console.log(`  価格変動率: ${log.priceRatio ? (log.priceRatio * 100).toFixed(2) + '%' : 'N/A'}`);
      console.log(`  対象商品数: ${log.totalProducts}件 | 最小価格率: ${log.minPricePct}%`);
      if (log.errorMessage) {
        console.log(`  エラー: ${log.errorMessage}`);
      }
    });

  } catch (error) {
    console.error('❌ データベース詳細確認エラー:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabaseDetails();