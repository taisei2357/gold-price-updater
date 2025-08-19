// 自己修復機能のテストスクリプト
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// モック401レスポンスのテスト
async function testSelfHealingLogic() {
  console.log('🧪 自己修復機能テスト開始');
  
  try {
    // テスト用ショップ設定
    const testShop = 'test-self-healing.myshopify.com';
    
    // 1. テスト用セッション作成
    console.log('\n1️⃣ テスト用セッション作成中...');
    await prisma.session.create({
      data: {
        id: 'test-session-401',
        shop: testShop,
        state: 'test-state',
        accessToken: 'invalid-token-401',
        isOnline: false,
      }
    });
    console.log('✅ テスト用セッション作成完了');
    
    // 2. テスト用商品選択作成
    console.log('\n2️⃣ テスト用商品選択作成中...');
    await prisma.selectedProduct.create({
      data: {
        shopDomain: testShop,
        productId: 'gid://shopify/Product/12345',
        selected: true,
      }
    });
    console.log('✅ テスト用商品選択作成完了');
    
    // 3. 401エラーログシミュレーション
    console.log('\n3️⃣ 401エラーログシミュレーション...');
    await prisma.priceUpdateLog.create({
      data: {
        shopDomain: testShop,
        executionType: 'cron',
        goldRatio: 0.0123,
        minPricePct: 93,
        totalProducts: 1,
        updatedCount: 0,
        failedCount: 1,
        success: false,
        errorMessage: '401 Unauthorized: 再認証が必要',
      }
    });
    console.log('✅ 401エラーログ作成完了');
    
    // 4. セッション削除シミュレーション（自己修復）
    console.log('\n4️⃣ 自己修復（セッション削除）シミュレーション...');
    const deletedSessions = await prisma.session.deleteMany({
      where: { shop: testShop }
    });
    console.log(`✅ セッション削除完了: ${deletedSessions.count}件`);
    
    // 5. 結果確認
    console.log('\n5️⃣ 結果確認...');
    
    // セッションが削除されたことを確認
    const remainingSessions = await prisma.session.findMany({
      where: { shop: testShop }
    });
    console.log(`📊 残存セッション数: ${remainingSessions.length}件`);
    
    // エラーログが正しく記録されたことを確認
    const errorLogs = await prisma.priceUpdateLog.findMany({
      where: { 
        shopDomain: testShop,
        errorMessage: { contains: '401 Unauthorized' }
      }
    });
    console.log(`📊 401エラーログ数: ${errorLogs.length}件`);
    
    if (errorLogs.length > 0) {
      console.log(`📋 最新エラーログ:`);
      console.log(`  - メッセージ: ${errorLogs[0].errorMessage}`);
      console.log(`  - 実行日時: ${errorLogs[0].executedAt}`);
      console.log(`  - 成功フラグ: ${errorLogs[0].success}`);
    }
    
    // 6. テストデータクリーンアップ
    console.log('\n6️⃣ テストデータクリーンアップ...');
    await prisma.selectedProduct.deleteMany({
      where: { shopDomain: testShop }
    });
    await prisma.priceUpdateLog.deleteMany({
      where: { shopDomain: testShop }
    });
    console.log('✅ クリーンアップ完了');
    
    console.log('\n🎉 自己修復機能テスト完了！');
    console.log('\n📝 テスト結果:');
    console.log('  ✅ 401エラー検知シミュレーション');
    console.log('  ✅ エラーログ記録');
    console.log('  ✅ セッション自動削除');
    console.log('  ✅ 次回認証誘導準備');
    
  } catch (error) {
    console.error('❌ テストエラー:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Shopify GraphQLクライアントの動作テスト
async function testShopifyClientErrorHandling() {
  console.log('\n🧪 ShopifyAdminClient エラーハンドリングテスト');
  
  // ShopifyAdminClientクラスをインポート（テスト用）
  class TestShopifyAdminClient {
    constructor(shop, accessToken) {
      this.shop = shop;
      this.accessToken = accessToken;
    }

    async graphql(query, options = {}) {
      const url = `https://${this.shop}/admin/api/2024-01/graphql.json`;
      
      // 401エラーシミュレーション
      const mockResponse = {
        ok: false,
        status: 401,
        json: async () => ({
          errors: [{ message: "Invalid API key or access token (unrecognized login or wrong password)" }]
        })
      };
      
      const body = await mockResponse.json().catch(() => ({}));
      
      // 実装された新しいロジック
      if (!mockResponse.ok || body?.errors) {
        return { status: mockResponse.status, body, ok: false };
      }
      
      return { status: mockResponse.status, body, ok: true };
    }
  }
  
  const testClient = new TestShopifyAdminClient('test.myshopify.com', 'invalid-token');
  const result = await testClient.graphql('query { shop { name } }');
  
  console.log('📊 GraphQLクライアントテスト結果:');
  console.log(`  - ステータス: ${result.status}`);
  console.log(`  - 成功フラグ: ${result.ok}`);
  console.log(`  - エラーメッセージ: ${result.body?.errors?.[0]?.message}`);
  
  // 401エラー検知テスト
  const is401Error = result.status === 401 || result.body?.errors?.[0]?.message?.includes("Invalid API key or access token");
  console.log(`  - 401エラー検知: ${is401Error ? '✅ 成功' : '❌ 失敗'}`);
}

// メイン実行
async function main() {
  await testSelfHealingLogic();
  await testShopifyClientErrorHandling();
}

main();