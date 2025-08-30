import { useState, useCallback, useEffect, useRef, useMemo, Suspense } from "react";
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
  let allProducts = [];
  let cursor = null;
  let hasNextPage = true;

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
                variants(first: 250) {
                  edges {
                    node {
                      id
                      title
                      price
                      sku
                      inventoryQuantity
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
    const products = responseJson.data.products.edges.map(edge => edge.node);
    allProducts = [...allProducts, ...products];
    
    hasNextPage = responseJson.data.products.pageInfo.hasNextPage;
    cursor = responseJson.data.products.edges.length > 0 
      ? responseJson.data.products.edges[responseJson.data.products.edges.length - 1].cursor 
      : null;
  }
  
  return allProducts;
}

// 金・プラチナ価格情報を取得（詳細データ版）- Server-side only
async function fetchMetalPrices() {
  try {
    const [goldData, platinumData] = await Promise.all([
      fetchGoldPriceDataTanaka(),
      fetchPlatinumPriceDataTanaka()
    ]);
    
    return {
      gold: goldData && goldData.changeRatio !== null ? {
        ratio: goldData.changeRatio,
        percentage: (goldData.changeRatio * 100).toFixed(2),
        change: goldData.changePercent,
        retailPrice: goldData.retailPrice,
        retailPriceFormatted: goldData.retailPriceFormatted,
        buyPrice: goldData.buyPrice,
        buyPriceFormatted: goldData.buyPriceFormatted,
        buyChangePercent: goldData.buyChangePercent,
        changeDirection: goldData.changeDirection,
        lastUpdated: goldData.lastUpdated
      } : null,
      platinum: platinumData && platinumData.changeRatio !== null ? {
        ratio: platinumData.changeRatio,
        percentage: (platinumData.changeRatio * 100).toFixed(2),
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
    // キャッシュからの復元試行
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

  // 手動リロード（Shopify認証安全版）
  const handleRefresh = useCallback(() => {
    ClientCache.clear(CACHE_KEYS.PRODUCTS);
    setIsUsingCache(false);
    
    // Remix revalidator使用でセッション保持
    revalidator.revalidate();
  }, [revalidator]);

  // 商品フィルタリング
  const filteredProducts = filterProducts(products, searchValue, filterType);

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
          const currentPrice = parseFloat(variant.price);
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
                  <div style={{padding: '16px', background: '#fbbf24', borderRadius: '8px'}}>
                    <BlockStack gap="300">
                      <InlineStack align="space-between">
                        <InlineStack gap="200" blockAlign="center">
                          <span style={{ fontSize: '20px' }}>🥇</span>
                          <h3 style={{color: 'white'}}>田中貴金属 金価格情報</h3>
                        </InlineStack>
                        <Badge tone={goldPrice.changeDirection === 'up' ? 'critical' : goldPrice.changeDirection === 'down' ? 'success' : 'info'}>
                          {goldPrice.changeDirection === 'up' ? '上昇' : goldPrice.changeDirection === 'down' ? '下落' : '変動なし'}
                        </Badge>
                      </InlineStack>
                      
                      <InlineStack gap="400" wrap>
                        <div>
                          <p style={{color: 'white', margin: 0, fontSize: '12px'}}>店頭小売価格（税込）</p>
                          <h4 style={{color: 'white', margin: '4px 0'}}>{goldPrice.retailPriceFormatted}</h4>
                        </div>
                        <div>
                          <p style={{color: 'white', margin: 0, fontSize: '12px'}}>小売価格前日比</p>
                          <h4 style={{color: 'white', margin: '4px 0'}}>{goldPrice.change}</h4>
                        </div>
                        <div>
                          <p style={{color: 'white', margin: 0, fontSize: '12px'}}>店頭買取価格（税込）</p>
                          <h4 style={{color: 'white', margin: '4px 0'}}>{goldPrice.buyPriceFormatted || '取得失敗'}</h4>
                        </div>
                        <div>
                          <p style={{color: 'white', margin: 0, fontSize: '12px'}}>買取価格前日比</p>
                          <h4 style={{color: 'white', margin: '4px 0'}}>{goldPrice.buyChangePercent || '0.00%'}</h4>
                        </div>
                        <div>
                          <p style={{color: 'white', margin: 0, fontSize: '12px'}}>価格調整率</p>
                          <h4 style={{color: 'white', margin: '4px 0'}}>{goldPrice.percentage}%</h4>
                        </div>
                      </InlineStack>
                      
                      <div style={{marginTop: '12px'}}>
                        <p style={{color: 'white', margin: 0, fontSize: '11px'}}>
                          出典: <a href="https://gold.tanaka.co.jp/commodity/souba/" target="_blank" rel="noopener noreferrer" style={{color: 'white', textDecoration: 'underline'}}>田中貴金属工業株式会社</a>
                        </p>
                      </div>
                      
                      <p style={{color: 'white', margin: 0, fontSize: '12px'}}>最終更新: {new Date(goldPrice.lastUpdated).toLocaleString('ja-JP')}</p>
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
                  <div style={{padding: '16px', background: '#94a3b8', borderRadius: '8px'}}>
                    <BlockStack gap="300">
                      <InlineStack align="space-between">
                        <InlineStack gap="200" blockAlign="center">
                          <span style={{ fontSize: '20px' }}>🥈</span>
                          <h3 style={{color: 'white'}}>田中貴金属 プラチナ価格情報</h3>
                        </InlineStack>
                        <Badge tone={platinumPrice.changeDirection === 'up' ? 'critical' : platinumPrice.changeDirection === 'down' ? 'success' : 'info'}>
                          {platinumPrice.changeDirection === 'up' ? '上昇' : platinumPrice.changeDirection === 'down' ? '下落' : '変動なし'}
                        </Badge>
                      </InlineStack>
                      
                      <InlineStack gap="400" wrap>
                        <div>
                          <p style={{color: 'white', margin: 0, fontSize: '12px'}}>店頭小売価格（税込）</p>
                          <h4 style={{color: 'white', margin: '4px 0'}}>{platinumPrice.retailPriceFormatted}</h4>
                        </div>
                        <div>
                          <p style={{color: 'white', margin: 0, fontSize: '12px'}}>小売価格前日比</p>
                          <h4 style={{color: 'white', margin: '4px 0'}}>{platinumPrice.change}</h4>
                        </div>
                        <div>
                          <p style={{color: 'white', margin: 0, fontSize: '12px'}}>店頭買取価格（税込）</p>
                          <h4 style={{color: 'white', margin: '4px 0'}}>{platinumPrice.buyPriceFormatted || '取得失敗'}</h4>
                        </div>
                        <div>
                          <p style={{color: 'white', margin: 0, fontSize: '12px'}}>買取価格前日比</p>
                          <h4 style={{color: 'white', margin: '4px 0'}}>{platinumPrice.buyChangePercent || '0.00%'}</h4>
                        </div>
                        <div>
                          <p style={{color: 'white', margin: 0, fontSize: '12px'}}>価格調整率</p>
                          <h4 style={{color: 'white', margin: '4px 0'}}>{platinumPrice.percentage}%</h4>
                        </div>
                      </InlineStack>
                      
                      <div style={{marginTop: '12px'}}>
                        <p style={{color: 'white', margin: 0, fontSize: '11px'}}>
                          出典: <a href="https://gold.tanaka.co.jp/commodity/souba/d-platinum.php" target="_blank" rel="noopener noreferrer" style={{color: 'white', textDecoration: 'underline'}}>田中貴金属工業株式会社</a>
                        </p>
                      </div>
                      
                      <p style={{color: 'white', margin: 0, fontSize: '12px'}}>最終更新: {new Date(platinumPrice.lastUpdated).toLocaleString('ja-JP')}</p>
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
                <Text variant="bodySm" tone="subdued">
                  最終更新: {lastUpdated ? lastUpdated.toLocaleString('ja-JP') : '読み込み中...'} 
                  {isUsingCache && (
                    <Badge tone="info" size="small">キャッシュ</Badge>
                  )}
                </Text>
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
                          {label: "K18商品のみ", value: "k18"}
                        ]}
                        value={filterType}
                        onChange={setFilterType}
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
                      onClick={() => handleSelectAll(true)}
                      disabled={filteredProducts.length === 0}
                      size="large"
                    >
                      すべて選択
                    </Button>
                    <Button 
                      onClick={() => handleSelectAll(false)}
                      disabled={selectedProducts.length === 0}
                      size="large"
                    >
                      選択解除
                    </Button>
                    <Button 
                      onClick={handleBulkUnselect}
                      tone="critical"
                      disabled={selectedProducts.filter(p => savedIdSet.has(p.id)).length === 0 || mu.state === "submitting"}
                      size="large"
                    >
                      選択中の保存済み {selectedProducts.filter(p => savedIdSet.has(p.id)).length} 件を解除
                    </Button>
                    <Button 
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
                        {selectedProducts.map(product => {
                          const metalType = productMetalTypes[product.id];
                          return (
                            <InlineStack key={product.id} gap="200" blockAlign="center">
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
              <div style={{ minWidth: 1680 }}>
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
                  headings={selectionType === 'products' ? [
                    { title: '選択' },
                    { title: '商品名' },
                    { title: 'ステータス' },
                    { title: '価格' },
                    { title: 'バリエーション' },
                    { title: '連動設定' }
                  ] : [
                    { title: '選択' },
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
                    const priceRange = variants.length > 1 
                      ? `¥${Math.min(...variants.map(v => parseFloat(v.node.price)))} - ¥${Math.max(...variants.map(v => parseFloat(v.node.price)))}`
                      : `¥${variants[0]?.node.price || 0}`;
                    const metalType = productMetalTypes[product.id];
                    const isSaved = savedIdSet.has(product.id);
                    const displayType = productMetalTypes[product.id] ?? savedTypeMap[product.id] ?? "";

                    return (
                      <IndexTable.Row
                        id={product.id}
                        key={product.id}
                      >
                        <IndexTable.Cell>
                          <Box minWidth="60px" maxWidth="60px">
                            <Checkbox
                              checked={isSelected}
                              onChange={(checked) => handleSelectProduct(product.id, checked)}
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
                        
                        <IndexTable.Cell>
                          <Box minWidth="360px" maxWidth="420px">
                            {(isSelected || isSaved) ? (
                              <div>
                                <Select
                                  label="金属種別"
                                  labelHidden
                                  options={[
                                    { label: "金属種別を選択...", value: "", disabled: true },
                                    { label: "🥇 金価格", value: "gold" },
                                    { label: "🥈 プラチナ価格", value: "platinum" }
                                  ]}
                                  value={displayType}
                                  onChange={(value) => handleMetalTypeChange(product.id, value)}
                                  placeholder="選択してください"
                                  disabled={isSaved && !isSelected}
                                />
                                {!displayType && isSelected && !isSaved && (
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
                    collections?.map((collection) => {
                      const isChecked = selectedCollections.includes(collection.id);
                      const cType = collectionMetalTypes[collection.id] || "";

                      return (
                        <IndexTable.Row
                          id={collection.id}
                          key={collection.id}
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
                                {isChecked && cType && (
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
                                    { label: "金属種別を選択...", value: "", disabled: true },
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
              {pricePreview.map(product => (
                <Card key={product.id}>
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
                      product.variants.map(variant => (
                        <InlineStack key={variant.id} align="space-between">
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
                    key={index}
                    tone={result.success ? "success" : "critical"}
                  >
                    {result.success 
                      ? `Variant ${result.variantId}: ¥${result.oldPrice?.toLocaleString()} → ¥${result.newPrice?.toLocaleString()}`
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
                  
                  <div>
                    <p><strong>価格調整率: {goldPrice.percentage}%</strong>（この変動率で商品価格を自動調整します）</p>
                  </div>
                    
                    <p>最終更新: {new Date(goldPrice.lastUpdated).toLocaleString('ja-JP')}</p>
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
