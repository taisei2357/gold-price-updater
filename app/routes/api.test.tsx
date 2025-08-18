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
    
    // 新しいサイト構造に対応した価格抽出
    let retailPrice: number | null = null;
    let changeYen: number | null = null;

    // 価格パターン
    const k18Patterns = [
      /K18.*?(\d{1,3}(?:,\d{3})*)\s*円/gi,
      /18金.*?(\d{1,3}(?:,\d{3})*)\s*円/gi,
      /<td[^>]*retail_tax[^>]*>([^<]*(\d{1,3}(?:,\d{3})*)[^<]*円)/gi,
      /(\d{1,3}(?:,\d{3})*)\s*円(?!.*前日比)/g
    ];

    let priceMatchResult = null;
    for (const pattern of k18Patterns) {
      const matches = [...html.matchAll(pattern)];
      if (matches.length > 0) {
        const priceStr = matches[0][1] || matches[0][2];
        if (priceStr) {
          const price = parseInt(priceStr.replace(/,/g, ''));
          if (price > 10000 && price < 50000) {
            retailPrice = price;
            priceMatchResult = matches[0][0];
            break;
          }
        }
      }
    }

    // 前日比パターン
    const changePatterns = [
      /前日比[^円\-+\d]*([+\-]?\d+(?:\.\d+)?)[^0-9]*円/gi,
      /変動[^円\-+\d]*([+\-]?\d+(?:\.\d+)?)[^0-9]*円/gi,
      /([+\-]\d+(?:\.\d+)?)\s*円.*?前日比/gi,
      /<td[^>]*>([+\-]?\d+(?:\.\d+)?)\s*円<\/td>/gi
    ];

    let changeMatchResult = null;
    for (const pattern of changePatterns) {
      const matches = [...html.matchAll(pattern)];
      if (matches.length > 0) {
        const changeStr = matches[0][1];
        const change = parseFloat(changeStr);
        if (!isNaN(change) && Math.abs(change) <= 1000) {
          changeYen = change;
          changeMatchResult = matches[0][0];
          break;
        }
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