// app/models/price.server.ts
import prisma from "../db.server";
import { fetchMetalPriceData } from "./gold.server";

type AdminClient = {
  graphql: (query: string, init?: any) => Promise<{ json: () => Promise<any> }>;
};

function roundInt(n: number) { return Math.round(n); }

function calcFinalPrice(current: number, ratio: number, minPct: number): string {
  const calc = current * (1 + ratio);
  const floor = current * (minPct / 100);
  return String(roundInt(Math.max(calc, floor))); // GraphQL Decimal は文字列で
}

export async function runBulkUpdateBySpec(admin: AdminClient, shop: string) {
  // 1) 金・プラチナ価格変動率を取得
  const [goldData, platinumData] = await Promise.all([
    fetchMetalPriceData('gold'),
    fetchMetalPriceData('platinum')
  ]);

  // 2) 下限％
  const setting = await prisma.shopSetting.findUnique({ where: { shopDomain: shop } });
  const minPct = setting?.minPricePct ?? 93;

  // 3) 対象（SelectedProduct）取得（金属種別含む）
  const targets = await prisma.selectedProduct.findMany({
    where: { shopDomain: shop },
    select: { productId: true, metalType: true },
  });
  if (!targets.length) {
    return { ok: true, minPct, updated: 0, failed: 0, details: [], message: "対象なし" };
  }

  // 4) 金属種別ごとにグループ化し、価格データが利用可能かチェック
  const goldTargets = targets.filter(t => t.metalType === 'gold');
  const platinumTargets = targets.filter(t => t.metalType === 'platinum');

  if (goldTargets.length > 0 && (!goldData || goldData.changeRatio === null)) {
    return { ok: false, disabled: true, reason: "金価格の取得に失敗", updated: 0, failed: 0, details: [] };
  }

  if (platinumTargets.length > 0 && (!platinumData || platinumData.changeRatio === null)) {
    return { ok: false, disabled: true, reason: "プラチナ価格の取得に失敗", updated: 0, failed: 0, details: [] };
  }

  // 5) 現在価格取得→新価格計算（金属種別ごと）
  type Entry = { productId: string; variantId: string; newPrice: string; oldPrice: number; metalType: string };
  const entries: Entry[] = [];

  // 金商品の処理
  for (const t of goldTargets) {
    const ratio = goldData!.changeRatio;
    
    // 商品の全バリアント取得
    const resp = await admin.graphql(`
      query($id: ID!) { 
        product(id: $id) { 
          id 
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
    `, { variables: { id: t.productId }});
    
    const body = await resp.json();
    const product = body?.data?.product;
    if (!product) continue;

    // 各バリアントの価格を計算
    for (const edge of product.variants.edges) {
      const variant = edge.node;
      const current = Number(variant.price ?? 0);
      if (!current) continue;

      const newPrice = calcFinalPrice(current, ratio, minPct);
      if (parseFloat(newPrice) !== current) {
        entries.push({ 
          productId: t.productId, 
          variantId: variant.id, 
          newPrice,
          oldPrice: current,
          metalType: 'gold'
        });
      }
    }

    await new Promise(r => setTimeout(r, 150)); // 429対策: クエリ間の待機時間
  }

  // プラチナ商品の処理
  for (const t of platinumTargets) {
    const ratio = platinumData!.changeRatio;
    
    // 商品の全バリアント取得
    const resp = await admin.graphql(`
      query($id: ID!) { 
        product(id: $id) { 
          id 
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
    `, { variables: { id: t.productId }});
    
    const body = await resp.json();
    const product = body?.data?.product;
    if (!product) continue;

    // 各バリアントの価格を計算
    for (const edge of product.variants.edges) {
      const variant = edge.node;
      const current = Number(variant.price ?? 0);
      if (!current) continue;

      const newPrice = calcFinalPrice(current, ratio, minPct);
      if (parseFloat(newPrice) !== current) {
        entries.push({ 
          productId: t.productId, 
          variantId: variant.id, 
          newPrice,
          oldPrice: current,
          metalType: 'platinum'
        });
      }
    }

    await new Promise(r => setTimeout(r, 150)); // 429対策: クエリ間の待機時間
  }

  if (!entries.length) {
    return { ok: true, minPct, updated: 0, failed: 0, details: [], message: "価格変更不要" };
  }

  // 6) productId ごとにまとめて一括更新
  const byProduct = new Map<string, { id: string; price: string; oldPrice: number; metalType: string }[]>();
  for (const e of entries) {
    const arr = byProduct.get(e.productId) ?? [];
    arr.push({ id: e.variantId, price: e.newPrice, oldPrice: e.oldPrice, metalType: e.metalType });
    byProduct.set(e.productId, arr);
  }

  let updated = 0, failed = 0;
  const details: any[] = [];
  let retryDelay = 300; // 初期待機時間（ms）

  for (const [productId, variants] of byProduct) {
    const res = await admin.graphql(`
      mutation UpdateViaBulk($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
        productVariantsBulkUpdate(productId: $productId, variants: $variants) {
          product { id }
          productVariants { id price }
          userErrors { field message }
        }
      }
    `, { variables: { 
      productId, 
      variants: variants.map(v => ({ id: v.id, price: v.price }))
    }});

    const r = await res.json();
    const errs = r?.data?.productVariantsBulkUpdate?.userErrors ?? [];
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
      const updatedVariants = r?.data?.productVariantsBulkUpdate?.productVariants ?? [];
      updated += updatedVariants.length;
      for (const variant of variants) {
        const updatedVariant = updatedVariants.find(uv => uv.id === variant.id);
        details.push({ 
          success: true,
          productId, 
          variantId: variant.id,
          oldPrice: variant.oldPrice,
          newPrice: updatedVariant ? parseFloat(updatedVariant.price) : variant.oldPrice
        });
      }
    }

    // 指数バックオフ式の待機時間（429レート制限対策）
    await new Promise(r => setTimeout(r, retryDelay));
    retryDelay = Math.min(retryDelay * 1.5, 1000); // 最大1秒まで徐々に増加
  }

  // 7) ログ記録（金属種別ごと）
  const goldEntries = entries.filter(e => e.metalType === 'gold');
  const platinumEntries = entries.filter(e => e.metalType === 'platinum');

  const logPromises = [];
  
  if (goldEntries.length > 0) {
    logPromises.push(prisma.priceUpdateLog.create({
      data: {
        shopDomain: shop,
        executionType: 'manual',
        metalType: 'gold',
        priceRatio: goldData!.changeRatio,
        minPricePct: minPct,
        totalProducts: goldTargets.length,
        updatedCount: details.filter(d => d.success && goldEntries.some(e => e.variantId === d.variantId)).length,
        failedCount: details.filter(d => !d.success && goldEntries.some(e => e.variantId === d.variantId)).length,
        success: failed === 0,
        details: JSON.stringify(details.filter(d => goldEntries.some(e => e.variantId === d.variantId)))
      }
    }));
  }

  if (platinumEntries.length > 0) {
    logPromises.push(prisma.priceUpdateLog.create({
      data: {
        shopDomain: shop,
        executionType: 'manual',
        metalType: 'platinum',
        priceRatio: platinumData!.changeRatio,
        minPricePct: minPct,
        totalProducts: platinumTargets.length,
        updatedCount: details.filter(d => d.success && platinumEntries.some(e => e.variantId === d.variantId)).length,
        failedCount: details.filter(d => !d.success && platinumEntries.some(e => e.variantId === d.variantId)).length,
        success: failed === 0,
        details: JSON.stringify(details.filter(d => platinumEntries.some(e => e.variantId === d.variantId)))
      }
    }));
  }

  await Promise.all(logPromises);

  return { 
    ok: true, 
    goldRatio: goldData?.changeRatio || null,
    platinumRatio: platinumData?.changeRatio || null,
    minPct, 
    updated, 
    failed, 
    details,
    summary: {
      total: goldTargets.length + platinumTargets.length,
      success: updated,
      failed: failed,
      gold: goldTargets.length,
      platinum: platinumTargets.length
    },
    message: `${goldTargets.length}件の金商品、${platinumTargets.length}件のプラチナ商品を処理完了`
  };
}