// app/routes/api.cron.price-update.tsx
import type { ActionFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Shopify Admin API GraphQLクライアント
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

    return {
      json: async () => await response.json(),
    };
  }
}

// 金価格変動率を取得
async function fetchGoldChangeRatioTanaka() {
  try {
    const response = await fetch('https://gold.tanaka.co.jp/commodity/souba/');
    const html = await response.text();
    
    // K18の価格情報を抽出
    const priceMatch = html.match(/K18.*?(\d{1,3}(?:,\d{3})*)/);
    const changeMatch = html.match(/前日比[^円\-+]*([+\-]?\d+(?:\.\d+)?)[^0-9]*円/i) ||
                       html.match(/変動[^円\-+]*([+\-]?\d+(?:\.\d+)?)[^0-9]*円/i);
    
    if (!priceMatch || !changeMatch) {
      console.log('金価格データの抽出に失敗');
      return null;
    }
    
    const retailPrice = parseInt(priceMatch[1].replace(/,/g, ''));
    const changeYen = parseFloat(changeMatch[1]);
    const changeRatio = changeYen / retailPrice;
    
    console.log(`金価格情報: 小売価格=${retailPrice}円, 前日比=${changeYen}円, 変動率=${(changeRatio * 100).toFixed(2)}%`);
    return changeRatio;
    
  } catch (error) {
    console.error('金価格取得エラー:', error);
    return null;
  }
}

// 価格計算
function calcFinalPrice(current: number, ratio: number, minPct: number): string {
  const calc = current * (1 + ratio);
  const floor = current * (minPct / 100);
  return String(Math.round(Math.max(calc, floor)));
}

// 単一ショップの価格更新処理
async function updateShopPrices(shop: string, accessToken: string) {
  const admin = new ShopifyAdminClient(shop, accessToken);
  
  try {
    // 1) 金価格変動率取得
    const ratio = await fetchGoldChangeRatioTanaka();
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

    const minPct = setting.minPricePct || 93;

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
        
        const body = await resp.json();
        const product = body?.data?.product;
        if (!product) continue;

        // 各バリアントの価格計算
        for (const edge of product.variants.edges) {
          const variant = edge.node;
          const current = Number(variant.price || 0);
          if (!current) continue;

          const newPrice = calcFinalPrice(current, ratio, minPct);
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
      }
    }

    if (!entries.length) {
      // ログ記録
      await prisma.priceUpdateLog.create({
        data: {
          shopDomain: shop,
          executionType: 'cron',
          goldRatio: ratio,
          minPricePct: minPct,
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

        const r = await res.json();
        const errs = r?.data?.productVariantsBulkUpdate?.userErrors || [];
        
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
        minPricePct: 93,
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

export const action: ActionFunction = async ({ request }) => {
  // POSTメソッドのみ許可
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    console.log(`🕙 Cron実行開始: ${new Date().toISOString()}`);

    // 自動更新有効なショップとそのアクセストークンを取得
    const enabledShops = await prisma.shopSetting.findMany({
      where: { autoUpdateEnabled: true },
      select: { shopDomain: true }
    });

    if (!enabledShops.length) {
      console.log('自動更新有効なショップがありません');
      return json({
        message: "自動更新有効なショップなし",
        timestamp: new Date().toISOString(),
        shops: []
      });
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

    return json({
      message: "自動価格更新完了",
      timestamp: new Date().toISOString(),
      summary: {
        totalShops: results.length,
        successShops: successCount,
        totalUpdated,
        totalFailed
      },
      shops: results
    });

  } catch (error) {
    console.error("Cron実行エラー:", error);
    return json({ 
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
};