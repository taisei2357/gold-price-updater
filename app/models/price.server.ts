// app/models/price.server.ts
import prisma from "../db.server";
import { fetchGoldChangeRatioTanaka } from "./gold.server";

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
  // 1) 金価格変動率
  const ratio = await fetchGoldChangeRatioTanaka();
  if (ratio === null) {
    return { ok: false, disabled: true, reason: "金価格の取得に失敗", updated: 0, failed: 0, details: [] };
  }

  // 2) 下限％
  const setting = await prisma.shopSetting.findUnique({ where: { shopDomain: shop } });
  const minPct = setting?.minPricePct ?? 93;

  // 3) 対象（SelectedProduct）取得
  const targets = await prisma.selectedProduct.findMany({
    where: { shopDomain: shop },
    select: { productId: true },
  });
  if (!targets.length) {
    return { ok: true, goldRatio: ratio, minPct, updated: 0, failed: 0, details: [], message: "対象なし" };
  }

  // 4) 現在価格取得→新価格計算
  type Entry = { productId: string; variantId: string; newPrice: string; oldPrice: number };
  const entries: Entry[] = [];

  for (const t of targets) {
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
          oldPrice: current
        });
      }
    }

    await new Promise(r => setTimeout(r, 150)); // 429対策: クエリ間の待機時間
  }

  if (!entries.length) {
    return { ok: true, goldRatio: ratio, minPct, updated: 0, failed: 0, details: [], message: "価格変更不要" };
  }

  // 5) productId ごとにまとめて一括更新
  const byProduct = new Map<string, { id: string; price: string; oldPrice: number }[]>();
  for (const e of entries) {
    const arr = byProduct.get(e.productId) ?? [];
    arr.push({ id: e.variantId, price: e.newPrice, oldPrice: e.oldPrice });
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

  return { 
    ok: true, 
    goldRatio: ratio, 
    minPct, 
    updated, 
    failed, 
    details
  };
}