// app/routes/api.cron.price-update.tsx
import { json, type ActionFunctionArgs } from "@remix-run/node";
import { runBulkUpdateBySpec } from "../models/price.server";
import { shouldRunNowJST } from "../models/scheduler.server";
import prisma from "../db.server";

/**
 * 自動価格更新を実行
 */
async function executeAutoUpdate(shopDomain: string, admin: any, shop: any, force: boolean = false) {
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

    // 3. 商品詳細をGraphQLで取得
    const products = await fetchProductDetails(admin, selectedProducts.map(p => p.productId));

    // 4. 価格更新実行
    const result = await runBulkUpdateBySpec(admin, shopDomain);

    // 5. ログ記録
    await prisma.priceUpdateLog.create({
      data: {
        shopDomain,
        executionType: "auto",
        goldRatio: result.goldRatio,
        minPricePct: shop.minPricePct || 93,
        totalProducts: products.length,
        updatedCount: result.updated || 0,
        failedCount: result.failed || 0,
        success: result.ok,
        errorMessage: result.ok ? null : result.reason,
        details: JSON.stringify(result.details)
      }
    });

    return {
      success: result.ok,
      message: result.ok ? 
        `${result.updated}件の商品価格を更新しました` : 
        result.reason,
      updated: result.updated,
      failed: result.failed
    };

  } catch (error) {
    // エラーログ記録
    await prisma.priceUpdateLog.create({
      data: {
        shopDomain,
        executionType: "auto",
        success: false,
        errorMessage: error.message,
        minPricePct: 93
      }
    });

    return {
      success: false,
      message: `自動更新中にエラーが発生しました: ${error.message}`
    };
  }
}

/**
 * 選択商品のGraphQL詳細情報を取得
 */
async function fetchProductDetails(admin: any, productIds: string[]) {
  const products = [];
  
  for (const productId of productIds) {
    try {
      const response = await admin.graphql(`
        query getProduct($id: ID!) {
          product(id: $id) {
            id
            title
            variants(first: 250) {
              edges {
                node {
                  id
                  title
                  price
                  sku
                }
              }
            }
          }
        }
      `, { variables: { id: productId } });

      const data = await response.json();
      if (data?.data?.product) {
        products.push(data.data.product);
      }

      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.error(`商品取得エラー (${productId}):`, error);
    }
  }
  
  return products;
}

/**
 * 自動価格更新Cronエンドポイント
 * 外部のCronサービス（Vercel Cron、GitHub Actions等）から呼び出される
 * 
 * 使用例:
 * curl -X POST https://your-app.com/api/cron/price-update \
 *   -H "Authorization: Bearer YOUR_CRON_SECRET" \
 *   -H "Content-Type: application/json"
 */
export async function action({ request }: ActionFunctionArgs) {
  // 1. 認証チェック（Cronサービス用のシークレット）
  const authHeader = request.headers.get("Authorization");
  const expectedSecret = process.env.CRON_SECRET || "your-secret-key";
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return json({ error: "認証ヘッダーが必要です" }, { status: 401 });
  }
  
  const token = authHeader.substring(7);
  if (token !== expectedSecret) {
    return json({ error: "認証に失敗しました" }, { status: 401 });
  }

  // forceパラメータをチェック（テスト用）
  const url = new URL(request.url);
  const force = url.searchParams.get("force") === "1";

  try {
    // 2. 自動更新が有効な全ショップを取得
    const activeShops = await prisma.shopSetting.findMany({
      where: { autoUpdateEnabled: true }
    });

    if (activeShops.length === 0) {
      return json({ 
        message: "自動更新が有効なショップがありません",
        processed: 0
      });
    }

    // 3. 各ショップで自動更新実行
    const results = [];
    
    for (const shop of activeShops) {
      try {
        // セッション情報から最新のアクセストークンを取得
        const session = await prisma.session.findFirst({
          where: { 
            shop: shop.shopDomain,
            isOnline: false // オフラインアクセストークンを優先
          },
          orderBy: { expires: 'desc' }
        });

        if (!session) {
          results.push({
            shop: shop.shopDomain,
            success: false,
            message: "有効なセッションが見つかりません"
          });
          continue;
        }

        // Admin API クライアントを構築
        const admin = {
          graphql: async (query: string, options?: any) => {
            const response = await fetch(`https://${shop.shopDomain}/admin/api/2024-07/graphql.json`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'X-Shopify-Access-Token': session.accessToken
              },
              body: JSON.stringify({
                query,
                variables: options?.variables
              })
            });
            return response;
          }
        };

        // サーキットブレーカー：連続失敗3回で自動停止
        if (shop.consecutiveFailures >= 3) {
          results.push({
            shop: shop.shopDomain,
            success: false,
            message: `連続失敗により自動停止中（${shop.consecutiveFailures}回失敗）`,
            circuitBreakerTripped: true
          });
          continue;
        }

        // 自動更新実行
        const result = await executeAutoUpdate(shop.shopDomain, admin, shop, force);
        
        // 結果に基づいて失敗カウンターを更新
        if (result.success) {
          // 成功時：失敗カウンターをリセット
          await prisma.shopSetting.update({
            where: { shopDomain: shop.shopDomain },
            data: { consecutiveFailures: 0, lastFailureAt: null }
          });
        } else {
          // 失敗時：カウンターを増加
          const newFailureCount = shop.consecutiveFailures + 1;
          await prisma.shopSetting.update({
            where: { shopDomain: shop.shopDomain },
            data: { 
              consecutiveFailures: newFailureCount,
              lastFailureAt: new Date(),
              // 3回連続失敗で自動更新を無効化
              autoUpdateEnabled: newFailureCount >= 3 ? false : shop.autoUpdateEnabled
            }
          });
        }
        
        results.push({
          shop: shop.shopDomain,
          ...result
        });

        // API制限対策：ショップ間の待機時間（指数バックオフ準備）
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error) {
        results.push({
          shop: shop.shopDomain,
          success: false,
          message: `エラー: ${error.message}`
        });
      }
    }

    // 4. 実行結果サマリー
    const summary = {
      totalShops: activeShops.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      skipped: results.filter(r => r.skipped).length,
      timestamp: new Date().toISOString()
    };

    return json({
      message: "自動更新処理が完了しました",
      summary,
      results
    });

  } catch (error) {
    console.error("Cron実行エラー:", error);
    
    return json({
      error: "自動更新処理中にエラーが発生しました",
      message: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

// GETリクエストではステータス情報を返す
export async function loader() {
  try {
    const activeShops = await prisma.shopSetting.count({
      where: { autoUpdateEnabled: true }
    });

    const recentLogs = await prisma.priceUpdateLog.findMany({
      where: { executionType: "auto" },
      orderBy: { executedAt: 'desc' },
      take: 5,
      select: {
        shopDomain: true,
        success: true,
        updatedCount: true,
        failedCount: true,
        executedAt: true
      }
    });

    return json({
      status: "ready",
      activeShops,
      recentExecutions: recentLogs,
      nextSchedule: "平日朝10時（JST）",
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    return json({
      status: "error",
      message: error.message
    }, { status: 500 });
  }
}