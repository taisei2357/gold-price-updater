// Test endpoint with gold price and cron testing
import { json } from "@remix-run/node";
import type { LoaderFunction, ActionFunction } from "@remix-run/node";
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 金価格変動率を取得（テスト用）
async function fetchGoldChangeRatioTanaka() {
  try {
    const response = await fetch('https://gold.tanaka.co.jp/commodity/souba/');
    const html = await response.text();
    
    console.log('HTML取得成功、長さ:', html.length);
    
    // 正確なHTML構造に基づく価格抽出
    // class="gold"のテーブル行から正確に抽出
    let retailPrice: number | null = null;
    let changeYen: number | null = null;
    let priceMatchResult = null;
    let changeMatchResult = null;

    // 金のテーブル行を取得（class="gold"）
    const goldRowMatch = html.match(/<tr[^>]*class="gold"[^>]*>.*?<\/tr>/is);
    if (goldRowMatch) {
      const goldRow = goldRowMatch[0];
      
      // 小売価格抽出: class="retail_tax"のセル
      const priceMatch = goldRow.match(/<td[^>]*class="retail_tax"[^>]*>([\d,]+)\s*円/);
      if (priceMatch) {
        retailPrice = parseInt(priceMatch[1].replace(/,/g, ''));
        priceMatchResult = priceMatch[0];
      }
      
      // 前日比抽出: class="retail_ratio"のセル
      const changeMatch = goldRow.match(/<td[^>]*class="retail_ratio"[^>]*>([+\-]?\d+(?:\.\d+)?)\s*[　\s]*円/);
      if (changeMatch) {
        changeYen = parseFloat(changeMatch[1]);
        changeMatchResult = changeMatch[0];
      }
    }

    if (!retailPrice || changeYen === null) {
      // デバッグ情報
      const priceContexts = html.match(/.{0,50}(\d{1,3}(?:,\d{3})*)\s*円.{0,50}/gi);
      const changeContexts = html.match(/.{0,50}前日比.{0,50}/gi);
      
      return {
        success: false,
        error: '金価格データの抽出に失敗',
        htmlLength: html.length,
        retailPrice,
        changeYen,
        priceMatchResult,
        changeMatchResult,
        priceContexts: priceContexts?.slice(0, 5),
        changeContexts: changeContexts?.slice(0, 3)
      };
    }
    
    const changeRatio = changeYen / retailPrice;
    
    return {
      success: true,
      retailPrice,
      changeYen,
      changeRatio,
      changePercent: (changeRatio * 100).toFixed(2) + '%',
      priceMatchResult,
      changeMatchResult
    };
    
  } catch (error) {
    console.error('金価格取得エラー:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const test = url.searchParams.get('test');
  
  if (test === 'gold-price') {
    const result = await fetchGoldChangeRatioTanaka();
    return json({
      test: 'gold-price',
      timestamp: new Date().toISOString(),
      ...result
    });
  }
  
  if (test === 'platinum-price') {
    try {
      // プラチナ価格取得（直接実装）
      const url = "https://gold.tanaka.co.jp/commodity/souba/d-platinum.php";
      const resp = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
      if (!resp.ok) throw new Error(`Tanaka request failed: ${resp.status}`);
      const html = await resp.text();

      let retailPrice: number | null = null;
      let changeYen: number | null = null;

      // プラチナのテーブル行を取得（class="pt"）
      const platinumRowMatch = html.match(/<tr[^>]*class="pt"[^>]*>.*?<\/tr>/is);
      if (platinumRowMatch) {
        const platinumRow = platinumRowMatch[0];
        
        // 小売価格抽出: class="retail_tax"のセル
        const priceMatch = platinumRow.match(/<td[^>]*class="retail_tax"[^>]*>([\d,]+)\s*円/);
        if (priceMatch) {
          retailPrice = parseInt(priceMatch[1].replace(/,/g, ''));
        }
        
        // 前日比抽出: class="retail_ratio"のセル
        const changeMatch = platinumRow.match(/<td[^>]*class="retail_ratio"[^>]*>([+\-]?\d+(?:\.\d+)?)\s*[　\s]*円/);
        if (changeMatch) {
          changeYen = parseFloat(changeMatch[1]);
        }
      }

      // 変動率計算
      const changeRatio = (changeYen !== null && retailPrice !== null) 
        ? changeYen / retailPrice 
        : null;

      return json({
        test: 'platinum-price',
        timestamp: new Date().toISOString(),
        success: retailPrice !== null && changeYen !== null,
        retailPrice,
        changeYen,
        changeRatio,
        changePercent: changeRatio ? (changeRatio * 100).toFixed(2) + '%' : null,
        retailPriceFormatted: retailPrice ? `¥${retailPrice.toLocaleString()}/g` : '取得失敗'
      });
    } catch (error) {
      return json({
        test: 'platinum-price',
        timestamp: new Date().toISOString(),
        success: false,
        error: error.message
      });
    }
  }
  
  if (test === 'shop-settings') {
    try {
      const enabledShops = await prisma.shopSetting.findMany({
        where: { autoUpdateEnabled: true },
        select: { shopDomain: true, minPricePct: true, autoUpdateEnabled: true }
      });
      
      const allShops = await prisma.shopSetting.findMany({
        select: { shopDomain: true, minPricePct: true, autoUpdateEnabled: true }
      });
      
      // 選択商品数も取得
      const selectedProducts = await prisma.selectedProduct.findMany({
        where: { shopDomain: 'luxrexor2.myshopify.com', selected: true },
        select: { shopDomain: true, productId: true }
      });
      
      return json({
        test: 'shop-settings',
        timestamp: new Date().toISOString(),
        enabledShops,
        allShops,
        totalShops: allShops.length,
        enabledCount: enabledShops.length,
        selectedProducts: selectedProducts.length,
        selectedProductIds: selectedProducts.map(p => p.productId.split('/').pop()) // ID部分のみ
      });
    } catch (error) {
      return json({
        test: 'shop-settings',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    } finally {
      await prisma.$disconnect();
    }
  }
  
  return json({ 
    status: "ready", 
    message: "Test endpoint is ready. Use ?test=gold-price or ?test=shop-settings for specific tests",
    timestamp: new Date().toISOString()
  });
};

// Cron実行をテストするためのPOSTエンドポイント
export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const action = formData.get("action");
  
  if (action === "test-cron") {
    try {
      // Cron APIを内部で呼び出し
      const cronResponse = await fetch(`${new URL(request.url).origin}/api/cron/price-update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      const cronData = await cronResponse.json();
      
      return json({
        action: 'test-cron',
        cronStatus: cronResponse.status,
        cronData,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      return json({
        action: 'test-cron',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }
  
  return json({ 
    status: "success", 
    message: "API endpoint is working. Use action=test-cron to test cron execution",
    timestamp: new Date().toISOString()
  });
};