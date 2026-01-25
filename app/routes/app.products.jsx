import { useState, useCallback, useEffect, useRef, useMemo, Suspense, Fragment } from "react";
import { json, defer } from "@remix-run/node";
import { useLoaderData, useFetcher, Await, useRevalidator } from "@remix-run/react";
import {
  Page,
  Layout,
  Card,
  DataTable,
  IndexTable,
  Button,
  TextField,
  Select,
  Banner,
  Spinner,
  Checkbox,
  ButtonGroup,
  Modal,
  TextContainer,
  BlockStack,
  InlineStack,
  Badge,
  Icon,
  Box,
  Text,
  Tooltip,
} from "@shopify/polaris";
import {
  ProductIcon,
  CheckCircleIcon,
  RefreshIcon,
} from "@shopify/polaris-icons";
import { ClientCache, CACHE_KEYS } from "../utils/cache";
import { authenticate } from "../shopify.server";
import { runBulkUpdateBySpec } from "../models/price.server";
import { sendPriceUpdateNotification } from "../utils/email.server";
import { fetchGoldPriceDataTanaka, fetchPlatinumPriceDataTanaka } from "../models/gold.server";
import prisma from "../db.server";

// Cache-Control: no-store ヘッダー
export const headers = () => ({
  "Cache-Control": "no-store, no-cache, must-revalidate"
});

// Revalidation制御
export function shouldRevalidate({ formAction, actionResult }) {
  // 手動価格更新後は常に再検証
  if (actionResult?.updateResults || actionResult?.message) {
    return true;
  }
  return true; // この画面は常にリフレッシュ
}

// 行ごとの独立した解除ボタンコンポーネント
function UnselectButton({ productId, onOptimistic, scheduleRevalidate }) {
  const fx = useFetcher();
  const busy = fx.state !== "idle";

  // 成功後の最小限の後処理
  useEffect(() => {
    if (fx.state === "idle" && fx.data?.success) {
      scheduleRevalidate?.();
    }
  }, [fx.state, fx.data, scheduleRevalidate]);

  return (
    <fx.Form method="post" replace>
      <input type="hidden" name="action" value="unselectProducts" />
      <input type="hidden" name="productId" value={productId} />
      <Button
        size="micro"
        variant="tertiary"
        tone="critical"
        loading={busy}
        disabled={busy}
        onClick={(e) => {
          e.preventDefault(); // 送信前に楽観更新
          onOptimistic?.(productId);
          const fd = new FormData(e.currentTarget.form);
          fx.submit(fd, { method: "post" });
        }}
      >
        解除
      </Button>
    </fx.Form>
  );
}

