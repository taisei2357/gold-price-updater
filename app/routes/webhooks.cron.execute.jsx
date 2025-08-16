// Vercel Cron から呼び出される専用エンドポイント
// 既存の api.cron.price-update.tsx と同じ処理を実行

import { authenticate } from "../shopify.server";
import prisma from "../db.server";
import { runBulkUpdateBySpec } from "../models/price.server";
import { shouldRunNowJST } from "../models/scheduler.server";

/**
 * 自動価格更新を実行（Vercel Cron用）
 */
async function executeAutoUpdate(shopDomain, admin, shop, force = false) {
  try {
    // 1. ショップ設定を取得
    const shopSetting = await prisma.shopSetting.findUnique({
      where: { shopDomain }
    });
    
    const targetHour = shopSetting?.autoUpdateHour || 10;
    
    // 2. 実行時刻チェック（forceモードではスキップ）
    if (!force && !shouldRunNowJST(targetHour)) {
      return {
        success: false,
        message: `自動実行時間外です（平日${String(targetHour).padStart(2, '0')}:00のみ実行）`,
        skipped: true
      };
    }

    // 3. 選択済み商品取得
    const selectedProducts = await prisma.selectedProduct.findMany({
      where: { 
        shopDomain,
        selected: true 
      }
    });

    if (selectedProducts.length === 0) {
      return {
        success: false,
        message: "選択された商品がありません"
      };
    }

    // 4. 価格更新実行
    const result = await runBulkUpdateBySpec(admin, shopDomain);
    
    // 5. ログ記録
    await prisma.priceUpdateLog.create({
      data: {
        shopDomain,
        executionType: "auto",
        goldRatio: result.goldRatio || null,
        minPricePct: shopSetting?.minPricePct || 93,
        totalProducts: selectedProducts.length,
        updatedCount: result.updated || 0,
        failedCount: result.failed || 0,
        success: result.ok || false,
        errorMessage: result.ok ? null : result.reason,
        details: JSON.stringify(result.details || [])
      }
    });

    return {
      success: result.ok,
      message: result.message || `${result.updated || 0}件の商品価格を更新しました`,
      details: result
    };
  } catch (error) {
    console.error("Auto update error:", error);
    
    // エラーログ記録
    await prisma.priceUpdateLog.create({
      data: {
        shopDomain,
        executionType: "auto",
        goldRatio: null,
        minPricePct: 93,
        totalProducts: 0,
        updatedCount: 0,
        failedCount: 0,
        success: false,
        errorMessage: error.message
      }
    });

    return {
      success: false,
      message: `自動更新中にエラーが発生しました: ${error.message}`
    };
  }
}

export const action = async ({ request }) => {
  const url = new URL(request.url);
  const secret = url.searchParams.get("secret");
  const force = url.searchParams.get("force") === "1";

  // シークレット認証
  if (!secret || secret !== process.env.CRON_SECRET) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    // 自動更新が有効なショップを取得
    const enabledShops = await prisma.shopSetting.findMany({
      where: { autoUpdateEnabled: true }
    });

    if (enabledShops.length === 0) {
      return new Response(JSON.stringify({
        message: "自動更新が有効なショップがありません",
        results: []
      }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }

    const results = [];

    // 各ショップで自動更新実行
    for (const shopSetting of enabledShops) {
      const shopDomain = shopSetting.shopDomain;
      
      try {
        // セッション取得
        const sessionRecord = await prisma.session.findFirst({
          where: { shop: shopDomain }
        });

        if (!sessionRecord) {
          results.push({
            shop: shopDomain,
            success: false,
            message: "セッションが見つかりません（アプリが未インストールの可能性）"
          });
          continue;
        }

        // 疑似的な管理者認証（セッションベース）
        const admin = {
          graphql: async (query, options) => {
            const response = await fetch(`https://${shopDomain}/admin/api/2025-01/graphql.json`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "X-Shopify-Access-Token": sessionRecord.accessToken,
              },
              body: JSON.stringify({ query, variables: options?.variables }),
            });
            return response;
          }
        };

        const result = await executeAutoUpdate(shopDomain, admin, shopDomain, force);
        results.push({
          shop: shopDomain,
          ...result
        });

        // ショップ間で少し待機（レート制限対策）
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error(`Error processing shop ${shopDomain}:`, error);
        results.push({
          shop: shopDomain,
          success: false,
          message: `処理エラー: ${error.message}`
        });
      }
    }

    return new Response(JSON.stringify({
      message: `${results.length}店舗の自動更新処理が完了しました`,
      results
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error("Cron execution error:", error);
    return new Response(JSON.stringify({
      error: "Internal server error",
      message: error.message
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};

export const loader = () => new Response(null, { status: 405 });