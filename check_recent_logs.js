import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkRecentLogs() {
  try {
    console.log('🔍 最近の価格更新ログ確認');
    console.log('=' * 50);
    
    // 最近の価格更新ログを取得
    const recentLogs = await prisma.priceUpdateLog.findMany({
      orderBy: { executedAt: 'desc' },
      take: 10
    });
    
    console.log(`📊 最近の価格更新ログ: ${recentLogs.length}件`);
    
    if (recentLogs.length === 0) {
      console.log('❌ 価格更新ログが見つかりません');
      return;
    }
    
    recentLogs.forEach((log, index) => {
      const date = new Date(log.executedAt);
      console.log(`\n[${index + 1}] ${date.toLocaleString('ja-JP')}`);
      console.log(`   Shop: ${log.shopDomain}`);
      console.log(`   Type: ${log.executionType}`);
      console.log(`   Success: ${log.success}`);
      console.log(`   Metal: ${log.metalType}`);
      console.log(`   Price Ratio: ${log.priceRatio}`);
      console.log(`   Products: ${log.totalProducts} (更新: ${log.updatedCount}, 失敗: ${log.failedCount})`);
      if (log.errorMessage) {
        console.log(`   Error: ${log.errorMessage}`);
      }
    });
    
    // 今日のログを特別にチェック
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const todayLogs = await prisma.priceUpdateLog.findMany({
      where: {
        executedAt: {
          gte: today,
          lt: tomorrow
        }
      },
      orderBy: { executedAt: 'desc' }
    });
    
    console.log(`\n📅 本日の価格更新ログ: ${todayLogs.length}件`);
    
    if (todayLogs.length === 0) {
      console.log('❌ 本日は価格更新が実行されていません');
    } else {
      todayLogs.forEach((log, index) => {
        console.log(`\n  [今日${index + 1}] ${new Date(log.executedAt).toLocaleTimeString('ja-JP')}`);
        console.log(`     Success: ${log.success}, Metal: ${log.metalType}, Ratio: ${log.priceRatio}`);
      });
    }
    
    // 金価格データも確認
    console.log('\n🥇 現在の金・プラチナ価格データ確認');
    
    // 金価格取得をテスト
    const { fetchGoldPriceDataTanaka, fetchPlatinumPriceDataTanaka } = await import('../models/gold.server.js');
    
    try {
      const goldData = await fetchGoldPriceDataTanaka();
      const platinumData = await fetchPlatinumPriceDataTanaka();
      
      console.log('\n💰 現在の金価格データ:');
      console.log(`   変動率: ${goldData.changeRatio} (${(goldData.changeRatio * 100).toFixed(2)}%)`);
      console.log(`   変動方向: ${goldData.changeDirection}`);
      console.log(`   小売価格: ${goldData.retailPriceFormatted}`);
      console.log(`   最終更新: ${goldData.lastUpdated}`);
      
      console.log('\n💎 現在のプラチナ価格データ:');
      console.log(`   変動率: ${platinumData.changeRatio} (${(platinumData.changeRatio * 100).toFixed(2)}%)`);
      console.log(`   変動方向: ${platinumData.changeDirection}`);
      console.log(`   小売価格: ${platinumData.retailPriceFormatted}`);
      console.log(`   最終更新: ${platinumData.lastUpdated}`);
      
      // 価格差チェック
      const goldRatio = goldData.changeRatio || 0;
      const platinumRatio = platinumData.changeRatio || 0;
      console.log(`\n📊 価格変動分析:`);
      console.log(`   金変動率: ${(goldRatio * 100).toFixed(4)}%`);
      console.log(`   プラチナ変動率: ${(platinumRatio * 100).toFixed(4)}%`);
      console.log(`   価格差: ${Math.abs(goldRatio - platinumRatio).toFixed(6)}`);
      
      if (Math.abs(goldRatio) < 0.005 && Math.abs(platinumRatio) < 0.005) {
        console.log('⚠️ 両方の変動率が0.5%未満 - 価格更新がスキップされる可能性があります');
      }
      
    } catch (priceError) {
      console.log(`❌ 価格データ取得エラー: ${priceError.message}`);
    }
    
  } catch (error) {
    console.error('❌ エラー:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkRecentLogs();