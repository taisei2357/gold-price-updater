// app/routes/api.cron.ts - GET/POST両対応の自動価格更新API
import type { LoaderFunction, ActionFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import prisma from '../db.server';
import { fetchGoldPriceDataTanaka, fetchPlatinumPriceDataTanaka } from '../models/gold.server';
import { sendPriceUpdateNotification, type PriceUpdateEmailData } from '../utils/email.server';

// CRON認証チェック（Vercel Cron対応）
function verifyCronAuth(request: Request) {
  // Vercel Cron からの実行は x-vercel-cron ヘッダーが付く
  const fromVercelCron = request.headers.get('x-vercel-cron') === '1';
  if (fromVercelCron) return null; // 許可

  // 手動実行や外部から叩く場合だけ Bearer チェック
  const expected = process.env.CRON_SECRET;
  if (!expected) return null;

  const got = request.headers.get('authorization') || '';
  if (got === `Bearer ${expected}`) return null;

  return json({ error: 'Unauthorized' }, { status: 401 });
}

// Shopify Admin API GraphQLクライアント（自己修復機能付き）
class ShopifyAdminClient {
  constructor(private shop: string, private accessToken: string) {}

  async graphql(query: string, options: { variables?: any } = {}) {
    const url = `https://${this.shop}/admin/api/2025-01/graphql.json`;
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

// 金・プラチナ価格変動率を取得
async function fetchMetalPriceRatios() {
  try {
    const [goldData, platinumData] = await Promise.all([
      fetchGoldPriceDataTanaka(),
      fetchPlatinumPriceDataTanaka()
    ]);

    const gold = goldData && goldData.changeRatio !== null ? goldData.changeRatio : null;
    const platinum = platinumData && platinumData.changeRatio !== null ? platinumData.changeRatio : null;

    console.log(`金価格情報: ${goldData?.retailPriceFormatted}, 前日比: ${goldData?.changePercent}, 変動率: ${gold ? (gold * 100).toFixed(2) + '%' : 'N/A'}`);
    console.log(`プラチナ価格情報: ${platinumData?.retailPriceFormatted}, 前日比: ${platinumData?.changePercent}, 変動率: ${platinum ? (platinum * 100).toFixed(2) + '%' : 'N/A'}`);

    // 相場変動なしチェック：金・プラチナ両方とも変動率が0の場合
    const goldNoChange = gold === 0;
    const platinumNoChange = platinum === 0;
    
    if (goldNoChange && platinumNoChange) {
      console.log('📊 金・プラチナとも相場変動なし（祝日等）- 価格更新をスキップ');
      return { gold: null, platinum: null, noChange: true };
    }

    return { gold, platinum, noChange: false };
    
  } catch (error) {
    console.error('金属価格取得エラー:', error);
    return { gold: null, platinum: null };
  }
}

// 価格計算（最小変動付き）
function calcFinalPriceWithStep(current: number, ratio: number, minPct01: number, step = 1): string {
  const target = Math.max(current * (1 + ratio), current * minPct01);
  // 上げ方向はMath.ceil、下げ方向はMath.floor で確実に変動させる
  const rounded = ratio >= 0 ? Math.ceil(target / step) * step : Math.floor(target / step) * step;
  return String(rounded);
}

// 単一商品の処理
async function processProduct(target: { productId: string, metalType: string }, ratio: number, metalType: string, admin: any, entries: any[], details: any[], minPct01: number) {
  try {
    // productId を GID 形式に正規化
    const productGid = target.productId.startsWith('gid://')
      ? target.productId
      : `gid://shopify/Product/${target.productId}`;
    
    const resp = await admin.graphql(`
      query($id: ID!) { 
        product(id: $id) { 
          id 
          title
          variants(first: 250) {
            edges {
              node {
                id
                price
              }
            }
          }
        } 
      }
    `, { variables: { id: productGid }});
    
    // 401エラー検知と自己修復
    if (resp.status === 401 || resp.body?.errors?.[0]?.message?.includes("Invalid API key or access token")) {
      console.error(`🚨 401 Unauthorized detected for product: ${productGid}`);
      details.push({ 
        success: false, 
        productId: productGid, 
        error: "401 Unauthorized: 再認証が必要",
        metalType
      });
      return;
    }
    
    // 通常のGraphQLエラーチェック
    if (!resp.ok || (resp.body?.errors && resp.body.errors.length)) {
      const msg = resp.body?.errors?.[0]?.message ?? `HTTP ${resp.status}`;
      console.error(`商品 ${productGid} (${metalType}) GraphQLエラー:`, msg);
      details.push({ 
        success: false, 
        productId: productGid, 
        error: `GraphQLエラー: ${msg}`,
        metalType
      });
      return;
    }
    
    const product = resp.body?.data?.product;
    if (!product) {
      console.error(`商品 ${productGid} (${metalType}) データが見つかりません`);
      details.push({ 
        success: false, 
        productId: productGid, 
        error: "商品データが見つかりません",
        metalType
      });
      return;
    }

    // 各バリアントの価格計算
    for (const edge of product.variants.edges) {
      const variant = edge.node;
      const current = Number(variant.price || 0);
      if (!current) continue;

      const newPrice = calcFinalPriceWithStep(current, ratio, minPct01, 10);
      if (parseFloat(newPrice) !== current) {
        entries.push({ 
          productId: productGid, // GID形式を使用 
          productTitle: product.title,
          variantId: variant.id, 
          newPrice,
          oldPrice: current,
          metalType
        });
      }
    }

  } catch (error) {
    console.error(`商品 ${productGid} (${metalType}) の処理でエラー:`, error);
    details.push({ 
      success: false, 
      productId: productGid, 
      error: `商品処理エラー: ${(error as Error).message}`,
      metalType
    });
  }
}

// 単一ショップの価格更新処理
async function updateShopPrices(shop: string, accessToken: string) {
  const admin = new ShopifyAdminClient(shop, accessToken);
  let minPctSaved = 93; // デフォルト値
  
  try {
    // 1) 金・プラチナ価格変動率取得
    const ratios = await fetchMetalPriceRatios();
    
    // 相場変動なしの場合はスキップ
    if (ratios.noChange) {
      return { 
        shop, 
        success: true, 
        message: "相場変動なしのためスキップ",
        updated: 0, 
        failed: 0 
      };
    }
    
    if (ratios.gold === null && ratios.platinum === null) {
      return { 
        shop, 
        success: false, 
        error: "金・プラチナ価格の取得に失敗", 
        updated: 0, 
        failed: 0 
      };
    }

    // 2) ショップ設定取得
    const setting = await prisma.shopSetting.findUnique({ 
      where: { shopDomain: shop } 
    });
    
    // 93 は「93%」の意味（整数%で保存）。内部計算は 0–1 に正規化。
    minPctSaved = setting?.minPricePct ?? 93;
    const minPct01 = minPctSaved > 1 ? minPctSaved / 100 : minPctSaved;
    
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

    // 3) 対象商品取得（金属種別込み）- 明示的に selected: true のみ
    const targets = await prisma.selectedProduct.findMany({
      where: { 
        shopDomain: shop,
        selected: true,
      },
      select: { productId: true, metalType: true },
    });

    console.log(`${shop}: 対象商品数（selected=true）: ${targets.length}`);

    if (!targets.length) {
      return { 
        shop, 
        success: true, 
        message: "対象商品なし", 
        updated: 0, 
        failed: 0 
      };
    }

    // 金・プラチナ別に商品をグループ分け（metalType の正規化付き）
    const normalize = (s?: string) => (s ?? '').trim().toLowerCase();
    const goldTargets = targets.filter(t => normalize(t.metalType) === 'gold');
    const platinumTargets = targets.filter(t => normalize(t.metalType) === 'platinum');

    console.log(`${shop}: 金商品 ${goldTargets.length}件, プラチナ商品 ${platinumTargets.length}件`);

    // 両方とも更新対象がない場合は早期リターン
    if ((ratios.gold === null || goldTargets.length === 0) && 
        (ratios.platinum === null || platinumTargets.length === 0)) {
      return { 
        shop, 
        success: true, 
        message: "有効な価格変動・対象商品なし", 
        updated: 0, 
        failed: 0 
      };
    }

    // 4) 価格更新処理（金属種別ごと）
    const entries: any[] = [];
    let updated = 0, failed = 0;
    const details: any[] = [];
    
    // 金商品の処理
    if (ratios.gold !== null && goldTargets.length > 0) {
      console.log(`${shop}: 金商品価格更新開始（変動率: ${(ratios.gold * 100).toFixed(2)}%）`);
      for (const target of goldTargets) {
        await processProduct(target, ratios.gold, 'gold', admin, entries, details, minPct01);
        await new Promise(r => setTimeout(r, 100)); // レート制限対策
      }
    }

    // プラチナ商品の処理
    if (ratios.platinum !== null && platinumTargets.length > 0) {
      console.log(`${shop}: プラチナ商品価格更新開始（変動率: ${(ratios.platinum * 100).toFixed(2)}%）`);
      for (const target of platinumTargets) {
        await processProduct(target, ratios.platinum, 'platinum', admin, entries, details, minPct01);
        await new Promise(r => setTimeout(r, 100)); // レート制限対策
      }
    }

    if (!entries.length) {
      // ログ記録（金・プラチナ両方対応）
      const goldRatio = ratios.gold;
      const platinumRatio = ratios.platinum;
      
      // 金とプラチナのログを別々に記録
      if (goldRatio !== null && goldTargets.length > 0) {
        await prisma.priceUpdateLog.create({
          data: {
            shopDomain: shop,
            executionType: 'cron',
            metalType: 'gold',
            priceRatio: goldRatio,
            minPricePct: minPctSaved,
            totalProducts: goldTargets.length,
            updatedCount: 0,
            failedCount: 0,
            success: true,
            errorMessage: null,
          }
        });
      }
      
      if (platinumRatio !== null && platinumTargets.length > 0) {
        await prisma.priceUpdateLog.create({
          data: {
            shopDomain: shop,
            executionType: 'cron',
            metalType: 'platinum',
            priceRatio: platinumRatio,
            minPricePct: minPctSaved,
            totalProducts: platinumTargets.length,
            updatedCount: 0,
            failedCount: 0,
            success: true,
            errorMessage: null,
          }
        });
      }

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

    updated = 0; // リセット
    failed = 0;  // リセット

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
              metalType: 'gold',
              priceRatio: null,
              minPricePct: minPctSaved,
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
        if (!res.ok || (res.body?.errors && res.body.errors.length)) {
          const msg = res.body?.errors?.[0]?.message ?? `HTTP ${res.status}`;
          console.error(`商品 ${productId} 更新GraphQLエラー:`, msg);
          for (const variant of variants) {
            details.push({ 
              success: false,
              productId, 
              variantId: variant.id,
              oldPrice: variant.oldPrice,
              error: `更新GraphQLエラー: ${msg}`
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
          const updatedVariants = res.body?.data?.productVariantsBulkUpdate?.productVariants || [];
          updated += updatedVariants.length;
          
          for (const variant of variants) {
            const uv = updatedVariants.find((u: {id:string; price:string}) => u.id === variant.id);
            details.push({ 
              success: true,
              productId, 
              variantId: variant.id,
              oldPrice: variant.oldPrice,
              newPrice: uv ? parseFloat(uv.price) : parseFloat(variant.price),
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
            error: `更新処理エラー: ${(error as Error).message}`
          });
        }
        failed += variants.length;
      }
    }

    // ログ記録（金・プラチナ別々に記録、実更新数で集計）
    const goldEntries = entries.filter(e => e.metalType === 'gold');
    const platinumEntries = entries.filter(e => e.metalType === 'platinum');
    const goldDetails = details.filter(d => d.metalType === 'gold');
    const platinumDetails = details.filter(d => d.metalType === 'platinum');

    // 実更新数を集計（success=trueのみ）
    const goldUpdated = goldDetails.filter(d => d.success).length;
    const goldFailed = goldDetails.filter(d => !d.success).length;
    const platinumUpdated = platinumDetails.filter(d => d.success).length;
    const platinumFailed = platinumDetails.filter(d => !d.success).length;

    if (ratios.gold !== null && (goldTargets.length > 0 || goldEntries.length > 0)) {
      await prisma.priceUpdateLog.create({
        data: {
          shopDomain: shop,
          executionType: 'cron',
          metalType: 'gold',
          priceRatio: ratios.gold,
          minPricePct: minPctSaved,
          totalProducts: goldTargets.length,
          updatedCount: goldUpdated,      // 実更新数
          failedCount: goldFailed,        // 実失敗数
          success: goldFailed === 0,
          errorMessage: goldFailed > 0 ? `金: ${goldFailed}件の更新に失敗` : null,
          details: JSON.stringify(goldDetails)
        }
      });
    }

    if (ratios.platinum !== null && (platinumTargets.length > 0 || platinumEntries.length > 0)) {
      await prisma.priceUpdateLog.create({
        data: {
          shopDomain: shop,
          executionType: 'cron',
          metalType: 'platinum',
          priceRatio: ratios.platinum,
          minPricePct: minPctSaved,
          totalProducts: platinumTargets.length,
          updatedCount: platinumUpdated,  // 実更新数
          failedCount: platinumFailed,    // 実失敗数
          success: platinumFailed === 0,
          errorMessage: platinumFailed > 0 ? `プラチナ: ${platinumFailed}件の更新に失敗` : null,
          details: JSON.stringify(platinumDetails)
        }
      });
    }

    // メール通知送信（設定されている場合）
    const shopSetting = await prisma.shopSetting.findUnique({
      where: { shopDomain: shop },
      select: { notificationEmail: true }
    });

    if (shopSetting?.notificationEmail) {
      try {
        const emailData: PriceUpdateEmailData = {
          shopDomain: shop,
          updatedCount: updated,
          failedCount: failed,
          goldRatio: ratios.gold ? (ratios.gold * 100).toFixed(2) + '%' : undefined,
          platinumRatio: ratios.platinum ? (ratios.platinum * 100).toFixed(2) + '%' : undefined,
          timestamp: new Date().toISOString(),
          details: details
        };

        const emailResult = await sendPriceUpdateNotification(
          shopSetting.notificationEmail, 
          emailData
        );

        if (emailResult.success) {
          console.log(`📧 メール通知送信成功: ${shopSetting.notificationEmail}`);
        } else {
          console.error(`📧 メール通知送信失敗: ${emailResult.error}`);
        }
      } catch (emailError) {
        console.error('📧 メール通知処理でエラー:', emailError);
      }
    }

    return { 
      shop, 
      success: true, 
      updated, 
      failed,
      goldRatio: ratios.gold ? (ratios.gold * 100).toFixed(2) + '%' : 'N/A',
      platinumRatio: ratios.platinum ? (ratios.platinum * 100).toFixed(2) + '%' : 'N/A',
      emailSent: !!shopSetting?.notificationEmail
    };

  } catch (error) {
    console.error(`${shop}の処理でエラー:`, error);
    
    // エラーログ記録（デフォルトで金として記録）
    await prisma.priceUpdateLog.create({
      data: {
        shopDomain: shop,
        executionType: 'cron',
        metalType: 'gold',
        priceRatio: null,
        minPricePct: minPctSaved,
        totalProducts: 0,
        updatedCount: 0,
        failedCount: 0,
        success: false,
        errorMessage: (error as Error).message,
      }
    });

    return { 
      shop, 
      success: false, 
      error: (error as Error).message, 
      updated: 0, 
      failed: 0 
    };
  }
}

// 祝日判定機能は削除（相場変動チェックで代替）

// 共通の自動更新ロジック（GET/POST両方から使用）
async function runAllShops(opts: { force?: boolean } = {}) {
  const force = !!opts.force;
  try {
    console.log(`🕙 Cron実行開始: ${new Date().toISOString()}`);
    
    // 営業日チェック（force=trueの場合はスキップ）
    const now = new Date();
    const jstNow = new Date(now.getTime() + 9 * 60 * 60 * 1000); // JSTに調整
    const currentHour = jstNow.getHours();
    
    // 土日のみスキップ（祝日は相場変動チェックで対応）
    const dayOfWeek = jstNow.getDay(); // 0=日曜, 6=土曜
    if (!force && (dayOfWeek === 0 || dayOfWeek === 6)) {
      const message = `${jstNow.toDateString()}は土日のため価格更新をスキップします`;
      console.log(message);
      return {
        message,
        timestamp: new Date().toISOString(),
        summary: { totalShops: 0, successShops: 0, totalUpdated: 0, totalFailed: 0 },
        shops: []
      };
    }

    // JST 10:00-11:00 の時刻チェック（GitHub Actions遅延対策）
    const targetHour = 10; // JST 10:00固定
    const inWindow = currentHour >= 10 && currentHour <= 11; // 10〜11時台を許容
    
    // 自動更新有効なショップとそのアクセストークンを取得
    const enabledShops = await prisma.shopSetting.findMany({
      where: { 
        autoUpdateEnabled: true,
        // force=trueでない場合は10〜11時台実行
        ...(force ? {} : inWindow ? {} : { shopDomain: 'never-match' })
      },
      select: { shopDomain: true }
    });

    if (!enabledShops.length) {
      const message = force 
        ? '自動更新有効なショップがありません'
        : `JST ${currentHour}:00 - 10:00-11:00時間帯でないため実行をスキップします`;
      console.log(message);
      return {
        message,
        timestamp: new Date().toISOString(),
        summary: { totalShops: 0, successShops: 0, totalUpdated: 0, totalFailed: 0 },
        shops: []
      };
    }

    console.log(`🕐 JST ${currentHour}:00 (10:00-11:00実行時間帯) - ${enabledShops.length}件のショップで価格更新を開始`);

    // 各ショップのアクセストークンを取得
    const results = [];
    for (const shop of enabledShops) {
      const session = await prisma.session.findFirst({
        where: { 
          shop: shop.shopDomain,
          isOnline: false  // オフライントークンのみ（背景処理用）
        },
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
      error: (error as Error).message,
      timestamp: new Date().toISOString(),
      summary: { totalShops: 0, successShops: 0, totalUpdated: 0, totalFailed: 0 },
      shops: []
    };
  }
}

// Vercel Cron用のGETエンドポイント
export const loader: LoaderFunction = async ({ request }) => {
  const deny = verifyCronAuth(request);
  if (deny) return deny;
  
  try {
    const force = new URL(request.url).searchParams.get('force') === '1';
    const result = await runAllShops({ force });
    return json(result, { 
      headers: { "Cache-Control": "no-store" } 
    });
  } catch (e) {
    console.error('Cron実行エラー:', e);
    return json({ error: (e as Error).message }, { status: 500 });
  } finally {
    // Cronは都度実行なので明示的に閉じる
    await prisma.$disconnect().catch(() => {});
  }
};

// 手動実行用のPOSTエンドポイント
export const action: ActionFunction = async ({ request }) => {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }
  
  const deny = verifyCronAuth(request);
  if (deny) return deny;
  
  try {
    const force = new URL(request.url).searchParams.get('force') === '1';
    const result = await runAllShops({ force });
    return json(result, { 
      headers: { "Cache-Control": "no-store" } 
    });
  } catch (e) {
    console.error('Cron実行エラー:', e);
    return json({ error: (e as Error).message }, { status: 500 });
  } finally {
    // Cronは都度実行なので明示的に閉じる
    await prisma.$disconnect().catch(() => {});
  }
};
