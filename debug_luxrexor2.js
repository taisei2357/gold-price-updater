// luxrexor2ストアの特定商品デバッグ
import { PrismaClient } from '@prisma/client';

const PRODUCT_ID = "8550972227750";

async function main() {
  const prisma = new PrismaClient();
  
  try {
    console.log(`🔍 商品ID ${PRODUCT_ID} の詳細確認 (luxrexor2)`);
    
    // セッションからshop情報取得
    const sessions = await prisma.session.findMany({
      where: {
        shop: {
          contains: 'luxrexor2'
        }
      },
      orderBy: {
        expires: 'desc'
      },
      take: 1
    });
    
    if (sessions.length === 0) {
      console.log('❌ luxrexor2のセッションが見つかりません');
      return;
    }
    
    const session = sessions[0];
    console.log(`✅ セッション発見: ${session.shop}`);
    console.log(`アクセストークン: ${session.accessToken ? '設定済み' : '未設定'}`);
    
    // Shopify Admin APIで商品情報取得
    if (session.accessToken) {
      const url = `https://${session.shop}/admin/api/2024-01/products/${PRODUCT_ID}.json`;
      
      const response = await fetch(url, {
        headers: {
          'X-Shopify-Access-Token': session.accessToken,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        const product = data.product;
        
        console.log(`\n📦 商品情報:`);
        console.log(`商品名: ${product.title}`);
        console.log(`ID: ${product.id}`);
        console.log(`バリエーション数: ${product.variants.length}`);
        
        product.variants.forEach((variant, index) => {
          console.log(`\n  バリエーション ${index + 1}:`);
          console.log(`    ID: ${variant.id}`);
          console.log(`    価格: ${variant.price}`);
          console.log(`    SKU: ${variant.sku || 'なし'}`);
          console.log(`    タイトル: ${variant.title}`);
        });
        
        // K18商品かチェック
        const isK18 = product.title.includes('K18');
        console.log(`\n🔍 K18商品判定: ${isK18 ? 'はい' : 'いいえ'}`);
        
      } else {
        console.log(`❌ 商品取得失敗: ${response.status}`);
        const text = await response.text();
        console.log(text);
      }
    }
    
  } catch (error) {
    console.error('❌ エラー:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();