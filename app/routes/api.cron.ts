// app/routes/api.cron.ts - GET/POST両対応の自動価格更新API
import type { LoaderFunction, ActionFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { prisma } from '../lib/db.server';
import { fetchGoldPriceDataTanaka } from '../models/gold.server';

// Shopify Admin API GraphQLクライアント（自己修復機能付き）
class ShopifyAdminClient {
  constructor(private shop: string, private accessToken: string) {}

  async graphql(query: string, options: { variables?: any } = {}) {
    const url = `https://${this.shop}/admin/api/2024-01/graphql.json`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': this.accessToken,
      },
      body: JSON.stringify({
        query,
        variables: options.variables || {},
      }),
    });

    const body = await response.json().catch(() => ({}));
    
    // エラー検知とステータス返却
    if (!response.ok || body?.errors) {
      return { status: response.status, body, ok: false };
    }
    
    return { status: response.status, body, ok: true };
  }
}

// 金価格変動率を取得（修正済みロジック使用）
async function fetchGoldChangeRatio() {
  try {
    const goldData = await fetchGoldPriceDataTanaka();
    if (!goldData || goldData.changeRatio === null) {
      console.log('金価格データの取得に失敗');
      return null;
    }
    
    console.log(`金価格情報: ${goldData.retailPriceFormatted}, 前日比: ${goldData.changePercent}, 変動方向: ${goldData.changeDirection}`);
    return goldData.changeRatio;
    
  } catch (error) {
    console.error('金価格取得エラー:', error);
    return null;
  }
}

// 価格計算（最小変動付き）
function calcFinalPriceWithStep(current: number, ratio: number, minPct01: number, step = 1): string {
  const target = Math.max(current * (1 + ratio), current * minPct01);
  // 上げ方向はMath.ceil、下げ方向はMath.floor で確実に変動させる
  const rounded = ratio >= 0 ? Math.ceil(target / step) * step : Math.floor(target / step) * step;
  return String(rounded);
}

