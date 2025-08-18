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
    
    // K18の価格情報を抽出
    const priceMatch = html.match(/K18.*?(\d{1,3}(?:,\d{3})*)/);
    const changeMatch = html.match(/前日比[^円\-+]*([+\-]?\d+(?:\.\d+)?)[^0-9]*円/i) ||
                       html.match(/変動[^円\-+]*([+\-]?\d+(?:\.\d+)?)[^0-9]*円/i);
    
    if (!priceMatch || !changeMatch) {
      return {
        success: false,
        error: '金価格データの抽出に失敗',
        htmlLength: html.length,
        priceMatch: priceMatch ? priceMatch[0] : null,
        changeMatch: changeMatch ? changeMatch[0] : null
      };
    }
    
    const retailPrice = parseInt(priceMatch[1].replace(/,/g, ''));
    const changeYen = parseFloat(changeMatch[1]);
    const changeRatio = changeYen / retailPrice;
    
    return {
      success: true,
      retailPrice,
      changeYen,
      changeRatio,
      changePercent: (changeRatio * 100).toFixed(2) + '%',
      priceMatch: priceMatch[0],
      changeMatch: changeMatch[0]
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
  
  if (test === 'shop-settings') {
    try {
      const enabledShops = await prisma.shopSetting.findMany({
        where: { autoUpdateEnabled: true },
        select: { shopDomain: true, minPricePct: true, autoUpdateEnabled: true }
      });
      
      const allShops = await prisma.shopSetting.findMany({
        select: { shopDomain: true, minPricePct: true, autoUpdateEnabled: true }
      });
      
      return json({
        test: 'shop-settings',
        timestamp: new Date().toISOString(),
        enabledShops,
        allShops,
        totalShops: allShops.length,
        enabledCount: enabledShops.length
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