// 商品フィルタリング（検索条件による）
function filterProducts(products, searchTerm, filterType = "all") {
  let filtered = products;
  
  // 商品タイプでフィルタ
  if (filterType === "k18") {
    filtered = products.filter(product => 
      product.title.includes("K18") || product.title.includes("18金")
    );
  } else if (filterType === "in_stock") {
    filtered = products.filter(product => 
      (product.totalInventory || 0) > 0
    );
  } else if (filterType === "out_of_stock") {
    filtered = products.filter(product => 
      (product.totalInventory || 0) === 0
    );
  }
  
  // 検索条件でフィルタ
  if (searchTerm) {
    filtered = filtered.filter(product =>
      product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.handle.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }
  
  return filtered;
}

// 価格計算（ユーザー設定の調整率対応）
function calculateNewPrice(currentPrice, adjustmentRatio, minPriceRate = 0.93) {
  const newPrice = currentPrice * (1 + adjustmentRatio);
  const minPrice = currentPrice * minPriceRate;
  
  // 下限制限適用
  const finalPrice = Math.max(newPrice, minPrice);
  
  // 10円単位で丸め（上げ方向は切り上げ、下げ方向は切り捨て）
  return (adjustmentRatio >= 0)
    ? Math.ceil(finalPrice / 10) * 10
    : Math.floor(finalPrice / 10) * 10;
}

// コレクション内の商品IDを全部取得（完全ページネーション対応）
async function fetchProductIdsByCollection(admin, collectionId) {
  const ids = [];
  let after = null;
  let hasNext = true;

  while (hasNext) {
    const res = await admin.graphql(
      `#graphql
       query($id: ID!, $first: Int!, $after: String) {
         collection(id: $id) {
           products(first: $first, after: $after) {
             edges {
               cursor
               node { id }
             }
             pageInfo { hasNextPage }
           }
         }
       }`,
      { variables: { id: collectionId, first: 250, after } }
    );

    const body = await res.json();
    if (body?.errors?.length) throw new Error(body.errors[0].message || "GraphQL error");

    const edges = body?.data?.collection?.products?.edges ?? [];
    ids.push(...edges.map(e => e.node.id));
    hasNext = body?.data?.collection?.products?.pageInfo?.hasNextPage ?? false;
    after = edges.length ? edges[edges.length - 1].cursor : null;
  }

  // 念のため重複排除
  return Array.from(new Set(ids));
}

// コレクション取得（APIバージョン差に強い実装）
async function fetchAllCollections(admin) {
  async function paginate(query, rootKey, pickCount) {
    const out = [];
    let cursor = null;
    let hasNext = true;

    while (hasNext) {
      const res = await admin.graphql(query, { variables: { first: 250, after: cursor } });
      const body = await res.json();
      if (body?.errors?.length) throw new Error(JSON.stringify(body.errors));

      const conn = body?.data?.[rootKey];
      const edges = conn?.edges ?? [];
      for (const { node } of edges) {
        out.push({
          id: node.id,
          title: node.title,
          handle: node.handle,
          // 取得できた場合のみ件数を設定
          productsCount:
            pickCount === "scalar" ? Number(node.productsCount ?? 0) :
            pickCount === "object" ? Number(node.productsCount?.count ?? 0) :
            undefined,
        });
      }
      hasNext = conn?.pageInfo?.hasNextPage ?? false;
      cursor = edges.length ? edges[edges.length - 1].cursor : null;
    }
    return out;
  }

  const qCollectionsScalar = `#graphql
    query($first:Int!,$after:String){
      collections(first:$first, after:$after){
        edges{cursor node{ id title handle productsCount }}
        pageInfo{hasNextPage}
      }
    }`;

  const qCollectionsNoCount = `#graphql
    query($first:Int!,$after:String){
      collections(first:$first, after:$after){
        edges{cursor node{ id title handle }}
        pageInfo{hasNextPage}
      }
    }`;

  const qCustomScalar = `#graphql
    query($first:Int!,$after:String){
      customCollections(first:$first, after:$after){
        edges{cursor node{ id title handle productsCount }}
        pageInfo{hasNextPage}
      }
    }`;
  const qSmartScalar = `#graphql
    query($first:Int!,$after:String){
      smartCollections(first:$first, after:$after){
        edges{cursor node{ id title handle productsCount }}
        pageInfo{hasNextPage}
      }
    }`;

  const qCustomObj = `#graphql
    query($first:Int!,$after:String){
      customCollections(first:$first, after:$after){
        edges{cursor node{ id title handle productsCount{count} }}
        pageInfo{hasNextPage}
      }
    }`;
  const qSmartObj = `#graphql
    query($first:Int!,$after:String){
      smartCollections(first:$first, after:$after){
        edges{cursor node{ id title handle productsCount{count} }}
        pageInfo{hasNextPage}
      }
    }`;

  // 1) collections + scalar productsCount
  try { return await paginate(qCollectionsScalar, "collections", "scalar"); } catch {}

  // 2) collections（件数なし）
  try { return await paginate(qCollectionsNoCount, "collections"); } catch {}

  // 3) custom/smart（scalar）
  try {
    const [c, s] = await Promise.all([
      paginate(qCustomScalar, "customCollections", "scalar"),
      paginate(qSmartScalar, "smartCollections", "scalar"),
    ]);
    return [...c, ...s];
  } catch {}

  // 4) custom/smart（object count）
  try {
    const [c, s] = await Promise.all([
      paginate(qCustomObj, "customCollections", "object"),
      paginate(qSmartObj, "smartCollections", "object"),
    ]);
    return [...c, ...s];
  } catch (e) {
    console.error("fetchAllCollections failed:", e);
    return [];
  }
}

// 重い商品取得処理を分離
async function fetchAllProducts(admin) {
  console.log("🔍 Starting fetchAllProducts");
  let allProducts = [];
  let cursor = null;
  let hasNextPage = true;

  try {
    while (hasNextPage) {
      const response = await admin.graphql(
      `#graphql
        query getProducts($first: Int!, $after: String) {
          products(first: $first, after: $after) {
            edges {
              node {
                id
                title
                handle
                status
                productType
                totalInventory
                createdAt
                variants(first: 250) {
                  edges {
                    node {
                      id
                      title
                      price
                      sku
                      inventoryQuantity
                      updatedAt
                    }
                  }
                }
              }
              cursor
            }
            pageInfo {
              hasNextPage
            }
          }
        }`,
      {
        variables: {
          first: 250,
          after: cursor,
        },
      }
    );

    const responseJson = await response.json();
    
    // GraphQLエラーをチェック
    if (responseJson.errors) {
      console.error('GraphQL query errors:', responseJson.errors);
      throw new Error(`GraphQL Error: ${responseJson.errors[0]?.message || 'Unknown error'}`);
    }
    
    if (!responseJson.data?.products) {
      console.error('No products data in response:', responseJson);
      throw new Error('No products data returned from GraphQL');
    }
    
    const products = responseJson.data.products.edges.map(edge => edge.node);
    allProducts = [...allProducts, ...products];
    console.log(`Fetched ${products.length} products, total: ${allProducts.length}`);
    
    hasNextPage = responseJson.data.products.pageInfo.hasNextPage;
    cursor = responseJson.data.products.edges.length > 0 
      ? responseJson.data.products.edges[responseJson.data.products.edges.length - 1].cursor 
      : null;
    }
    
    console.log(`✅ fetchAllProducts completed: ${allProducts.length} products fetched`);
    return allProducts;
  } catch (error) {
    console.error('❌ fetchAllProducts error:', error);
    throw error;
  }
}

// 金・プラチナ価格情報を取得（詳細データ版）- Server-side only
async function fetchMetalPrices() {
  try {
    const [goldData, platinumData] = await Promise.all([
      fetchGoldPriceDataTanaka(),
      fetchPlatinumPriceDataTanaka()
    ]);
    const toPct = (r) => (typeof r === 'number' && Number.isFinite(r)) ? (r * 100).toFixed(2) : '0.00';

    return {
      gold: goldData ? {
        ratio: (typeof goldData.changeRatio === 'number' && Number.isFinite(goldData.changeRatio)) ? goldData.changeRatio : null,
        percentage: toPct(goldData.changeRatio),
        change: goldData.changePercent,
        retailPrice: goldData.retailPrice,
        retailPriceFormatted: goldData.retailPriceFormatted,
        buyPrice: goldData.buyPrice,
        buyPriceFormatted: goldData.buyPriceFormatted,
        buyChangePercent: goldData.buyChangePercent,
        changeDirection: goldData.changeDirection,
        lastUpdated: goldData.lastUpdated
      } : null,
      platinum: platinumData ? {
        ratio: (typeof platinumData.changeRatio === 'number' && Number.isFinite(platinumData.changeRatio)) ? platinumData.changeRatio : null,
        percentage: toPct(platinumData.changeRatio),
        change: platinumData.changePercent,
        retailPrice: platinumData.retailPrice,
        retailPriceFormatted: platinumData.retailPriceFormatted,
        buyPrice: platinumData.buyPrice,
        buyPriceFormatted: platinumData.buyPriceFormatted,
        buyChangePercent: platinumData.buyChangePercent,
        changeDirection: platinumData.changeDirection,
        lastUpdated: platinumData.lastUpdated
      } : null
    };
  } catch (error) {
    console.error("金属価格取得エラー:", error);
    return { gold: null, platinum: null };
  }
}

export const loader = async ({ request }) => {
  const { admin, session } = await authenticate.admin(request);
  const url = new URL(request.url);
  const forceRefresh = url.searchParams.get('refresh') === 'true';

  // 軽い処理は即座に実行
  const [metalPrices, selectedProducts, selectedCollections, shopSetting] = await Promise.all([
    fetchMetalPrices(),
    prisma.selectedProduct.findMany({
      where: { 
        shopDomain: session.shop,
        selected: true 
      },
      select: { productId: true, metalType: true }
    }),
    prisma.selectedCollection.findMany({
      where: { 
        shopDomain: session.shop,
        selected: true 
      },
      select: { collectionId: true, metalType: true }
    }),
    prisma.shopSetting.findUnique({
      where: { shopDomain: session.shop }
    })
  ]);

  const selectedProductIds = selectedProducts.map(p => p.productId);
  const selectedCollectionIds = selectedCollections.map(c => c.collectionId);

  // forceRefreshが有効な場合はキャッシュをクリア
  if (forceRefresh) {
    console.log("🔄 Force refresh enabled - clearing product cache");
    ClientCache.clear(CACHE_KEYS.PRODUCTS);
  }

  // 重い商品・コレクション取得処理は非同期化
  const productsPromise = fetchAllProducts(admin);
  const collectionsPromise = fetchAllCollections(admin).catch((e) => {
    console.error('fetchAllCollections failed:', e);
    return [];
  });

  return defer({
    products: productsPromise, // Promise を渡す
    collections: collectionsPromise, // Promise を渡す
    goldPrice: metalPrices.gold,
    platinumPrice: metalPrices.platinum,
    selectedProductIds: selectedProductIds,
    savedSelectedProducts: selectedProducts,
    selectedCollectionIds: selectedCollectionIds,
    savedSelectedCollections: selectedCollections,
    shopSetting: shopSetting,
    forceRefresh: forceRefresh,
    cacheTimestamp: Date.now()
  }, {
    // キャッシュを完全に禁止して生データを強制取得
    headers: { 
      "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
      "Pragma": "no-cache"
    }
  });
};

export const action = async ({ request }) => {
  const { admin, session } = await authenticate.admin(request);
  const formData = await request.formData();
  const action = formData.get("action");

  if (action === "saveSelection") {
    // id -> metalType の安全なペアを作る（重複や順序ズレ対策）
    const ids = formData.getAll("productId").map(String);
    const types = formData.getAll("metalType").map(v => v === "platinum" ? "platinum" : "gold");
    const pairs = Array.from(
      new Map(ids.map((id, i) => [id, types[i]])).entries()
    ); // [['gid://...','gold'], ...]

    const saved = [];
    for (const [productId, metalType] of pairs) {
      await prisma.selectedProduct.upsert({
        where: { shopDomain_productId: { shopDomain: session.shop, productId } },
        update: { metalType, selected: true },
        create: { shopDomain: session.shop, productId, selected: true, metalType }
      });
      saved.push({ productId, metalType });
    }
    
    return json({ 
      success: true, 
      message: `${saved.length}件を保存しました`, 
      savedProducts: saved 
    });
  }

  if (action === "saveSingleProduct") {
    const productId = formData.get("productId");
    const metalType = formData.get("metalType");
    
    // 個別商品の金属種別設定を保存（upsert）
    await prisma.selectedProduct.upsert({
      where: { 
        shopDomain_productId: { 
          shopDomain: session.shop, 
          productId: productId 
        } 
      },
      update: { 
        metalType: metalType === 'platinum' ? 'platinum' : 'gold',
        selected: true 
      },
      create: {
        shopDomain: session.shop,
        productId: productId,
        selected: true,
        metalType: metalType === 'platinum' ? 'platinum' : 'gold'
      }
    });
    
    return json({ 
      success: true, 
      message: `商品の金属種別を${metalType === 'platinum' ? 'プラチナ' : '金'}に設定しました`,
      savedProducts: [{ productId, metalType }]
    });
  }

  if (action === "unselectProducts") {
    const productIds = formData.getAll("productId").map(String);
    
    // 指定された商品の選択を解除
    await prisma.selectedProduct.deleteMany({
      where: { 
        shopDomain: session.shop,
        productId: { in: productIds }
      }
    });
    
    return json({ 
      success: true, 
      message: `${productIds.length}件の商品選択を解除しました`,
      unselectedProducts: productIds
    });
  }

  if (action === "updatePrices") {
    const idsFromUI = JSON.parse(formData.get("selectedProductIds") || "[]");
    const minPriceRate = parseFloat(formData.get("minPriceRate"));

    try {
      // runBulkUpdateBySpec に対象IDの絞り込みを渡す
      const result = await runBulkUpdateBySpec(admin, session.shop, { 
        onlyProductIds: idsFromUI.length > 0 ? idsFromUI : null, 
        minPriceRate 
      });
      
      if (!result.ok) {
        return json({ 
          error: result.reason,
          disabled: result.disabled,
          updateResults: []
        });
      }

      // 手動更新成功後のメール通知（設定されている場合、かつ更新件数がある場合）
      try {
        const setting = await prisma.shopSetting.findUnique({ 
          where: { shopDomain: session.shop },
          select: { notificationEmail: true }
        });

        const updatedCount = result.summary?.success ?? result.updated ?? 0;
        const failedCount = result.summary?.failed ?? result.failed ?? 0;

        if (setting?.notificationEmail && updatedCount > 0) {
          const emailData = {
            shopDomain: session.shop,
            updatedCount,
            failedCount,
            goldRatio: typeof result.goldRatio === 'number' ? `${(result.goldRatio * 100).toFixed(2)}%` : undefined,
            platinumRatio: typeof result.platinumRatio === 'number' ? `${(result.platinumRatio * 100).toFixed(2)}%` : undefined,
            timestamp: new Date().toISOString(),
            details: result.details
          };
          const emailRes = await sendPriceUpdateNotification(setting.notificationEmail, emailData);
          if (!emailRes.success) {
            console.error('📧 手動更新メール送信失敗:', emailRes.error);
          }
        }
      } catch (mailErr) {
        console.error('📧 手動更新メール通知エラー:', mailErr);
      }

      return json({ 
        updateResults: result.details,
        summary: result.summary,
        goldRatio: result.goldRatio,
        message: result.message
      });
      
    } catch (error) {
      return json({ 
        error: `価格更新中にエラーが発生しました: ${error.message}`,
        updateResults: []
      });
    }
  }

  if (action === "saveCollectionSelection") {
    const collectionId = formData.get("collectionId");
    const metalType = formData.get("metalType") === "platinum" ? "platinum" : "gold";

    try {
      // 1) コレクション自体の選択を永続化
      await prisma.selectedCollection.upsert({
        where: { shopDomain_collectionId: { shopDomain: session.shop, collectionId } },
        update: { selected: true, metalType },
        create: { shopDomain: session.shop, collectionId, selected: true, metalType },
      });

      // 2) コレクション配下の全商品を取得して upsert（完全ページネーション対応）
      const productIds = await fetchProductIdsByCollection(admin, collectionId);

      const saved = [];
      for (const productId of productIds) {
        await prisma.selectedProduct.upsert({
          where: { shopDomain_productId: { shopDomain: session.shop, productId } },
          update: { selected: true, metalType },
          create: { shopDomain: session.shop, productId, selected: true, metalType },
        });
        saved.push({ productId, metalType });
      }
      
      return json({
        success: true,
        message: `コレクション内 ${saved.length}件を${metalType === "platinum" ? "プラチナ" : "金"}で登録しました`,
        savedProducts: saved,
        savedCollection: { collectionId, metalType }
      });
    } catch (error) {
      return json({ 
        error: `コレクション商品登録中にエラーが発生しました: ${error.message}`,
        success: false
      });
    }
  }

  if (action === "unselectCollection") {
    const collectionId = formData.get("collectionId");
    
    try {
      // 1) コレクションの選択解除
      await prisma.selectedCollection.deleteMany({
        where: { shopDomain: session.shop, collectionId },
      });

      // 2) コレクション配下の全商品を SelectedProduct から削除（完全ページネーション対応）
      const ids = await fetchProductIdsByCollection(admin, collectionId);

      await prisma.selectedProduct.deleteMany({
        where: { shopDomain: session.shop, productId: { in: ids } },
      });

      return json({
        success: true,
        message: `コレクション内 ${ids.length}件の登録を解除しました`,
        unselectedProducts: ids,
        unselectedCollection: collectionId
      });
    } catch (error) {
      return json({ 
        error: `コレクション商品解除中にエラーが発生しました: ${error.message}`,
        success: false
      });
    }
  }

  if (action === "manualUpdatePrices") {
    const selectedProductIds = JSON.parse(formData.get("selectedProductIds") || "[]");
    const adjustmentRatio = parseFloat(formData.get("adjustmentRatio"));

    console.log("🔧 Manual price update started:", { selectedProductIds, adjustmentRatio });

    if (selectedProductIds.length === 0) {
      return json({ 
        error: "更新対象商品が選択されていません",
        updateResults: []
      });
    }

    try {
      // 手動価格更新実行
      const updateResults = [];
      
      for (const productId of selectedProductIds) {
        // 商品とバリアントを取得
        const productResponse = await admin.graphql(
          `#graphql
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
                    }
                  }
                }
              }
            }`,
          { variables: { id: productId } }
        );

        const productData = await productResponse.json();
        const product = productData.data?.product;

        console.log(`📦 Product ${productId} data:`, { product: product?.title, variantCount: product?.variants?.edges?.length });

        if (!product) {
          console.error(`❌ Product ${productId} not found`);
          updateResults.push({
            productId,
            success: false,
            error: "商品が見つかりません"
          });
          continue;
        }

        // 各バリアントの価格を更新
        for (const variantEdge of product.variants.edges) {
          const variant = variantEdge.node;
          const currentPrice = Number(variant.price ?? 0);
          // UIと同じ丸めルール（10円単位、下限制限）
          function round10Yen(price, ratio, minRate = 0.93) {
            const newP = price * (1 + ratio);
            const minP = price * minRate;
            const bounded = Math.max(newP, minP);
            return ratio >= 0 ? Math.ceil(bounded / 10) * 10 : Math.floor(bounded / 10) * 10;
          }
          const newPrice = round10Yen(currentPrice, adjustmentRatio);

          console.log(`💰 Variant ${variant.id} price update:`, { currentPrice, newPrice, adjustmentRatio });

          try {
            console.log(`🚀 Starting GraphQL update for variant ${variant.id} with price ${newPrice}`);
            const inputData = {
              id: variant.id,
              price: newPrice.toString()
            };
            console.log(`📝 GraphQL input data:`, inputData);
            
            // タイムアウト処理付きでGraphQL APIを実行
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 30000); // 30秒タイムアウト
            
            const updateResponse = await admin.graphql(
              `#graphql
                mutation productVariantsBulkUpdate($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
                  productVariantsBulkUpdate(productId: $productId, variants: $variants) {
                    product { id }
                    productVariants { id price }
                    userErrors { field message }
                  }
                }`,
              {
                variables: {
                  productId: productId,
                  variants: [{ id: variant.id, price: newPrice.toString() }]
                },
                signal: controller.signal
              }
            );
            
            clearTimeout(timeoutId);
            console.log(`📡 GraphQL response status: ${updateResponse.status} ${updateResponse.statusText}`);
            
            if (!updateResponse.ok) {
              throw new Error(`GraphQL request failed with status ${updateResponse.status}: ${updateResponse.statusText}`);
            }
            
            const updateData = await updateResponse.json();
            
            console.log(`🔄 GraphQL update response for ${variant.id}:`, updateData);
            
            if (updateData.data?.productVariantsBulkUpdate?.userErrors?.length > 0) {
              updateResults.push({
                productId,
                variantId: variant.id,
                success: false,
                error: updateData.data.productVariantsBulkUpdate.userErrors[0].message
              });
            } else {
              // Shopifyから返された確定価格を使用
              const updatedVariants = updateData.data?.productVariantsBulkUpdate?.productVariants || [];
              const updatedVariant = updatedVariants.find(v => v.id === variant.id);
              const confirmedPrice = updatedVariant?.price 
                ? parseFloat(updatedVariant.price)
                : newPrice;
                
              updateResults.push({
                productId,
                variantId: variant.id,
                productTitle: product.title,
                variantTitle: variant.title,
                success: true,
                oldPrice: currentPrice,
                newPrice: newPrice,
                confirmedPrice: confirmedPrice, // 確定価格を追加
                adjustmentRatio: adjustmentRatio
              });

              // 手動更新成功時：6時間ロックを設定
              try {
                const lockUntil = new Date(Date.now() + 6 * 60 * 60 * 1000);
                
                // 既存ロックを削除してから新規作成
                await prisma.manualPriceLock.deleteMany({
                  where: {
                    shopDomain: session.shop,
                    variantId: variant.id
                  }
                });
                
                await prisma.manualPriceLock.create({
                  data: {
                    shopDomain: session.shop,
                    variantId: variant.id,
                    until: lockUntil
                  }
                });
                
                console.log(`🔒 Manual lock set for variant ${variant.id} until ${lockUntil.toISOString()}`);
              } catch (lockError) {
                console.warn(`⚠️ Failed to set manual lock for ${variant.id}:`, lockError);
              }
            }
          } catch (variantError) {
            console.error(`❌ GraphQL update error for variant ${variant.id}:`, variantError);
            let errorMessage = `価格更新エラー: ${variantError.message}`;
            
            // タイムアウトエラーの場合
            if (variantError.name === 'AbortError') {
              errorMessage = 'リクエストがタイムアウトしました (30秒)';
            }
            // ネットワークエラーの場合
            else if (variantError.message.includes('fetch')) {
              errorMessage = 'ネットワークエラーが発生しました';
            }
            
            updateResults.push({
              productId,
              variantId: variant.id,
              success: false,
              error: errorMessage
            });
          }
        }
      }

      const successCount = updateResults.filter(r => r.success).length;
      const failureCount = updateResults.filter(r => !r.success).length;

      return json({
        updateResults,
        summary: {
          total: updateResults.length,
          success: successCount,
          failed: failureCount
        },
        message: `手動価格更新完了: ${successCount}件成功、${failureCount}件失敗 (調整率: ${adjustmentRatio > 0 ? '+' : ''}${(adjustmentRatio * 100).toFixed(1)}%)`
      });

    } catch (error) {
      return json({
        error: `手動価格更新中にエラーが発生しました: ${error.message}`,
        updateResults: []
      });
    }
  }

  return json({ error: "不正なアクション" });
};