// 単一ショップの価格更新処理
async function updateShopPrices(shop: string, accessToken: string) {
  const admin = new ShopifyAdminClient(shop, accessToken);
  
  try {
    // 1) 金価格変動率取得（修正済みロジック）
    const ratio = await fetchGoldChangeRatio();
    if (ratio === null) {
      return { 
        shop, 
        success: false, 
        error: "金価格の取得に失敗", 
        updated: 0, 
        failed: 0 
      };
    }

    // 2) ショップ設定取得
    const setting = await prisma.shopSetting.findUnique({ 
      where: { shopDomain: shop } 
    });
    
    if (!setting || !setting.autoUpdateEnabled) {
      console.log(`${shop}: 自動更新が無効です`);
      return { 
        shop, 
        success: true, 
        message: "自動更新無効", 
        updated: 0, 
        failed: 0 
      };
    }

    // minPricePct の正規化（0.93 または 93 のどちらでも対応）
    const minPctRaw = setting.minPricePct || 93;
    const minPct01 = minPctRaw > 1 ? minPctRaw / 100 : minPctRaw;

    // 3) 対象商品取得
    const targets = await prisma.selectedProduct.findMany({
      where: { shopDomain: shop },
      select: { productId: true },
    });

    if (!targets.length) {
      return { 
        shop, 
        success: true, 
        message: "対象商品なし", 
        updated: 0, 
        failed: 0 
      };
    }

    // 4) 価格更新処理
    const entries: any[] = [];
    for (const target of targets) {
      try {
        const resp = await admin.graphql(`
          query($id: ID!) { 
            product(id: $id) { 
              id 
              title
              variants(first: 50) {
                edges {
                  node {
                    id
                    price
                  }
                }
              }
            } 
          }
        `, { variables: { id: target.productId }});
        
        // 401エラー検知と自己修復
        if (resp.status === 401 || resp.body?.errors?.[0]?.message?.includes("Invalid API key or access token")) {
          console.error(`🚨 401 Unauthorized detected for shop: ${shop}`);
          
          // ログに記録
          await prisma.priceUpdateLog.create({
            data: {
              shopDomain: shop,
              executionType: 'cron',
              goldRatio,
              minPricePct: Math.round(minPct01 * 100),
              success: false,
              errorMessage: '401 Unauthorized: 再認証が必要',
              totalProducts: targets.length,
              updatedCount: 0,
              failedCount: targets.length,
            }
          });
          
          // 古いセッションを無効化（次回の/authに誘導）
          await prisma.session.deleteMany({ where: { shop } });
          
          return { 
            shop, 
            success: false, 
            needsReauth: true, 
            message: "認証エラー: アプリの再インストールが必要です", 
            updated: 0, 
            failed: targets.length 
          };
        }
        
        // 通常のGraphQLエラーチェック
        if (!resp.ok || resp.body?.errors?.length) {
          console.error(`商品 ${target.productId} GraphQLエラー:`, resp.body.errors[0].message);
          details.push({ 
            success: false, 
            productId: target.productId, 
            error: `GraphQLエラー: ${resp.body.errors[0].message}` 
          });
          failed += 1;
          continue;
        }
        
        const product = resp.body?.data?.product;
        if (!product) {
          console.error(`商品 ${target.productId} データが見つかりません`);
          details.push({ 
            success: false, 
            productId: target.productId, 
            error: "商品データが見つかりません" 
          });
          failed += 1;
          continue;
        }

        // 各バリアントの価格計算
        for (const edge of product.variants.edges) {
          const variant = edge.node;
          const current = Number(variant.price || 0);
          if (!current) continue;

          const newPrice = calcFinalPriceWithStep(current, ratio, minPct01);
          if (parseFloat(newPrice) !== current) {
            entries.push({ 
              productId: target.productId, 
              productTitle: product.title,
              variantId: variant.id, 
              newPrice,
              oldPrice: current
            });
          }
        }

        // レート制限対策
        await new Promise(r => setTimeout(r, 100));
      } catch (error) {
        console.error(`商品 ${target.productId} の処理でエラー:`, error);
        details.push({ 
          success: false, 
          productId: target.productId, 
          error: `商品処理エラー: ${error.message}` 
        });
        failed += 1;
      }
    }

    if (!entries.length) {
      // ログ記録
      await prisma.priceUpdateLog.create({
        data: {
          shopDomain: shop,
          executionType: 'cron',
          goldRatio: ratio,
          minPricePct: minPctRaw,
          totalProducts: targets.length,
          updatedCount: 0,
          failedCount: 0,
          success: true,
          errorMessage: null,
        }
      });

      return { 
        shop, 
        success: true, 
        message: "価格変更不要", 
        updated: 0, 
        failed: 0 
      };
    }

    // 5) Shopify API一括更新
    const byProduct = new Map();
    for (const e of entries) {
      const arr = byProduct.get(e.productId) || [];
      arr.push({ id: e.variantId, price: e.newPrice, oldPrice: e.oldPrice });
      byProduct.set(e.productId, arr);
    }

    let updated = 0, failed = 0;
    const details: any[] = [];

    for (const [productId, variants] of byProduct) {
      try {
        const res = await admin.graphql(`
          mutation UpdateViaBulk($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
            productVariantsBulkUpdate(productId: $productId, variants: $variants) {
              product { id }
              productVariants { id price }
              userErrors { field message }
            }
          }
        `, { 
          variables: { 
            productId, 
            variants: variants.map((v: any) => ({ id: v.id, price: v.price }))
          }
        });

        // 401エラー検知（価格更新時）
        if (res.status === 401 || res.body?.errors?.[0]?.message?.includes("Invalid API key or access token")) {
          console.error(`🚨 401 Unauthorized detected during price update for shop: ${shop}`);
          
          // 古いセッションを無効化
          await prisma.session.deleteMany({ where: { shop } });
          
          // 残りの処理を中断し、ログに記録
          await prisma.priceUpdateLog.create({
            data: {
              shopDomain: shop,
              executionType: 'cron',
              goldRatio: ratio,
              minPricePct: Math.round(minPct01 * 100),
              totalProducts: targets.length,
              updatedCount: updated,
              failedCount: entries.length - updated,
              success: false,
              errorMessage: '401 Unauthorized during price update: 再認証が必要',
            }
          });
          
          return { 
            shop, 
            success: false, 
            needsReauth: true, 
            message: "価格更新中に認証エラー: アプリの再インストールが必要です", 
            updated, 
            failed: entries.length - updated 
          };
        }
        
        // 通常のGraphQLエラーチェック
        if (!res.ok || res.body?.errors?.length) {
          console.error(`商品 ${productId} 更新GraphQLエラー:`, res.body.errors[0].message);
          for (const variant of variants) {
            details.push({ 
              success: false,
              productId, 
              variantId: variant.id,
              oldPrice: variant.oldPrice,
              error: `更新GraphQLエラー: ${res.body.errors[0].message}`
            });
          }
          failed += variants.length;
          continue;
        }
        
        const errs = res.body?.data?.productVariantsBulkUpdate?.userErrors || [];
        
        if (errs.length) {
          failed += variants.length;
          for (const variant of variants) {
            details.push({ 
              success: false,
              productId, 
              variantId: variant.id,
              error: errs[0]?.message || "不明なエラー"
            });
          }
        } else {
          const updatedVariants = r?.data?.productVariantsBulkUpdate?.productVariants || [];
          updated += updatedVariants.length;
          for (const variant of variants) {
            details.push({ 
              success: true,
              productId, 
              variantId: variant.id,
              oldPrice: variant.oldPrice,
              newPrice: parseFloat(variant.price)
            });
          }
        }

        // レート制限対策
        await new Promise(r => setTimeout(r, 200));
      } catch (error) {
        console.error(`商品 ${productId} の更新でエラー:`, error);
        for (const variant of variants) {
          details.push({ 
            success: false,
            productId, 
            variantId: variant.id,
            oldPrice: variant.oldPrice,
            error: `更新処理エラー: ${error.message}`
          });
        }
        failed += variants.length;
      }
    }

    // ログ記録
    await prisma.priceUpdateLog.create({
      data: {
        shopDomain: shop,
        executionType: 'cron',
        goldRatio: ratio,
        minPricePct: minPct,
        totalProducts: targets.length,
        updatedCount: updated,
        failedCount: failed,
        success: failed === 0,
        errorMessage: failed > 0 ? `${failed}件の更新に失敗` : null,
        details: JSON.stringify(details)
      }
    });

    return { 
      shop, 
      success: true, 
      updated, 
      failed,
      ratio: (ratio * 100).toFixed(2) + '%'
    };

  } catch (error) {
    console.error(`${shop}の処理でエラー:`, error);
    
    // エラーログ記録
    await prisma.priceUpdateLog.create({
      data: {
        shopDomain: shop,
        executionType: 'cron',
        goldRatio: null,
        minPricePct: minPctRaw || 93,
        totalProducts: 0,
        updatedCount: 0,
        failedCount: 0,
        success: false,
        errorMessage: error.message,
      }
    });

    return { 
      shop, 
      success: false, 
      error: error.message, 
      updated: 0, 
      failed: 0 
    };
  }
}

