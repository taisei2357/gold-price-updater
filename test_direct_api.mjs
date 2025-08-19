// 直接データベースとShopify APIをテストするスクリプト
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testSelectedProducts() {
  try {
    console.log('🔍 選択商品を確認中...');
    
    // 1. 選択商品の確認
    const selectedProducts = await prisma.selectedProduct.findMany({
      select: {
        shopDomain: true,
        productId: true,
        selected: true,
        createdAt: true
      }
    });
    
    console.log(`📋 選択商品数: ${selectedProducts.length}`);
    selectedProducts.forEach((product, i) => {
      console.log(`${i + 1}. ${product.shopDomain} - ${product.productId} (選択: ${product.selected})`);
    });
    
    // 2. ショップ設定の確認
    const shopSettings = await prisma.shopSetting.findMany({
      select: {
        shopDomain: true,
        autoUpdateEnabled: true,
        minPricePct: true,
        autoUpdateHour: true
      }
    });
    
    console.log(`\n🏪 ショップ設定数: ${shopSettings.length}`);
    shopSettings.forEach((shop, i) => {
      console.log(`${i + 1}. ${shop.shopDomain}`);
      console.log(`   自動更新: ${shop.autoUpdateEnabled}`);
      console.log(`   最小価格%: ${shop.minPricePct}`);
      console.log(`   更新時間: ${shop.autoUpdateHour}時`);
    });
    
    // 3. セッション情報の確認
    const sessions = await prisma.session.findMany({
      select: {
        shop: true,
        accessToken: true,
        expires: true,
        isOnline: true
      }
    });
    
    console.log(`\n🔑 セッション数: ${sessions.length}`);
    sessions.forEach((session, i) => {
      console.log(`${i + 1}. ${session.shop}`);
      console.log(`   トークン: ${session.accessToken ? 'あり' : 'なし'}`);
      console.log(`   有効期限: ${session.expires || 'なし'}`);
      console.log(`   オンライン: ${session.isOnline}`);
    });
    
    // 4. 最近の価格更新ログ
    const logs = await prisma.priceUpdateLog.findMany({
      orderBy: { executedAt: 'desc' },
      take: 5,
      select: {
        shopDomain: true,
        executionType: true,
        goldRatio: true,
        totalProducts: true,
        updatedCount: true,
        failedCount: true,
        success: true,
        errorMessage: true,
        executedAt: true
      }
    });
    
    console.log(`\n📊 最近の更新ログ (最新5件):`);
    logs.forEach((log, i) => {
      console.log(`${i + 1}. ${log.executedAt} - ${log.shopDomain}`);
      console.log(`   実行タイプ: ${log.executionType}`);
      console.log(`   金変動率: ${log.goldRatio ? (log.goldRatio * 100).toFixed(4) + '%' : 'なし'}`);
      console.log(`   成功: ${log.success}, 更新: ${log.updatedCount}, 失敗: ${log.failedCount}`);
      if (log.errorMessage) {
        console.log(`   エラー: ${log.errorMessage}`);
      }
    });
    
  } catch (error) {
    console.error('❌ データベースエラー:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testSelectedProducts();