function ProductsContent({ products, collections, goldPrice, platinumPrice, selectedProductIds, savedSelectedProducts, selectedCollectionIds, savedSelectedCollections, shopSetting, forceRefresh, cacheTimestamp }) {
  const mu = useFetcher();       // product/collection の保存・解除用
  const updater = useFetcher();  // 価格更新用
  const revalidator = useRevalidator();
  
  // 保存済み金属種別のマップ
  const savedTypeMap = useMemo(() => {
    const m = {};
    (savedSelectedProducts || []).forEach(sp => { m[sp.productId] = sp.metalType; });
    return m;
  }, [savedSelectedProducts]);
  
  // 保存済みコレクション金属種別のマップ
  const savedCollectionTypeMap = useMemo(() => {
    const m = {};
    (savedSelectedCollections || []).forEach(sc => { m[sc.collectionId] = sc.metalType; });
    return m;
  }, [savedSelectedCollections]);
  
  // 保存済みIDのSet（isSaved判定用）
  const savedIds = useMemo(
    () => new Set((savedSelectedProducts || []).map(sp => sp.productId)),
    [savedSelectedProducts]
  );
  
  // 保存済みコレクションIDのSet
  const savedCollectionIds = useMemo(
    () => new Set((savedSelectedCollections || []).map(sc => sc.collectionId)),
    [savedSelectedCollections]
  );
  
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [productMetalTypes, setProductMetalTypes] = useState({}); // 商品IDと金属種別のマッピング
  const [searchValue, setSearchValue] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [selectionType, setSelectionType] = useState("products"); // "products" or "collections"
  const [selectedCollectionId, setSelectedCollectionId] = useState("all");
  const [minPriceRate, setMinPriceRate] = useState(shopSetting?.minPricePct || 93);
  const [showPreview, setShowPreview] = useState(false);
  const [pricePreview, setPricePreview] = useState([]);
  const [isUsingCache, setIsUsingCache] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  
  // コレクション選択用のstate（初期値をDBから設定）
  const [selectedCollections, setSelectedCollections] = useState(selectedCollectionIds || []); // collectionId[]
  const [collectionMetalTypes, setCollectionMetalTypes] = useState(savedCollectionTypeMap || {}); // { [collectionId]: 'gold'|'platinum' }
  
  // 手動価格更新用のstate
  const [manualUpdateDirection, setManualUpdateDirection] = useState('plus'); // 'plus' or 'minus'
  const [manualUpdatePercentage, setManualUpdatePercentage] = useState(0.1); // 0.1-1.0%
  const [manualSelectedProducts, setManualSelectedProducts] = useState([]); // 手動更新用の選択商品
  const [successMessage, setSuccessMessage] = useState(''); // 成功メッセージ
  const [isManualUpdating, setIsManualUpdating] = useState(false); // 手動更新中フラグ
  
  // 楽観的更新用のstate
  const [optimisticPrices, setOptimisticPrices] = useState({}); // { productId: newPrice }
  const [refreshCountdown, setRefreshCountdown] = useState(0); // 更新までのカウントダウン
  // TTL付きオーバーレイ（variantId -> { price, until }）
  const [priceOverlay, setPriceOverlay] = useState({}); // { variantId: { price: number, until: number } }
  
  // 保存済みIDのローカルミラー
  const [savedIdSet, setSavedIdSet] = useState(
    () => new Set((savedSelectedProducts || []).map(sp => sp.productId))
  );

  // 追加・削除ヘルパー
  const addSaved = useCallback((ids) => {
    setSavedIdSet(prev => new Set([...prev, ...ids]));
  }, []);
  const removeSaved = useCallback((ids) => {
    setSavedIdSet(prev => {
      const next = new Set(prev);
      ids.forEach(id => next.delete(id));
      return next;
    });
  }, []);
  
  // revalidateのデバウンス
  const revalidateTimer = useRef(null);
  const scheduleRevalidate = useCallback(() => {
    if (revalidateTimer.current) clearTimeout(revalidateTimer.current);
    revalidateTimer.current = setTimeout(() => {
      revalidator.revalidate();
      revalidateTimer.current = null;
    }, 500);
  }, [revalidator]);

  useEffect(() => () => {
    if (revalidateTimer.current) clearTimeout(revalidateTimer.current);
  }, []);
  
  // キャッシュ管理とデータ初期化
  useEffect(() => {
    // 価格ページではキャッシュ復元をやめる（常に最新を前提）
    /* キャッシュ復元を無効化 - 常に最新データを使用するため無効化
    if (!forceRefresh) {
      const cachedProducts = ClientCache.get(CACHE_KEYS.PRODUCTS);
      if (cachedProducts && Array.isArray(cachedProducts) && cachedProducts.length > 0) {
        setIsUsingCache(true);
        const cacheInfo = ClientCache.getInfo(CACHE_KEYS.PRODUCTS);
        if (cacheInfo) {
          setLastUpdated(new Date(cacheInfo.timestamp));
        }
        
        // キャッシュされた商品データで選択状態を初期化
        if (selectedProductIds && selectedProductIds.length > 0) {
          const persistedSelected = cachedProducts.filter(p => selectedProductIds.includes(p.id));
          setSelectedProducts(persistedSelected);
          
          // 保存された金属種別設定を復元
          if (savedSelectedProducts && savedSelectedProducts.length > 0) {
            const metalTypeMap = {};
            savedSelectedProducts.forEach(sp => {
              metalTypeMap[sp.productId] = sp.metalType;
            });
            setProductMetalTypes(metalTypeMap);
          }
        }
        return;
      }
    }
    */
    
    // 新しいデータでキャッシュ更新
    if (products && products.length > 0) {
      ClientCache.set(CACHE_KEYS.PRODUCTS, products);
      setIsUsingCache(false);
      setLastUpdated(new Date(cacheTimestamp));
      
      // 選択状態の初期化
      if (selectedProductIds && selectedProductIds.length > 0) {
        const persistedSelected = products.filter(p => selectedProductIds.includes(p.id));
        setSelectedProducts(persistedSelected);
        
        // 保存された金属種別設定を復元
        if (savedSelectedProducts && savedSelectedProducts.length > 0) {
          const metalTypeMap = {};
          savedSelectedProducts.forEach(sp => {
            metalTypeMap[sp.productId] = sp.metalType;
          });
          setProductMetalTypes(metalTypeMap);
        }
      }
    }
  }, [products, selectedProductIds, forceRefresh, cacheTimestamp]);

  // 更新完了時の後処理
  useEffect(() => {
    console.log("🔍 Updater state changed:", { 
      state: updater.state, 
      dataExists: !!updater.data, 
      isManualUpdating,
      hasUpdateResults: !!(updater.data?.updateResults),
      hasSummary: !!(updater.data?.summary)
    });
    
    // 手動更新完了の判定: データがあって結果があればローディングを終了
    if (isManualUpdating && updater.data?.updateResults && updater.data?.summary) {
      console.log("✅ Clearing manual updating state and timeout due to completion");
      setIsManualUpdating(false);
      
      // タイムアウトをクリア
      if (window.manualUpdateTimeoutId) {
        clearTimeout(window.manualUpdateTimeoutId);
        window.manualUpdateTimeoutId = null;
      }
    }
    
    // updaterが"idle"になった時にもローディングを終了（フェイルセーフ）
    if (updater.state === "idle" && isManualUpdating) {
      console.log("✅ Clearing manual updating state due to idle state");
      setIsManualUpdating(false);
      
      // タイムアウトをクリア
      if (window.manualUpdateTimeoutId) {
        clearTimeout(window.manualUpdateTimeoutId);
        window.manualUpdateTimeoutId = null;
      }
    }
    
    if (updater.data) {
      // 手動更新完了後の処理
      if (updater.data.updateResults && updater.data.summary) {
        console.log("✅ Manual update completed:", updater.data);
        
        // 成功メッセージを表示
        const { summary } = updater.data;
        const successCount = summary.successCount || 0;
        const failureCount = summary.failureCount || 0;
        const totalCount = successCount + failureCount;
        
        if (successCount > 0) {
          const message = failureCount > 0 
            ? `価格更新完了: ${successCount}/${totalCount}件成功`
            : `価格更新完了: ${successCount}件の商品価格を更新しました`;
          setSuccessMessage(message);
          
          // 5秒後にメッセージを自動で消す
          setTimeout(() => setSuccessMessage(''), 5000);
        }
        
        // 確定価格でオーバーレイを更新（楽観的更新 → 確定価格）
        const confirmedPrices = {};
        updater.data.updateResults.forEach(result => {
          if (result.success && result.confirmedPrice !== undefined) {
            confirmedPrices[result.variantId] = result.confirmedPrice;
          }
        });
        
        if (Object.keys(confirmedPrices).length > 0) {
          console.log("🎯 Applying confirmed prices from server:", confirmedPrices);
          // 楽観的更新を確定価格で上書き
          setOptimisticPrices(prev => ({ ...prev, ...confirmedPrices }));
          
          // TTL付きオーバーレイに3分間保護する
          const now = Date.now();
          const overlayUpdates = Object.fromEntries(
            Object.entries(confirmedPrices).map(([variantId, price]) => [
              variantId,
              { price, until: now + 3 * 60 * 1000 } // 3分間は戻させない
            ])
          );
          setPriceOverlay(prev => ({ ...prev, ...overlayUpdates }));
        }
        
        // 選択をクリア
        setManualSelectedProducts([]);
      }
      // エラーケースのハンドリング
      else if (updater.data.error) {
        console.error("❌ Manual update error:", updater.data.error);
        setSuccessMessage(`エラー: ${updater.data.error}`);
        setTimeout(() => setSuccessMessage(''), 5000);
      }
    }
  }, [updater.state, updater.data, isManualUpdating]);

  // TTL掃除機能（5秒ごとに期限切れエントリを削除）
  useEffect(() => {
    const id = setInterval(() => {
      const now = Date.now();
      setPriceOverlay(prev => {
        const next = {...prev};
        let changed = false;
        for (const [k, v] of Object.entries(next)) {
          if (v.until <= now) { 
            delete next[k]; 
            changed = true; 
            console.log(`🧹 Cleaned expired overlay for variant: ${k}`);
          }
        }
        return changed ? next : prev;
      });
    }, 5000);
    return () => clearInterval(id);
  }, []);

  // 保存完了時の後処理
  useEffect(() => {
    if (mu.state === "idle" && mu.data) {
      // 保存後：選択リストから外す（現状の挙動のまま）
      if (mu.data.savedProducts) {
        const savedIds = mu.data.savedProducts.map(p => p.productId);
        setSelectedProducts(prev => prev.filter(p => !savedIds.includes(p.id)));
        addSaved(savedIds); // ローカルミラーにも反映（保険）
        // 注意: productMetalTypesは削除せず保持（ドロップダウン表示のため）
      }
      
      // コレクション保存後の処理
      if (mu.data.savedCollection) {
        const { collectionId, metalType } = mu.data.savedCollection;
        setSelectedCollections(prev => [...prev.filter(id => id !== collectionId), collectionId]);
        setCollectionMetalTypes(prev => ({ ...prev, [collectionId]: metalType }));
      }

      // 解除後：ローカルも即時反映しつつ、loaderを再取得
      if (mu.data.unselectedProducts) {
        const removed = new Set(mu.data.unselectedProducts);
        setSelectedProducts(prev => prev.filter(p => !removed.has(p.id)));
        setProductMetalTypes(prev => {
          const next = { ...prev };
          mu.data.unselectedProducts.forEach(id => delete next[id]);
          return next;
        });
        removeSaved(mu.data.unselectedProducts); // ローカルミラーからも削除（保険）
        scheduleRevalidate(); // 連続解除時は最後に1回だけ revalidate
      }

      // コレクション解除後の処理
      if (mu.data.unselectedCollection) {
        const collectionId = mu.data.unselectedCollection;
        setSelectedCollections(prev => prev.filter(id => id !== collectionId));
        setCollectionMetalTypes(prev => {
          const next = { ...prev };
          delete next[collectionId];
          return next;
        });
        scheduleRevalidate();
      }
    }
  }, [mu.state, mu.data, addSaved, removeSaved, scheduleRevalidate]);

  // ソート状態の管理
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState('ascending');
  
  // ソート機能
  const handleSort = useCallback((column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'ascending' ? 'descending' : 'ascending');
    } else {
      setSortColumn(column);
      setSortDirection('ascending');
    }
  }, [sortColumn, sortDirection]);
  
  // 商品をソートする関数
  const sortProducts = useCallback((products) => {
    if (!sortColumn) return products;
    
    return [...products].sort((a, b) => {
      let aValue, bValue;
      
      switch (sortColumn) {
        case 'name':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'inventory':
          aValue = a.totalInventory || 0;
          bValue = b.totalInventory || 0;
          break;
        case 'createdAt':
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
          break;
        case 'productType':
          aValue = a.productType || '';
          bValue = b.productType || '';
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        default:
          return 0;
      }
      
      if (aValue < bValue) {
        return sortDirection === 'ascending' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortDirection === 'ascending' ? 1 : -1;
      }
      return 0;
    });
  }, [sortColumn, sortDirection]);

  // 手動リロード（Shopify認証安全版）
  const handleRefresh = useCallback(() => {
    ClientCache.clear(CACHE_KEYS.PRODUCTS);
    setIsUsingCache(false);
    
    // Remix revalidator使用でセッション保持
    revalidator.revalidate();
  }, [revalidator]);

  // 商品フィルタリングとソート
  const filteredProducts = sortProducts(filterProducts(products, searchValue, filterType));

  // Admin nodes APIを使った検証ポーリング
  const verifyVariantsOnServer = useCallback(async (variantIds, expectedPrices) => {
    const timeout = Date.now() + 10000; // 10秒制限
    
    while (Date.now() < timeout) {
      try {
        const response = await fetch(`/api/verify-variants`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ variantIds, expectedPrices }),
          cache: "no-store"
        });
        const data = await response.json();
        
        if (data.verified) {
          return true;
        }
        
        await new Promise(r => setTimeout(r, 500));
      } catch (error) {
        console.error("Verification polling error:", error);
        break;
      }
    }
    return false;
  }, []);

  // ポーリング検証用の関数（旧版）
  const verifyPricesOnServer = useCallback(async (expectedPrices) => {
    const timeout = Date.now() + 10000; // 10秒制限
    
    while (Date.now() < timeout) {
      try {
        const productIds = Object.keys(expectedPrices);
        const variantIds = [];
        
        // 各商品の最初のvariantIDを取得
        productIds.forEach(productId => {
          const product = filteredProducts.find(p => p.id === productId);
          if (product?.variants?.edges?.[0]) {
            variantIds.push(product.variants.edges[0].node.id);
          }
        });
        
        const response = await fetch(`/api/variants?ids=${variantIds.join(",")}`, {
          cache: "no-store"
        });
        const data = await response.json();
        
        if (data.variants) {
          const allMatched = data.variants.every(variant => {
            const expectedPrice = expectedPrices[variant.productId];
            return expectedPrice && Math.abs(variant.price - expectedPrice) < 1;
          });
          
          if (allMatched) {
            console.log("✅ All prices verified on server");
            return true;
          }
        }
        
        await new Promise(r => setTimeout(r, 500)); // 500ms待機
      } catch (error) {
        console.error("Polling error:", error);
        break;
      }
    }
    
    console.log("⏰ Polling timeout reached");
    return false;
  }, [filteredProducts]);

  // 商品選択ハンドラ
  const handleSelectProduct = useCallback((productId, isSelected) => {
    const product = products.find(p => p.id === productId);
    if (isSelected) {
      setSelectedProducts(prev => [...prev, product]);
      // チェック時は金属種別を自動設定しない（ユーザーが選択するまで待つ）
    } else {
      setSelectedProducts(prev => prev.filter(p => p.id !== productId));
      // 選択解除時は金属種別も削除
      setProductMetalTypes(prev => {
        const newTypes = { ...prev };
        delete newTypes[productId];
        return newTypes;
      });
    }
  }, [products]);

  // 全選択/全解除
  const handleSelectAll = useCallback((isSelected) => {
    if (isSelected) {
      setSelectedProducts(filteredProducts);
      // 全選択時は金属種別を自動設定しない（ユーザーが個別に選択する）
    } else {
      setSelectedProducts([]);
      // 全解除時は金属種別もクリア
      setProductMetalTypes({});
    }
  }, [filteredProducts]);

  // 金属種別変更ハンドラー
  const handleMetalTypeChange = useCallback((productId, metalType) => {
    // "none"は無効な選択なので無視
    if (metalType === "none") return;
    
    setProductMetalTypes(prev => ({ ...prev, [productId]: metalType }));
    addSaved([productId]); // 即座に保存扱い
    
    // 金属種別設定時に即座にサーバーに保存
    const formData = new FormData();
    formData.append("action", "saveSingleProduct");
    formData.append("productId", productId);
    formData.append("metalType", metalType);
    
    mu.submit(formData, { method: "post" });
  }, [mu, addSaved]);

  // コレクション選択トグル
  const handleSelectCollection = useCallback((collectionId, checked) => {
    setSelectedCollections(prev =>
      checked ? [...new Set([...prev, collectionId])] : prev.filter(id => id !== collectionId)
    );
    if (!checked) {
      // 解除時はDBからも外す
      const fd = new FormData();
      fd.append("action", "unselectCollection");
      fd.append("collectionId", collectionId);
      mu.submit(fd, { method: "post" });
    }
  }, [mu]);

  // コレクションの金属種別を設定→即保存
  const handleCollectionMetalTypeChange = useCallback((collectionId, type) => {
    // "none"は無効な選択なので無視
    if (type === "none") return;
    
    setCollectionMetalTypes(prev => ({ ...prev, [collectionId]: type }));

    const fd = new FormData();
    fd.append("action", "saveCollectionSelection");
    fd.append("collectionId", collectionId);
    fd.append("metalType", type);
    mu.submit(fd, { method: "post" });
  }, [mu]);

  // 一括金属種別設定ハンドラー（新規選択商品のみ対象）
  const handleBulkMetalTypeChange = useCallback((metalType) => {
    const targetProducts = selectedProducts.filter(product => !selectedProductIds.includes(product.id));
    
    if (targetProducts.length === 0) return;
    
    const newMetalTypes = {};
    targetProducts.forEach(product => {
      newMetalTypes[product.id] = metalType;
    });
    setProductMetalTypes(prev => ({ ...prev, ...newMetalTypes }));
    addSaved(targetProducts.map(p => p.id)); // 即座に保存扱い
    
    // 一括設定時も即座にDBに保存
    const formData = new FormData();
    formData.append("action", "saveSelection");
    
    targetProducts.forEach(product => {
      formData.append("productId", product.id);
      formData.append("metalType", metalType);
    });
    
    mu.submit(formData, { method: "post" });
  }, [selectedProducts, selectedProductIds, mu, addSaved]);

  // 選択状態を保存
  const saveSelection = useCallback(() => {
    // 金属種別が未選択の商品をチェック
    const unsetProducts = selectedProducts.filter(product => !productMetalTypes[product.id]);
    
    if (unsetProducts.length > 0) {
      alert(`以下の商品の金属種別を選択してください：\n${unsetProducts.map(p => p.title).join('\n')}`);
      return;
    }
    
    addSaved(selectedProducts.map(p => p.id)); // 即座に保存扱い
    
    const formData = new FormData();
    formData.append("action", "saveSelection");
    selectedProducts.forEach(product => {
      formData.append("productId", product.id);
      formData.append("metalType", productMetalTypes[product.id]);
    });
    
    mu.submit(formData, { method: "post" });
  }, [selectedProducts, productMetalTypes, mu, addSaved]);

  // 商品選択解除ハンドラー
  const handleUnselectProduct = useCallback((productId) => {
    // ① 楽観的更新：プレビュー対象から即時に外す
    setSelectedProducts(prev => prev.filter(p => p.id !== productId));
    setProductMetalTypes(prev => {
      const next = { ...prev };
      delete next[productId];
      return next;
    });
    removeSaved([productId]); // 保存扱いから即時除外
    // ② サーバーに解除リクエスト
    const formData = new FormData();
    formData.append("action", "unselectProducts");
    formData.append("productId", productId);
    
    mu.submit(formData, { method: "post" });
  }, [mu, removeSaved]);

  // 選択中の保存済みを一括解除
  const handleBulkUnselect = useCallback(() => {
    const ids = selectedProducts.filter(p => savedIdSet.has(p.id)).map(p => p.id);
    if (ids.length === 0) return;

    // 楽観的更新
    removeSaved(ids);
    setSelectedProducts(prev => prev.filter(p => !ids.includes(p.id)));
    setProductMetalTypes(prev => {
      const next = {...prev}; 
      ids.forEach(id => delete next[id]); 
      return next;
    });

    // サーバー
    const fd = new FormData();
    fd.append("action", "unselectProducts");
    ids.forEach(id => fd.append("productId", id));
    mu.submit(fd, { method: "post" });
  }, [selectedProducts, savedIdSet, removeSaved, mu]);

  // 価格プレビュー生成
  const generatePricePreview = useCallback(() => {
    if (selectedProducts.length === 0) return;

    const preview = selectedProducts.map(product => {
      const metalType = productMetalTypes[product.id] || 'gold';
      const priceData = metalType === 'gold' ? goldPrice : platinumPrice;
      
      if (!priceData) {
        return {
          ...product,
          metalType,
          error: `${metalType === 'gold' ? '金' : 'プラチナ'}価格データが取得できません`,
          variants: product.variants.edges.map(edge => ({
            ...edge.node,
            currentPrice: parseFloat(edge.node.price),
            newPrice: parseFloat(edge.node.price),
            priceChange: 0,
            changed: false
          }))
        };
      }

      return {
        ...product,
        metalType,
        variants: product.variants.edges.map(edge => {
          const variant = edge.node;
          const currentPrice = Number(variant.price?.amount ?? 0);
          const newPrice = calculateNewPrice(currentPrice, priceData.ratio, minPriceRate / 100);
          
          return {
            ...variant,
            currentPrice,
            newPrice,
            priceChange: newPrice - currentPrice,
            changed: newPrice !== currentPrice
          };
        })
      };
    });

    setPricePreview(preview);
    setShowPreview(true);
  }, [selectedProducts, goldPrice, platinumPrice, productMetalTypes, minPriceRate]);

  // 価格更新実行
  const executePriceUpdate = useCallback(() => {
    // 金またはプラチナ価格が利用可能かチェック
    const hasGoldProducts = selectedProducts.some(p => (productMetalTypes[p.id] || 'gold') === 'gold');
    const hasPlatinumProducts = selectedProducts.some(p => productMetalTypes[p.id] === 'platinum');
    
    if (hasGoldProducts && !goldPrice) return;
    if (hasPlatinumProducts && !platinumPrice) return;
    
    // 選択商品のIDリストを送信
    const ids = selectedProducts.map(p => p.id);

    updater.submit(
      {
        action: "updatePrices",
        selectedProductIds: JSON.stringify(ids),
        minPriceRate: minPriceRate.toString()
      },
      { method: "post" }
    );

    setShowPreview(false);
  }, [selectedProducts, goldPrice, platinumPrice, productMetalTypes, minPriceRate, updater]);

  // 手動価格更新用のハンドラー
  const handleManualProductSelect = useCallback((productId, isSelected) => {
    if (isSelected) {
      setManualSelectedProducts(prev => [...prev, productId]);
    } else {
      setManualSelectedProducts(prev => prev.filter(id => id !== productId));
    }
  }, []);

  const handleManualSelectAll = useCallback((isSelected) => {
    if (isSelected) {
      setManualSelectedProducts(filteredProducts.map(p => p.id));
    } else {
      setManualSelectedProducts([]);
    }
  }, [filteredProducts]);

  const executeManualPriceUpdate = useCallback(() => {
    if (manualSelectedProducts.length === 0) return;
    
    console.log("🔄 executeManualPriceUpdate called, setting isManualUpdating to true");
    // ローディング状態を開始
    setIsManualUpdating(true);
    
    // フェイルセーフ: 30秒後に強制的にローディングを停止
    const timeoutId = setTimeout(() => {
      console.warn("⚠️ Manual update timeout - forcing loading to stop");
      setIsManualUpdating(false);
    }, 30000);
    
    // タイムアウトIDを保存して、正常完了時にクリア
    window.manualUpdateTimeoutId = timeoutId;
    
    const adjustmentRatio = manualUpdateDirection === 'plus' 
      ? manualUpdatePercentage / 100 
      : -(manualUpdatePercentage / 100);

    console.log("🚀 Starting manual price update:", { manualSelectedProducts, adjustmentRatio });

    // 楽観的更新: 即座にUIの価格を更新（variantId単位）
    const optimisticUpdates = {};
    manualSelectedProducts.forEach(productId => {
      const product = filteredProducts.find(p => p.id === productId);
      console.log("🔍 Product found for optimistic update:", { productId, product: product?.title, variants: product?.variants });
      
      if (product?.variants?.edges?.length > 0) {
        // 各variantの価格を個別に更新（scalar price対応）
        product.variants.edges.forEach(({ node: variant }) => {
          const currentPrice = Math.round(Number(variant.price ?? 0));
          // サーバーと同じ10円単位丸め（下限制限付き）
          function round10Yen(price, ratio, minRate = 0.93) {
            const newP = price * (1 + ratio);
            const minP = price * minRate;
            const bounded = Math.max(newP, minP);
            return ratio >= 0 ? Math.ceil(bounded / 10) * 10 : Math.floor(bounded / 10) * 10;
          }
          const newPrice = round10Yen(currentPrice, adjustmentRatio);
          console.log("💰 Variant price calculation:", { variantId: variant.id, currentPrice, adjustmentRatio, newPrice });
          optimisticUpdates[variant.id] = newPrice;
        });
      } else {
        console.warn("⚠️ No variants found for product:", productId);
      }
    });
    
    setOptimisticPrices(prev => {
      const newState = { ...prev, ...optimisticUpdates };
      console.log("✨ Optimistic price updates applied:", {
        previous: prev,
        updates: optimisticUpdates,
        newState
      });
      return newState;
    });

    updater.submit(
      {
        action: "manualUpdatePrices",
        selectedProductIds: JSON.stringify(manualSelectedProducts),
        adjustmentRatio: adjustmentRatio.toString()
      },
      { method: "post" }
    );

    // サーバー検証ポーリング + TTL調整
    const variantIds = Object.keys(optimisticUpdates).map(vid => vid);
    verifyVariantsOnServer(variantIds, optimisticUpdates).then((verified) => {
      if (verified) {
        console.log("✅ Server verification successful - extending TTL");
        // 検証成功：TTLを短縮（60秒で切り替え）
        setTimeout(() => {
          console.log("🔄 Clearing optimistic updates after verification");
          setOptimisticPrices({});
          ClientCache.clear(CACHE_KEYS.PRODUCTS);
          revalidator.revalidate();
        }, 60000);
      } else {
        console.log("⚠️ Server verification failed - extending protection");
        // 検証失敗：TTLを延長（5分間保護）
        // TTLオーバーレイで5分間保護されるので、楽観的更新はクリア
        setTimeout(() => {
          setOptimisticPrices({});
        }, 5000);
      }
    });
    
    // カウントダウン表示のための短期タイマー
    let countdown = 10;
    setRefreshCountdown(countdown);
    const countdownInterval = setInterval(() => {
      countdown--;
      setRefreshCountdown(countdown);
      if (countdown <= 0) {
        clearInterval(countdownInterval);
        setRefreshCountdown(0);
      }
    }, 1000);
  }, [manualSelectedProducts, manualUpdateDirection, manualUpdatePercentage, updater, filteredProducts, revalidator, setIsManualUpdating]);


  return (
    <Page
      fullWidth
      title="商品価格自動調整"
      subtitle={
        selectionType === 'products'
          ? `${filteredProducts.length}件の商品（全${products.length}件）`
          : `${collections?.length ?? 0}件のコレクション`
      }
      primaryAction={{
        content: "価格調整プレビュー",
        onAction: generatePricePreview,
        disabled: selectionType !== 'products' || selectedProducts.length === 0 || 
          (selectedProducts.some(p => (productMetalTypes[p.id] || 'gold') === 'gold') && !goldPrice) ||
          (selectedProducts.some(p => productMetalTypes[p.id] === 'platinum') && !platinumPrice),
        loading: selectionType === 'products' && updater.state === "submitting"
      }}
      secondaryActions={[
        {
          content: "商品を再読み込み",
          icon: RefreshIcon,
          onAction: handleRefresh,
          loading: revalidator.state === "loading"
        }
      ]}
    >
      <Layout>
        <Layout.Section>
          <Layout>
            <Layout.Section>
              {goldPrice && (
                <Card>
                  <div style={{
                    padding: '16px', 
                    background: 'white', 
                    border: '1px solid #ffd700',
                    borderRadius: '8px'
                  }}>
                    <BlockStack gap="300">
                      <InlineStack align="space-between" blockAlign="center">
                        <InlineStack gap="200" blockAlign="center">
                          <div style={{
                            width: '32px',
                            height: '32px',
                            background: 'linear-gradient(135deg, #ffd700 0%, #ffb300 100%)',
                            borderRadius: '6px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '14px',
                            fontWeight: '700',
                            color: 'white'
                          }}>
                            K
                          </div>
                          <Text variant="headingMd">
                            純金価格
                          </Text>
                          <Text variant="bodySm" tone="subdued">
                            田中貴金属工業
                          </Text>
                        </InlineStack>
                        <Badge tone={goldPrice.changeDirection === 'up' ? 'critical' : goldPrice.changeDirection === 'down' ? 'success' : 'info'}>
                          {goldPrice.changeDirection === 'up' ? '↗️ 上昇' : goldPrice.changeDirection === 'down' ? '↘️ 下落' : '➡️ 変動なし'}
                        </Badge>
                      </InlineStack>
                      
                      <InlineStack gap="200" wrap>
                        <div style={{
                          background: '#f9fafb',
                          padding: '8px 12px',
                          borderRadius: '6px',
                          border: '1px solid #e5e7eb'
                        }}>
                          <Text variant="bodyXs" tone="subdued">
                            小売価格
                          </Text>
                          <Text variant="bodyMd" style={{ fontWeight: '600', marginTop: '2px' }}>
                            {goldPrice.retailPriceFormatted}
                          </Text>
                        </div>
                        <div style={{
                          background: '#f9fafb',
                          padding: '8px 12px',
                          borderRadius: '6px',
                          border: '1px solid #e5e7eb'
                        }}>
                          <Text variant="bodyXs" tone="subdued">
                            前日比
                          </Text>
                          <Text variant="bodyMd" style={{ fontWeight: '600', marginTop: '2px' }}>
                            {goldPrice.change}
                          </Text>
                        </div>
                        <div style={{
                          background: '#fef9c3',
                          padding: '8px 12px',
                          borderRadius: '6px',
                          border: '1px solid #ffd700'
                        }}>
                          <Text variant="bodyXs" tone="subdued">
                            調整率
                          </Text>
                          <Text variant="bodyMd" style={{ fontWeight: '600', marginTop: '2px' }}>
                            {goldPrice.percentage}%
                          </Text>
                        </div>
                      </InlineStack>
                      
                      <div style={{
                        background: '#f3f4f6',
                        padding: '6px 10px',
                        borderRadius: '4px',
                        textAlign: 'center'
                      }}>
                        <Text variant="bodyXs" tone="subdued">
                          最終更新: {new Date(goldPrice.lastUpdated).toLocaleTimeString('ja-JP', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </Text>
                      </div>
                    </BlockStack>
                  </div>
                </Card>
              )}

              {!goldPrice && (
                <Banner tone="critical">
                  金価格情報の取得に失敗しました。
                </Banner>
              )}
            </Layout.Section>

            <Layout.Section>
              {platinumPrice && (
                <Card>
                  <div style={{
                    padding: '16px', 
                    background: 'white', 
                    border: '1px solid #64748b',
                    borderRadius: '8px'
                  }}>
                    <BlockStack gap="300">
                      <InlineStack align="space-between" blockAlign="center">
                        <InlineStack gap="200" blockAlign="center">
                          <div style={{
                            width: '32px',
                            height: '32px',
                            background: '#64748b',
                            borderRadius: '6px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '12px',
                            fontWeight: '700',
                            color: 'white'
                          }}>
                            Pt
                          </div>
                          <Text variant="headingMd">
                            純プラチナ価格
                          </Text>
                          <Text variant="bodySm" tone="subdued">
                            田中貴金属工業
                          </Text>
                        </InlineStack>
                        <Badge tone={platinumPrice.changeDirection === 'up' ? 'critical' : platinumPrice.changeDirection === 'down' ? 'success' : 'info'}>
                          {platinumPrice.changeDirection === 'up' ? '↗️ 上昇' : platinumPrice.changeDirection === 'down' ? '↘️ 下落' : '➡️ 変動なし'}
                        </Badge>
                      </InlineStack>
                      
                      <InlineStack gap="200" wrap>
                        <div style={{
                          background: '#f9fafb',
                          padding: '8px 12px',
                          borderRadius: '6px',
                          border: '1px solid #e5e7eb'
                        }}>
                          <Text variant="bodyXs" tone="subdued">
                            小売価格
                          </Text>
                          <Text variant="bodyMd" style={{ fontWeight: '600', marginTop: '2px' }}>
                            {platinumPrice.retailPriceFormatted}
                          </Text>
                        </div>
                        <div style={{
                          background: '#f9fafb',
                          padding: '8px 12px',
                          borderRadius: '6px',
                          border: '1px solid #e5e7eb'
                        }}>
                          <Text variant="bodyXs" tone="subdued">
                            前日比
                          </Text>
                          <Text variant="bodyMd" style={{ fontWeight: '600', marginTop: '2px' }}>
                            {platinumPrice.change}
                          </Text>
                        </div>
                        <div style={{
                          background: '#f1f5f9',
                          padding: '8px 12px',
                          borderRadius: '6px',
                          border: '1px solid #64748b'
                        }}>
                          <Text variant="bodyXs" tone="subdued">
                            調整率
                          </Text>
                          <Text variant="bodyMd" style={{ fontWeight: '600', marginTop: '2px' }}>
                            {platinumPrice.percentage}%
                          </Text>
                        </div>
                      </InlineStack>
                      
                      <div style={{
                        background: '#f3f4f6',
                        padding: '6px 10px',
                        borderRadius: '4px',
                        textAlign: 'center'
                      }}>
                        <Text variant="bodyXs" tone="subdued">
                          最終更新: {new Date(platinumPrice.lastUpdated).toLocaleTimeString('ja-JP', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </Text>
                      </div>
                    </BlockStack>
                  </div>
                </Card>
              )}

              {!platinumPrice && (
                <Banner tone="critical">
                  プラチナ価格情報の取得に失敗しました。
                </Banner>
              )}
            </Layout.Section>
          </Layout>

          {(!goldPrice && !platinumPrice) && (
            <Banner tone="critical">
              金・プラチナ価格情報の取得に失敗しました。価格調整機能をご利用いただけません。
            </Banner>
          )}
        </Layout.Section>

        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <InlineStack align="space-between">
                <h3>商品検索・選択</h3>
                <Button 
                  icon={RefreshIcon} 
                  variant="tertiary" 
                  onClick={handleRefresh}
                  loading={revalidator.state === "loading"}
                >
                  商品を再読み込み
                </Button>
              </InlineStack>
              
              {/* キャッシュ状態表示 */}
              <div>
                <InlineStack gap="200">
                  <Text variant="bodySm" tone="subdued" suppressHydrationWarning>
                    最終更新: {lastUpdated ? lastUpdated.toLocaleString('ja-JP') : '読み込み中...'} 
                    {isUsingCache && (
                      <Badge tone="info" size="small">キャッシュ</Badge>
                    )}
                  </Text>
                  {sortColumn && (
                    <Text variant="bodySm" tone="info" suppressHydrationWarning>
                      📊 ソート適用中: {
                        sortColumn === 'name' ? '商品名' :
                        sortColumn === 'inventory' ? '在庫数' :
                        sortColumn === 'createdAt' ? '作成日' :
                        sortColumn === 'productType' ? '商品タイプ' :
                        sortColumn === 'status' ? 'ステータス' : sortColumn
                      } ({sortDirection === 'ascending' ? '昇順' : '降順'})
                    </Text>
                  )}
                </InlineStack>
              </div>
              
              <InlineStack gap="400">
                <div style={{minWidth: '180px'}}>
                  <Select
                    label="表示する内容"
                    options={[
                      {label: "全ての商品", value: "products"},
                      {label: "全てのコレクション", value: "collections"}
                    ]}
                    value={selectionType}
                    onChange={setSelectionType}
                  />
                </div>
                
                {selectionType === "products" && (
                  <>
                    <div style={{flex: 1}}>
                      <TextField
                        label="商品検索"
                        value={searchValue}
                        onChange={setSearchValue}
                        placeholder="商品名またはハンドルで検索..."
                        clearButton
                        onClearButtonClick={() => setSearchValue("")}
                      />
                    </div>
                    <div style={{minWidth: '150px'}}>
                      <Select
                        label="商品フィルター"
                        options={[
                          {label: "すべての商品", value: "all"},
                          {label: "K18商品のみ", value: "k18"},
                          {label: "在庫有商品のみ", value: "in_stock"},
                          {label: "在庫無商品のみ", value: "out_of_stock"}
                        ]}
                        value={filterType}
                        onChange={setFilterType}
                      />
                    </div>
                    <div style={{minWidth: '200px'}}>
                      <Select
                        label="📊 並び替え"
                        helpText="商品の表示順序を変更できます"
                        options={[
                          {label: "📋 並び替えなし（デフォルト）", value: "none"},
                          {label: "📝 商品名（A→Z）", value: "name-asc"},
                          {label: "📝 商品名（Z→A）", value: "name-desc"},
                          {label: "📦 在庫数（多い→少ない）", value: "inventory-desc"},
                          {label: "📦 在庫数（少ない→多い）", value: "inventory-asc"},
                          {label: "🆕 作成日（新しい→古い）", value: "createdAt-desc"},
                          {label: "📅 作成日（古い→新しい）", value: "createdAt-asc"},
                          {label: "🏷️ 商品タイプ（A→Z）", value: "productType-asc"},
                          {label: "🏷️ 商品タイプ（Z→A）", value: "productType-desc"},
                          {label: "✅ ステータス（A→Z）", value: "status-asc"},
                          {label: "✅ ステータス（Z→A）", value: "status-desc"}
                        ]}
                        value={sortColumn && sortDirection ? `${sortColumn}-${sortDirection === 'ascending' ? 'asc' : 'desc'}` : 'none'}
                        onChange={(value) => {
                          if (value === 'none') {
                            setSortColumn(null);
                            setSortDirection('ascending');
                          } else {
                            const [column, direction] = value.split('-');
                            setSortColumn(column);
                            setSortDirection(direction === 'asc' ? 'ascending' : 'descending');
                          }
                        }}
                      />
                    </div>
                  </>
                )}
                
                {selectionType === "collections" && (
                  <div style={{minWidth: '200px'}}>
                    <Text variant="bodySm" tone="subdued">
                      コレクションを選択して商品を表示
                    </Text>
                  </div>
                )}
              </InlineStack>
              
              <TextField
                label="価格下限設定 (%)"
                type="number"
                value={minPriceRate.toString()}
                onChange={(value) => setMinPriceRate(parseInt(value) || 93)}
                suffix="%"
                helpText="現在価格に対する最低価格の割合（例: 93% = 7%以上は下がらない）"
                min="50"
                max="100"
              />

                <BlockStack gap="300">
                  <InlineStack gap="300">
                    <Button 
                      key="select-all"
                      onClick={() => handleSelectAll(true)}
                      disabled={filteredProducts.length === 0}
                      size="large"
                    >
                      すべて選択
                    </Button>
                    <Button 
                      key="deselect-all"
                      onClick={() => handleSelectAll(false)}
                      disabled={selectedProducts.length === 0}
                      size="large"
                    >
                      選択解除
                    </Button>
                    <Button 
                      key="bulk-unselect"
                      onClick={handleBulkUnselect}
                      tone="critical"
                      disabled={selectedProducts.filter(p => savedIdSet.has(p.id)).length === 0 || mu.state === "submitting"}
                      size="large"
                    >
                      選択中の保存済み {selectedProducts.filter(p => savedIdSet.has(p.id)).length} 件を解除
                    </Button>
                    <Button 
                      key="save-selection"
                      onClick={saveSelection}
                      disabled={
                        mu.state === "submitting" || 
                        selectedProducts.length === 0 ||
                        selectedProducts.some(p => !productMetalTypes[p.id])
                      }
                      variant="primary"
                      size="large"
                    >
                      選択を保存
                    </Button>
                  </InlineStack>
                  
                  {/* 一括金属種別設定 */}
                  {selectedProducts.length > 0 && (
                    <Card>
                      <BlockStack gap="200">
                        <InlineStack gap="300" blockAlign="center">
                          <Text variant="bodyMd" as="span">
                            新規選択商品({selectedProducts.filter(p => !selectedProductIds.includes(p.id)).length}件)に一括設定:
                          </Text>
                          <Button 
                            onClick={() => handleBulkMetalTypeChange('gold')}
                            disabled={selectedProducts.filter(p => !selectedProductIds.includes(p.id)).length === 0}
                            tone="warning"
                          >
                            🥇 選択した全ての商品を金価格に設定
                          </Button>
                          <Button 
                            onClick={() => handleBulkMetalTypeChange('platinum')}
                            disabled={selectedProducts.filter(p => !selectedProductIds.includes(p.id)).length === 0}
                            tone="info"
                          >
                            🥈 選択した全ての商品をプラチナ価格に設定
                          </Button>
                        </InlineStack>
                        {selectedProducts.filter(p => selectedProductIds.includes(p.id)).length > 0 && (
                          <Text variant="bodySm" tone="subdued">
                            ※既に保存済みの{selectedProducts.filter(p => selectedProductIds.includes(p.id)).length}件は一括設定の対象外です
                          </Text>
                        )}
                      </BlockStack>
                    </Card>
                  )}
                </BlockStack>
                
                {/* 選択状態の表示 */}
                {selectedProducts.length > 0 && (
                  <Card>
                    <BlockStack gap="300">
                      <InlineStack align="space-between">
                        <h4>選択中の商品 ({selectedProducts.length}件)</h4>
                        <InlineStack gap="200">
                          <Badge tone="warning">
                            🥇 金: {selectedProducts.filter(p => productMetalTypes[p.id] === 'gold').length}件
                          </Badge>
                          <Badge tone="info">
                            🥈 プラチナ: {selectedProducts.filter(p => productMetalTypes[p.id] === 'platinum').length}件
                          </Badge>
                          <Badge tone="critical">
                            ⚠️ 未設定: {selectedProducts.filter(p => !productMetalTypes[p.id]).length}件
                          </Badge>
                        </InlineStack>
                      </InlineStack>
                      
                      <BlockStack gap="200">
                        {selectedProducts.map((product, index) => {
                          const metalType = productMetalTypes[product.id];
                          return (
                            <InlineStack key={`selected-${product.id}-${index}`} gap="200" blockAlign="center">
                              <span style={{ fontSize: '14px' }}>
                                {metalType === 'gold' ? '🥇' : metalType === 'platinum' ? '🥈' : '⚠️'}
                              </span>
                              <Text variant="bodySm">{product.title}</Text>
                              {metalType ? (
                                <Badge tone={metalType === 'gold' ? 'warning' : 'info'} size="small">
                                  {metalType === 'gold' ? '金価格' : 'プラチナ価格'}
                                </Badge>
                              ) : (
                                <Badge tone="critical" size="small">
                                  金属種別未選択
                                </Badge>
                              )}
                            </InlineStack>
                          );
                        })}
                      </BlockStack>
                      
                      {selectedProducts.filter(p => !productMetalTypes[p.id]).length > 0 && (
                        <Banner tone="warning">
                          <strong>金属種別未選択の商品があります。</strong> 
                          各商品の金属種別（金価格 または プラチナ価格）を選択してから保存してください。
                        </Banner>
                      )}
                    </BlockStack>
                  </Card>
                )}
                
                {selectedProductIds && selectedProductIds.length > 0 && (
                  <Banner tone="success">
                    現在 <strong>{selectedProductIds.length}件</strong> の商品が自動更新対象として保存されています
                  </Banner>
                )}
                
                {/* 保存結果メッセージ */}
                {mu.data?.message && (
                  <Banner tone="success">
                    {mu.data.message}
                  </Banner>
                )}
              </BlockStack>
          </Card>
        </Layout.Section>

        {/* 手動価格更新セクション */}
        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <InlineStack align="space-between">
                <h3>手動価格更新</h3>
                <Badge tone="info">金・プラチナ価格に関係なく手動で価格を調整</Badge>
              </InlineStack>
              
              {/* 成功メッセージ */}
              {successMessage && (
                <Banner tone="success" onDismiss={() => setSuccessMessage('')}>
                  {successMessage}
                </Banner>
              )}
              
              <InlineStack gap="400" wrap>
                {/* ±選択 */}
                <div style={{ minWidth: '120px' }}>
                  <Text variant="bodyMd" as="p">価格調整方向</Text>
                  <InlineStack gap="200" blockAlign="center">
                    <div key="plus-radio">
                      <input
                        type="radio"
                        id="plus"
                        name="direction"
                        value="plus"
                        checked={manualUpdateDirection === 'plus'}
                        onChange={() => setManualUpdateDirection('plus')}
                      />
                      <label htmlFor="plus">+ 値上げ</label>
                    </div>
                    
                    <div key="minus-radio">
                      <input
                        type="radio"
                        id="minus"
                        name="direction"
                        value="minus"
                        checked={manualUpdateDirection === 'minus'}
                        onChange={() => setManualUpdateDirection('minus')}
                      />
                      <label htmlFor="minus">- 値下げ</label>
                    </div>
                  </InlineStack>
                </div>
                
                {/* パーセンテージ入力 */}
                <div style={{ minWidth: '150px' }}>
                  <TextField
                    label="調整率"
                    value={manualUpdatePercentage.toString()}
                    onChange={(value) => {
                      const numValue = parseFloat(value);
                      if (!isNaN(numValue) && numValue >= 0 && numValue <= 10) {
                        setManualUpdatePercentage(numValue);
                      } else if (value === '' || value === '0') {
                        setManualUpdatePercentage(0);
                      }
                    }}
                    type="number"
                    suffix="%"
                    min={0}
                    max={10}
                    step={0.1}
                    helpText="0〜10%の範囲で入力"
                  />
                </div>
                
                <div>
                  <Text variant="bodyMd" as="p" tone="subdued">
                    調整例: {manualUpdateDirection === 'plus' ? '+' : '-'}{manualUpdatePercentage}% 
                    （¥10,000 → ¥{(10000 * (1 + (manualUpdateDirection === 'plus' ? manualUpdatePercentage : -manualUpdatePercentage) / 100)).toLocaleString()}）
                  </Text>
                </div>
              </InlineStack>
              
              <InlineStack gap="300">
                <Button 
                  onClick={() => handleManualSelectAll(true)}
                  disabled={filteredProducts.length === 0}
                >
                  すべて選択
                </Button>
                <Button 
                  onClick={() => handleManualSelectAll(false)}
                  disabled={manualSelectedProducts.length === 0}
                >
                  選択解除
                </Button>
                <Button 
                  onClick={() => {
                    console.log("🔘 Manual update button clicked", { isManualUpdating, selectedCount: manualSelectedProducts.length });
                    executeManualPriceUpdate();
                  }}
                  disabled={manualSelectedProducts.length === 0 || isManualUpdating}
                  variant="primary"
                  tone="critical"
                  loading={isManualUpdating}
                >
                  {isManualUpdating
                    ? "価格更新中..." 
                    : `選択商品の価格を手動更新 (${manualSelectedProducts.length}件)`
                  }
                </Button>
              </InlineStack>
              
              {manualSelectedProducts.length > 0 && (
                <Card>
                  <BlockStack gap="200">
                    <Text variant="bodyMd" as="p">選択中の商品 ({manualSelectedProducts.length}件)</Text>
                    <div style={{ maxHeight: '150px', overflowY: 'auto' }}>
                      <BlockStack gap="100">
                        {manualSelectedProducts.map((productId, index) => {
                          const product = products.find(p => p.id === productId);
                          return product ? (
                            <InlineStack key={`manual-${productId}-${index}`} gap="200" blockAlign="center">
                              <Checkbox
                                checked={true}
                                onChange={(checked) => handleManualProductSelect(productId, checked)}
                              />
                              <div style={{ flex: 1 }}>
                                <Text variant="bodySm">{product.title}</Text>
                                <Text variant="caption" tone="subdued">{productId}</Text>
                              </div>
                            </InlineStack>
                          ) : null;
                        })}
                      </BlockStack>
                    </div>
                  </BlockStack>
                </Card>
              )}
            </BlockStack>
          </Card>
        </Layout.Section>

        <Layout.Section>
          <Card>
            {selectionType === "collections" && (collections?.length ?? 0) === 0 && (
              <Banner tone="info">コレクションが見つかりません。</Banner>
            )}
            <div style={{
              width: '100%',
              overflowX: 'auto',
              overflowAnchor: 'none'
            }}>
              <div style={{ minWidth: 2140 }}>
                <IndexTable
                  resourceName={{ 
                    singular: selectionType === 'products' ? '商品' : 'コレクション', 
                    plural: selectionType === 'products' ? '商品' : 'コレクション' 
                  }}
                  itemCount={selectionType === 'products' ? filteredProducts.length : (collections?.length || 0)}
                  selectedItemsCount={selectedProducts.length}
                  onSelectionChange={(selectionType) => {
                    if (selectionType === 'all') {
                      handleSelectAll(true);
                    } else if (selectionType === 'none') {
                      handleSelectAll(false);
                    }
                  }}
                  sortable={selectionType === 'products' ? [false, false, true, true, false, false, true, true, true, false] : [false, false, false, false, false]}
                  sortDirection={sortDirection}
                  sortColumnIndex={sortColumn ? {
                    'name': 2,
                    'status': 3,
                    'inventory': 6,
                    'productType': 7,
                    'createdAt': 8
                  }[sortColumn] : undefined}
                  onSort={(headingIndex, direction) => {
                    const columnMap = ['', '', 'name', 'status', '', '', 'inventory', 'productType', 'createdAt', ''];
                    const column = columnMap[headingIndex];
                    if (column) {
                      setSortColumn(column);
                      setSortDirection(direction);
                    }
                  }}
                  headings={selectionType === 'products' ? [
                    { title: '自動更新' },
                    { title: '手動更新' },
                    { title: '商品名' },
                    { title: 'ステータス' },
                    { title: '価格' },
                    { title: 'バリエーション' },
                    { title: '在庫数' },
                    { title: '商品タイプ' },
                    { title: '作成日' },
                    { title: '連動設定' }
                  ] : [
                    { title: '自動更新' },
                    { title: 'コレクション名' },
                    { title: '商品数' },
                    { title: 'ハンドル' },
                    { title: '連動設定' }
                  ]}
                  selectable={false}
                >
                  {selectionType === 'products' ? (
                    filteredProducts.map((product, index) => {
                    const isSelected = selectedProducts.some(p => p.id === product.id);
                    const variants = product.variants.edges;
                    // variantごとに表示価格を決定（オーバーレイ → 楽観的更新 → 基本価格）
                    const now = Date.now();
                    const variantDisplayPrices = variants.map(({ node }) => {
                      const vid = node.id;
                      const overlay = priceOverlay[vid];
                      
                      if (overlay && overlay.until > now) {
                        return { price: overlay.price, status: ' (確定)' };
                      }
                      
                      if (optimisticPrices[vid] != null) {
                        return { 
                          price: optimisticPrices[vid], 
                          status: ` (更新中${refreshCountdown > 0 ? ` - ${refreshCountdown}秒後に確認` : ''})`
                        };
                      }
                      
                      // 基本価格（Admin GraphQLの読み値、整数円で統一）
                      return { price: Math.round(Number(node.price ?? 0)), status: '' };
                    });
                    
                    // 価格レンジの計算
                    const prices = variantDisplayPrices.map(v => v.price);
                    const hasSpecialStatus = variantDisplayPrices.some(v => v.status !== '');
                    const commonStatus = hasSpecialStatus ? variantDisplayPrices.find(v => v.status !== '')?.status || '' : '';
                    
                    const priceRange = variantDisplayPrices.length > 1
                      ? `¥${Math.min(...prices).toLocaleString()} - ¥${Math.max(...prices).toLocaleString()}${commonStatus}`
                      : `¥${(prices[0] ?? 0).toLocaleString()}${commonStatus}`;
                    
                    // デバッグログ
                    if (hasSpecialStatus) {
                      console.log(`🎯 Special price display for ${product.title}:`, {
                        productId: product.id,
                        variantDisplayPrices,
                        finalDisplay: priceRange
                      });
                    }
                    const metalType = productMetalTypes[product.id];
                    const isSaved = savedIdSet.has(product.id);
                    const displayType = productMetalTypes[product.id] ?? savedTypeMap[product.id] ?? "none";

                    return (
                      <IndexTable.Row
                        id={product.id}
                        key={`product-${product.id}-${index}`}
                      >
                        <IndexTable.Cell>
                          <Box minWidth="60px" maxWidth="60px">
                            <Checkbox
                              checked={isSelected}
                              onChange={(checked) => handleSelectProduct(product.id, checked)}
                            />
                          </Box>
                        </IndexTable.Cell>
                        
                        {/* 手動更新選択 */}
                        <IndexTable.Cell>
                          <Box minWidth="80px" maxWidth="80px">
                            <Checkbox
                              checked={manualSelectedProducts.includes(product.id)}
                              onChange={(checked) => handleManualProductSelect(product.id, checked)}
                            />
                          </Box>
                        </IndexTable.Cell>
                        
                        <IndexTable.Cell>
                          <Box minWidth="480px" maxWidth="720px">
                            <InlineStack gap="200" blockAlign="center">
                              {isSelected && metalType && (
                                <span style={{ fontSize: '16px' }}>
                                  {metalType === 'gold' ? '🥇' : '🥈'}
                                </span>
                              )}
                              <Tooltip content={product.title} dismissOnMouseOut>
                                <Text
                                  as="span"
                                  variant="bodySm"
                                  style={{
                                    display: "-webkit-box",
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: "vertical",
                                    overflow: "hidden",
                                    whiteSpace: "normal",
                                    wordBreak: "break-word",
                                  }}
                                >
                                  {product.title}
                                </Text>
                              </Tooltip>
                              {isSelected && metalType && (
                                <Badge tone={metalType === 'gold' ? 'warning' : 'info'} size="small">
                                  {metalType === 'gold' ? '金' : 'Pt'}
                                </Badge>
                              )}
                              {isSelected && !metalType && !isSaved && (
                                <Badge tone="critical" size="small">
                                  未設定
                                </Badge>
                              )}
                              {isSaved && (
                                <Badge tone="success" size="small">
                                  保存済
                                </Badge>
                              )}
                            </InlineStack>
                          </Box>
                        </IndexTable.Cell>
                        
                        <IndexTable.Cell>
                          <Box minWidth="100px" maxWidth="120px">
                            <Badge status={product.status === "ACTIVE" ? "success" : "critical"}>
                              {product.status}
                            </Badge>
                          </Box>
                        </IndexTable.Cell>
                        
                        <IndexTable.Cell>
                          <Box minWidth="140px" maxWidth="200px">
                            <Text variant="bodySm">{priceRange}</Text>
                          </Box>
                        </IndexTable.Cell>
                        
                        <IndexTable.Cell>
                          <Box minWidth="100px" maxWidth="140px">
                            <Text variant="bodySm">{variants.length}</Text>
                          </Box>
                        </IndexTable.Cell>
                        
                        {/* 在庫数 */}
                        <IndexTable.Cell>
                          <Box minWidth="120px" maxWidth="140px">
                            <InlineStack gap="100" blockAlign="center">
                              <Text variant="bodySm" fontWeight="medium">
                                {product.totalInventory || 0}
                              </Text>
                              {product.totalInventory > 0 ? (
                                <Badge status="success" size="small">在庫有</Badge>
                              ) : (
                                <Badge status="critical" size="small">在庫無</Badge>
                              )}
                            </InlineStack>
                          </Box>
                        </IndexTable.Cell>
                        
                        {/* 商品タイプ */}
                        <IndexTable.Cell>
                          <Box minWidth="140px" maxWidth="180px">
                            {product.productType ? (
                              <Badge tone="info" size="small">
                                {product.productType}
                              </Badge>
                            ) : (
                              <Text variant="bodySm" tone="subdued">未分類</Text>
                            )}
                          </Box>
                        </IndexTable.Cell>
                        
                        {/* 作成日 */}
                        <IndexTable.Cell>
                          <Box minWidth="140px" maxWidth="160px">
                            <Text variant="bodySm" tone="subdued">
                              {product.createdAt ? new Date(product.createdAt).toLocaleDateString('ja-JP', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              }) : '-'}
                            </Text>
                          </Box>
                        </IndexTable.Cell>
                        
                        <IndexTable.Cell>
                          <Box minWidth="360px" maxWidth="420px">
                            {(isSelected || isSaved) ? (
                              <div>
                                <Select
                                  label="金属種別"
                                  labelHidden
                                  options={[
                                    { label: "金属種別を選択...", value: "none", disabled: true },
                                    { label: "🥇 金価格", value: "gold" },
                                    { label: "🥈 プラチナ価格", value: "platinum" }
                                  ]}
                                  value={displayType}
                                  onChange={(value) => handleMetalTypeChange(product.id, value)}
                                  placeholder="選択してください"
                                  disabled={isSaved && !isSelected}
                                />
                                {displayType === "none" && isSelected && !isSaved && (
                                  <div style={{ marginTop: '4px' }}>
                                    <Text variant="bodySm" tone="critical">
                                      ※選択が必要です
                                    </Text>
                                  </div>
                                )}
                                {isSaved && (
                                  <div style={{ marginTop: '4px' }}>
                                    <InlineStack gap="100" blockAlign="center">
                                      <Text variant="bodySm" tone="subdued">
                                        保存済み設定{isSelected ? "（編集可）" : ""}
                                      </Text>
                                      <UnselectButton
                                        productId={product.id}
                                        onOptimistic={(id) => {
                                          // 既存の楽観更新ロジックをそのまま使う
                                          setSelectedProducts(prev => prev.filter(p => p.id !== id));
                                          setProductMetalTypes(prev => {
                                            const next = { ...prev };
                                            delete next[id];
                                            return next;
                                          });
                                          removeSaved([id]);
                                        }}
                                        scheduleRevalidate={scheduleRevalidate}
                                      />
                                    </InlineStack>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <Text variant="bodySm" tone="subdued">-</Text>
                            )}
                          </Box>
                        </IndexTable.Cell>
                      </IndexTable.Row>
                    );
                  })
                  ) : (
                    // コレクション表示モード
                    collections?.map((collection, index) => {
                      const isChecked = selectedCollections.includes(collection.id);
                      const cType = collectionMetalTypes[collection.id] || "none";

                      return (
                        <IndexTable.Row
                          id={collection.id}
                          key={`collection-${collection.id}-${index}`}
                        >
                          {/* 選択 */}
                          <IndexTable.Cell>
                            <Box minWidth="60px" maxWidth="60px">
                              <Checkbox
                                checked={isChecked}
                                onChange={(checked) => handleSelectCollection(collection.id, checked)}
                              />
                            </Box>
                          </IndexTable.Cell>

                          {/* コレクション名 */}
                          <IndexTable.Cell>
                            <Box minWidth="320px" maxWidth="480px">
                              <InlineStack gap="200" blockAlign="center">
                                <span style={{ fontSize: '16px' }}>📦</span>
                                <Tooltip content={collection.title} dismissOnMouseOut>
                                  <Text
                                    variant="bodyMd"
                                    fontWeight="medium"
                                    style={{
                                      display: "-webkit-box",
                                      WebkitLineClamp: 2,
                                      WebkitBoxOrient: "vertical",
                                      overflow: "hidden",
                                      whiteSpace: "normal",
                                      wordBreak: "break-word",
                                    }}
                                  >
                                    {collection.title}
                                  </Text>
                                </Tooltip>
                                {isChecked && cType && cType !== "none" && (
                                  <Badge tone={cType === 'gold' ? 'warning' : 'info'} size="small">
                                    {cType === 'gold' ? '金' : 'Pt'}
                                  </Badge>
                                )}
                              </InlineStack>
                            </Box>
                          </IndexTable.Cell>
                          
                          {/* 商品数 */}
                          <IndexTable.Cell>
                            <Box minWidth="120px" maxWidth="160px">
                              <Badge tone="info">
                                {collection.productsCount ?? "-"}件の商品
                              </Badge>
                            </Box>
                          </IndexTable.Cell>
                          
                          {/* ハンドル */}
                          <IndexTable.Cell>
                            <Box minWidth="150px" maxWidth="200px">
                              <Text variant="bodySm" tone="subdued">
                                {collection.handle}
                              </Text>
                            </Box>
                          </IndexTable.Cell>

                          {/* 連動設定（金/プラチナ） */}
                          <IndexTable.Cell>
                            <Box minWidth="280px" maxWidth="340px">
                              {isChecked ? (
                                <Select
                                  label="金属種別"
                                  labelHidden
                                  options={[
                                    { label: "金属種別を選択...", value: "none", disabled: true },
                                    { label: "🥇 金価格", value: "gold" },
                                    { label: "🥈 プラチナ価格", value: "platinum" },
                                  ]}
                                  value={cType}
                                  onChange={(v) => handleCollectionMetalTypeChange(collection.id, v)}
                                  placeholder="選択してください"
                                />
                              ) : (
                                <Text variant="bodySm" tone="subdued">-</Text>
                              )}
                            </Box>
                          </IndexTable.Cell>
                        </IndexTable.Row>
                      );
                    }) || []
                  )}
                </IndexTable>
                
                {/* スクロール表示制御ボタン */}
                {selectionType === 'products' && filteredProducts.length > displayLimit && (
                  <div style={{ padding: '16px', textAlign: 'center', borderTop: '1px solid #e1e3e5' }}>
                    {!showAllProducts ? (
                      <Button onClick={() => setShowAllProducts(true)} size="large">
                        さらに {filteredProducts.length - displayLimit} 件の商品を表示
                      </Button>
                    ) : (
                      <Button onClick={() => {
                        setShowAllProducts(false);
                        // ページトップにスクロール
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }} variant="secondary">
                        最初の {displayLimit} 件のみ表示に戻る
                      </Button>
                    )}
                    <div style={{ marginTop: '8px' }}>
                      <Text variant="bodySm" tone="subdued">
                        {showAllProducts 
                          ? `全 ${filteredProducts.length} 件を表示中` 
                          : `${Math.min(displayLimit, filteredProducts.length)} / ${filteredProducts.length} 件を表示`
                        }
                      </Text>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </Layout.Section>

        {/* 価格プレビューモーダル */}
        <Modal
          open={showPreview}
          onClose={() => setShowPreview(false)}
          title="価格調整プレビュー"
          primaryAction={{
            content: "価格を更新",
            onAction: executePriceUpdate,
            loading: updater.state === "submitting"
          }}
          secondaryActions={[
            {
              content: "キャンセル",
              onAction: () => setShowPreview(false)
            }
          ]}
          large
        >
          <Modal.Section>
            <BlockStack gap="400">
              {pricePreview.map((product, index) => (
                <Card key={`preview-${product.id}-${index}`}>
                  <BlockStack gap="300">
                    <InlineStack align="space-between">
                      <h4>{product.title}</h4>
                      <Badge tone={product.metalType === 'gold' ? 'warning' : 'info'}>
                        {product.metalType === 'gold' ? '金価格' : 'プラチナ価格'}
                      </Badge>
                    </InlineStack>
                    {product.error ? (
                      <Banner tone="critical">
                        {product.error}
                      </Banner>
                    ) : (
                      product.variants.map((variant, vIndex) => (
                        <InlineStack key={`variant-${variant.id}-${vIndex}`} align="space-between">
                          <span>{variant.title || "デフォルト"}</span>
                          <InlineStack gap="200">
                            <span>¥{variant.currentPrice} → ¥{variant.newPrice}</span>
                            {variant.changed && (
                              <Badge tone={variant.priceChange > 0 ? "warning" : "success"}>
                                {variant.priceChange > 0 ? '+' : ''}{variant.priceChange}円
                              </Badge>
                            )}
                          </InlineStack>
                        </InlineStack>
                      ))
                    )}
                  </BlockStack>
                </Card>
              ))}
            </BlockStack>
          </Modal.Section>
        </Modal>

        {/* 更新結果表示 */}
        {updater.data?.updateResults && (
          <Layout.Section>
            <Card>
              <BlockStack gap="400">
                <h3>価格更新結果</h3>
                
                {/* サマリー情報 */}
                {updater.data.summary && (
                  <Card>
                    <InlineStack gap="400">
                      <div>合計: <strong>{updater.data.summary.total}</strong>件</div>
                      <div>成功: <strong>{updater.data.summary.success}</strong>件</div>
                      <div>失敗: <strong>{updater.data.summary.failed}</strong>件</div>
                    </InlineStack>
                  </Card>
                )}

                {/* エラーメッセージ */}
                {updater.data.error && (
                  <Banner tone="critical">
                    {updater.data.error}
                  </Banner>
                )}

                {/* メッセージ */}
                {updater.data.message && (
                  <Banner tone="info">
                    {updater.data.message}
                  </Banner>
                )}

                {/* 詳細結果 */}
                {updater.data.updateResults.map((result, index) => (
                  <Banner
                    key={`result-${index}-${result.variantId || result.productId}`}
                    tone={result.success ? "success" : "critical"}
                  >
                    {result.success 
                      ? `${result.productTitle} ${result.variantTitle ? `(${result.variantTitle})` : ''}: ¥${result.oldPrice?.toLocaleString()} → ¥${result.newPrice?.toLocaleString()} ${result.adjustmentRatio ? `(${result.adjustmentRatio > 0 ? '+' : ''}${(result.adjustmentRatio * 100).toFixed(1)}%)` : ''}`
                      : `Product ${result.productId} / Variant ${result.variantId}: ${result.error}`
                    }
                  </Banner>
                ))}
              </BlockStack>
            </Card>
          </Layout.Section>
        )}
      </Layout>
    </Page>
  );
}

export default function Products() {
  const data = useLoaderData();
  const { goldPrice, platinumPrice, selectedProductIds, savedSelectedProducts, selectedCollectionIds, savedSelectedCollections, shopSetting, forceRefresh, cacheTimestamp } = data;

  return (
    <Suspense
      fallback={
        <Page 
          fullWidth
          title="商品価格自動調整" 
          subtitle="読み込み中..."
          secondaryActions={[
            {
              content: "商品を再読み込み",
              icon: RefreshIcon,
              onAction: () => {
                ClientCache.clear(CACHE_KEYS.PRODUCTS);
                // ページ全体をリロードせずにRevalidator使用
                window.location.search = '?refresh=true';
              }
            }
          ]}
        >
          <Layout>
            <Layout.Section>
              {goldPrice && (
                <Card>
                  <BlockStack gap="400">
                    <InlineStack align="space-between">
                      <h3>田中貴金属 金価格情報</h3>
                      <Badge tone={goldPrice.changeDirection === 'up' ? 'attention' : goldPrice.changeDirection === 'down' ? 'success' : 'info'}>
                        {goldPrice.changeDirection === 'up' ? '上昇' : goldPrice.changeDirection === 'down' ? '下落' : '変動なし'}
                      </Badge>
                    </InlineStack>
                    
                  <InlineStack gap="600">
                    <div>
                      <p>店頭小売価格（税込）</p>
                      <h4>{goldPrice.retailPriceFormatted}</h4>
                    </div>
                    <div>
                      <p>小売価格前日比</p>
                      <h4>{goldPrice.change}</h4>
                    </div>
                    <div>
                      <p>店頭買取価格（税込）</p>
                      <h4>{goldPrice.buyPriceFormatted || '取得失敗'}</h4>
                    </div>
                    <div>
                      <p>買取価格前日比</p>
                      <h4>{goldPrice.buyChangePercent || '0.00%'}</h4>
                    </div>
                  </InlineStack>
                  
                    
                    <p suppressHydrationWarning>最終更新: {new Date(goldPrice.lastUpdated).toLocaleString('ja-JP')}</p>
                  </BlockStack>
                </Card>
              )}
            </Layout.Section>
            
            <Layout.Section>
              <Card>
                <BlockStack gap="400">
                  <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                    <Spinner size="large" />
                    <p style={{ marginTop: '20px' }}>
                      商品データを読み込んでいます...
                    </p>
                    <Text variant="bodySm" tone="subdued">
                      初回読み込みには時間がかかります。次回からキャッシュにより高速表示されます。
                    </Text>
                  </div>
                </BlockStack>
              </Card>
            </Layout.Section>
          </Layout>
        </Page>
      }
    >
      <Await resolve={Promise.allSettled([data.products, data.collections])}>
        {([p, c]) => {
          const products = p.status === 'fulfilled' ? p.value : [];
          const collections = c.status === 'fulfilled' ? c.value : [];
          return (
            <ProductsContent
              products={products}
              collections={collections}
              goldPrice={goldPrice}
              platinumPrice={platinumPrice}
              selectedProductIds={selectedProductIds}
              savedSelectedProducts={savedSelectedProducts}
              selectedCollectionIds={selectedCollectionIds}
              savedSelectedCollections={savedSelectedCollections}
              shopSetting={shopSetting}
              forceRefresh={forceRefresh}
              cacheTimestamp={cacheTimestamp}
            />
          );
        }}
      </Await>
    </Suspense>
  );
}