// 共通の自動更新ロジック（GET/POST両方から使用）
async function runAllShops() {
  try {
    console.log(`🕙 Cron実行開始: ${new Date().toISOString()}`);

    // 自動更新有効なショップとそのアクセストークンを取得
    const enabledShops = await prisma.shopSetting.findMany({
      where: { autoUpdateEnabled: true },
      select: { shopDomain: true }
    });

    if (!enabledShops.length) {
      console.log('自動更新有効なショップがありません');
      return {
        message: "自動更新有効なショップなし",
        timestamp: new Date().toISOString(),
        summary: { totalShops: 0, successShops: 0, totalUpdated: 0, totalFailed: 0 },
        shops: []
      };
    }

    // 各ショップのアクセストークンを取得
    const results = [];
    for (const shop of enabledShops) {
      const session = await prisma.session.findFirst({
        where: { shop: shop.shopDomain },
        orderBy: { expires: 'desc' }
      });

      if (!session || !session.accessToken) {
        console.log(`${shop.shopDomain}: 有効なセッションが見つかりません`);
        results.push({
          shop: shop.shopDomain,
          success: false,
          error: "有効なセッションなし",
          updated: 0,
          failed: 0
        });
        continue;
      }

      console.log(`${shop.shopDomain}: 価格更新を開始`);
      const result = await updateShopPrices(shop.shopDomain, session.accessToken);
      results.push(result);
      
      // ショップ間の待機時間
      await new Promise(r => setTimeout(r, 1000));
    }

    const totalUpdated = results.reduce((sum, r) => sum + (r.updated || 0), 0);
    const totalFailed = results.reduce((sum, r) => sum + (r.failed || 0), 0);
    const successCount = results.filter(r => r.success).length;

    console.log(`🏁 Cron実行完了: 成功 ${successCount}/${results.length}ショップ, 更新 ${totalUpdated}件, 失敗 ${totalFailed}件`);

    return {
      message: "自動価格更新完了",
      timestamp: new Date().toISOString(),
      summary: {
        totalShops: results.length,
        successShops: successCount,
        totalUpdated,
        totalFailed
      },
      shops: results
    };

  } catch (error) {
    console.error("Cron実行エラー:", error);
    return {
      error: error.message,
      timestamp: new Date().toISOString(),
      summary: { totalShops: 0, successShops: 0, totalUpdated: 0, totalFailed: 0 },
      shops: []
    };
  }
}

// Vercel Cron用のGETエンドポイント
export const loader: LoaderFunction = async () => {
  const result = await runAllShops();
  return json(result, { 
    headers: { "Cache-Control": "no-store" } 
  });
};

// 手動実行用のPOSTエンドポイント
export const action: ActionFunction = async ({ request }) => {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }
  
  const result = await runAllShops();
  return json(result, { 
    headers: { "Cache-Control": "no-store" } 
  });
};