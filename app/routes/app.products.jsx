import { useState, useCallback, useEffect, useRef, Suspense } from "react";
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
} from "@shopify/polaris";
import {
  ProductIcon,
  CheckCircleIcon,
  RefreshIcon,
} from "@shopify/polaris-icons";
import { ClientCache, CACHE_KEYS } from "../utils/cache";
import { authenticate } from "../shopify.server";
import { runBulkUpdateBySpec } from "../models/price.server";
import { fetchGoldPriceDataTanaka, fetchPlatinumPriceDataTanaka } from "../models/gold.server";
import prisma from "../db.server";

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
  
  // 10円単位で切り上げ
  return Math.ceil(finalPrice / 10) * 10;
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
        changeDirection: goldData.changeDirection,
        lastUpdated: goldData.lastUpdated
      } : null,
      platinum: platinumData && platinumData.changeRatio !== null ? {
        ratio: platinumData.changeRatio,
        percentage: (platinumData.changeRatio * 100).toFixed(2),
        change: platinumData.changePercent,
        retailPrice: platinumData.retailPrice,
        retailPriceFormatted: platinumData.retailPriceFormatted,
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
  const [metalPrices, selectedProducts, shopSetting] = await Promise.all([
    fetchMetalPrices(),
    prisma.selectedProduct.findMany({
      where: { 
        shopDomain: session.shop,
        selected: true 
      },
      select: { productId: true, metalType: true }
    }),
    prisma.shopSetting.findUnique({
      where: { shopDomain: session.shop }
    })
  ]);

  const selectedProductIds = selectedProducts.map(p => p.productId);

  // 重い商品取得処理は非同期化
  const productsPromise = fetchAllProducts(admin);

  return defer({
    products: productsPromise, // Promise を渡す
    goldPrice: metalPrices.gold,
    platinumPrice: metalPrices.platinum,
    selectedProductIds: selectedProductIds,
    savedSelectedProducts: selectedProducts,
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

  if (action === "updatePrices") {
    const selectedProducts = JSON.parse(formData.get("selectedProducts"));
    const minPriceRate = parseFloat(formData.get("minPriceRate"));

    try {
      // 新しい仕様に沿った一括更新を実行
      const result = await runBulkUpdateBySpec(admin, session.shop);
      
      if (!result.ok) {
        return json({ 
          error: result.reason,
          disabled: result.disabled,
          updateResults: []
        });
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

  return json({ error: "不正なアクション" });
};

function ProductsContent({ products, goldPrice, platinumPrice, selectedProductIds, savedSelectedProducts, shopSetting, forceRefresh, cacheTimestamp }) {
  const fetcher = useFetcher();
  const revalidator = useRevalidator();
  const didRevalidate = useRef(false);
  
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [productMetalTypes, setProductMetalTypes] = useState({}); // 商品IDと金属種別のマッピング
  const [searchValue, setSearchValue] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [minPriceRate, setMinPriceRate] = useState(shopSetting?.minPricePct || 93);
  const [showPreview, setShowPreview] = useState(false);
  const [pricePreview, setPricePreview] = useState([]);
  const [isUsingCache, setIsUsingCache] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  
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
    if (fetcher.state === "idle" && fetcher.data && !fetcher.data.error) {
      // 個別保存または一括保存が成功した場合、保存した商品を選択から除外
      if (fetcher.data.savedProducts) {
        const savedProductIds = fetcher.data.savedProducts.map(p => p.productId);
        setSelectedProducts(prev => prev.filter(p => !savedProductIds.includes(p.id)));
        // 保存した商品の金属種別設定もクリア（既に保存されているため）
        setProductMetalTypes(prev => {
          const newTypes = { ...prev };
          savedProductIds.forEach(id => delete newTypes[id]);
          return newTypes;
        });
        // サーバーの selectedProductIds を最新化（一度だけ実行）
        if (!didRevalidate.current) {
          didRevalidate.current = true;
          revalidator.revalidate();
          // 次回の保存アクションまでフラグを解除
          setTimeout(() => { didRevalidate.current = false; }, 500);
        }
      }
    }
  }, [fetcher.state, fetcher.data?.savedProducts?.length, revalidator]);

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
    
    // 金属種別設定時に即座にサーバーに保存
    const formData = new FormData();
    formData.append("action", "saveSingleProduct");
    formData.append("productId", productId);
    formData.append("metalType", metalType);
    
    fetcher.submit(formData, { method: "post" });
  }, [fetcher]);

  // 一括金属種別設定ハンドラー（新規選択商品のみ対象）
  const handleBulkMetalTypeChange = useCallback((metalType) => {
    const targetProducts = selectedProducts.filter(product => !selectedProductIds.includes(product.id));
    
    if (targetProducts.length === 0) return;
    
    const newMetalTypes = {};
    targetProducts.forEach(product => {
      newMetalTypes[product.id] = metalType;
    });
    setProductMetalTypes(prev => ({ ...prev, ...newMetalTypes }));
    
    // 一括設定時も即座にDBに保存
    const formData = new FormData();
    formData.append("action", "saveSelection");
    
    targetProducts.forEach(product => {
      formData.append("productId", product.id);
      formData.append("metalType", metalType);
    });
    
    fetcher.submit(formData, { method: "post" });
  }, [selectedProducts, selectedProductIds, fetcher]);

  // 選択状態を保存
  const saveSelection = useCallback(() => {
    // 金属種別が未選択の商品をチェック
    const unsetProducts = selectedProducts.filter(product => !productMetalTypes[product.id]);
    
    if (unsetProducts.length > 0) {
      alert(`以下の商品の金属種別を選択してください：\n${unsetProducts.map(p => p.title).join('\n')}`);
      return;
    }
    
    const formData = new FormData();
    formData.append("action", "saveSelection");
    selectedProducts.forEach(product => {
      formData.append("productId", product.id);
      formData.append("metalType", productMetalTypes[product.id]);
    });
    
    fetcher.submit(formData, { method: "post" });
  }, [selectedProducts, productMetalTypes, fetcher]);

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
    
    const updateData = selectedProducts.map(product => ({
      ...product,
      variants: product.variants.edges.map(edge => edge.node)
    }));

    fetcher.submit(
      {
        action: "updatePrices",
        selectedProducts: JSON.stringify(updateData),
        minPriceRate: minPriceRate.toString()
      },
      { method: "post" }
    );

    setShowPreview(false);
  }, [selectedProducts, goldPrice, platinumPrice, productMetalTypes, minPriceRate, fetcher]);


  return (
    <Page
      fullWidth
      title="商品価格自動調整"
      subtitle={`${filteredProducts.length}件の商品（全${products.length}件）`}
      primaryAction={{
        content: "価格調整プレビュー",
        onAction: generatePricePreview,
        disabled: selectedProducts.length === 0 || 
          (selectedProducts.some(p => (productMetalTypes[p.id] || 'gold') === 'gold') && !goldPrice) ||
          (selectedProducts.some(p => productMetalTypes[p.id] === 'platinum') && !platinumPrice),
        loading: fetcher.state === "submitting"
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
                      
                      <InlineStack gap="600">
                        <div>
                          <p style={{color: 'white', margin: 0}}>店頭小売価格（税込）</p>
                          <h4 style={{color: 'white', margin: '4px 0'}}>{goldPrice.retailPriceFormatted}</h4>
                        </div>
                        <div>
                          <p style={{color: 'white', margin: 0}}>前日比</p>
                          <h4 style={{color: 'white', margin: '4px 0'}}>{goldPrice.change}</h4>
                        </div>
                        <div>
                          <p style={{color: 'white', margin: 0}}>価格調整率</p>
                          <h4 style={{color: 'white', margin: '4px 0'}}>{goldPrice.percentage}%</h4>
                        </div>
                      </InlineStack>
                      
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
                      
                      <InlineStack gap="600">
                        <div>
                          <p style={{color: 'white', margin: 0}}>店頭小売価格（税込）</p>
                          <h4 style={{color: 'white', margin: '4px 0'}}>{platinumPrice.retailPriceFormatted}</h4>
                        </div>
                        <div>
                          <p style={{color: 'white', margin: 0}}>前日比</p>
                          <h4 style={{color: 'white', margin: '4px 0'}}>{platinumPrice.change}</h4>
                        </div>
                        <div>
                          <p style={{color: 'white', margin: 0}}>価格調整率</p>
                          <h4 style={{color: 'white', margin: '4px 0'}}>{platinumPrice.percentage}%</h4>
                        </div>
                      </InlineStack>
                      
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
                      onClick={saveSelection}
                      disabled={
                        fetcher.state === "submitting" || 
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
                            🥇 すべて金価格に設定
                          </Button>
                          <Button 
                            onClick={() => handleBulkMetalTypeChange('platinum')}
                            disabled={selectedProducts.filter(p => !selectedProductIds.includes(p.id)).length === 0}
                            tone="info"
                          >
                            🥈 すべてプラチナ価格に設定
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
                {fetcher.data?.message && (
                  <Banner tone="success">
                    {fetcher.data.message}
                  </Banner>
                )}
              </BlockStack>
          </Card>
        </Layout.Section>

        <Layout.Section>
          <Card>
            <div style={{ 
              width: '100%', 
              overflowAnchor: 'none',
              overscrollBehaviorY: 'contain'
            }}>
              <IndexTable
                  resourceName={{ singular: '商品', plural: '商品' }}
                  itemCount={filteredProducts.length}
                  selectedItemsCount={selectedProducts.length}
                  onSelectionChange={(selectionType) => {
                    if (selectionType === 'all') {
                      handleSelectAll(true);
                    } else if (selectionType === 'none') {
                      handleSelectAll(false);
                    }
                  }}
                  headings={[
                    { title: '選択' },
                    { title: '商品名' },
                    { title: 'ステータス' },
                    { title: '価格' },
                    { title: 'バリエーション' },
                    { title: '価格連動設定' }
                  ]}
                  selectable={false}
                >
                  {filteredProducts.map((product, index) => {
                    const isSelected = selectedProducts.some(p => p.id === product.id);
                    const variants = product.variants.edges;
                    const priceRange = variants.length > 1 
                      ? `¥${Math.min(...variants.map(v => parseFloat(v.node.price)))} - ¥${Math.max(...variants.map(v => parseFloat(v.node.price)))}`
                      : `¥${variants[0]?.node.price || 0}`;
                    const metalType = productMetalTypes[product.id];
                    const isSaved = selectedProductIds.includes(product.id);

                    return (
                      <IndexTable.Row
                        id={product.id}
                        key={product.id}
                      >
                        <IndexTable.Cell>
                          <Checkbox
                            checked={isSelected}
                            onChange={(checked) => handleSelectProduct(product.id, checked)}
                          />
                        </IndexTable.Cell>
                        
                        <IndexTable.Cell>
                          <Box minWidth="200px">
                            <InlineStack gap="200" blockAlign="center">
                              {isSelected && metalType && (
                                <span style={{ fontSize: '16px' }}>
                                  {metalType === 'gold' ? '🥇' : '🥈'}
                                </span>
                              )}
                              <Text as="span" truncate>
                                {product.title}
                              </Text>
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
                          <Badge status={product.status === "ACTIVE" ? "success" : "critical"}>
                            {product.status}
                          </Badge>
                        </IndexTable.Cell>
                        
                        <IndexTable.Cell>
                          <Text variant="bodySm">{priceRange}</Text>
                        </IndexTable.Cell>
                        
                        <IndexTable.Cell>
                          <Text variant="bodySm">{variants.length}</Text>
                        </IndexTable.Cell>
                        
                        <IndexTable.Cell>
                          <Box minWidth="280px">
                            {isSelected ? (
                              <div>
                                <Select
                                  label="金属種別"
                                  labelHidden
                                  options={[
                                    { label: "金属種別を選択...", value: "", disabled: true },
                                    { label: "🥇 金価格", value: "gold" },
                                    { label: "🥈 プラチナ価格", value: "platinum" }
                                  ]}
                                  value={metalType || ""}
                                  onChange={(value) => handleMetalTypeChange(product.id, value)}
                                  placeholder="選択してください"
                                  disabled={isSaved}
                                />
                                {!metalType && !isSaved && (
                                  <div style={{ marginTop: '4px' }}>
                                    <Text variant="bodySm" tone="critical">
                                      ※選択が必要です
                                    </Text>
                                  </div>
                                )}
                                {isSaved && (
                                  <div style={{ marginTop: '4px' }}>
                                    <Text variant="bodySm" tone="subdued">
                                      保存済み設定
                                    </Text>
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
                  })}
                </IndexTable>
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
            loading: fetcher.state === "submitting"
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
        {fetcher.data?.updateResults && (
          <Layout.Section>
            <Card>
              <BlockStack gap="400">
                <h3>価格更新結果</h3>
                
                {/* サマリー情報 */}
                {fetcher.data.summary && (
                  <Card>
                    <InlineStack gap="400">
                      <div>合計: <strong>{fetcher.data.summary.total}</strong>件</div>
                      <div>成功: <strong>{fetcher.data.summary.success}</strong>件</div>
                      <div>失敗: <strong>{fetcher.data.summary.failed}</strong>件</div>
                    </InlineStack>
                  </Card>
                )}

                {/* エラーメッセージ */}
                {fetcher.data.error && (
                  <Banner tone="critical">
                    {fetcher.data.error}
                  </Banner>
                )}

                {/* メッセージ */}
                {fetcher.data.message && (
                  <Banner tone="info">
                    {fetcher.data.message}
                  </Banner>
                )}

                {/* 詳細結果 */}
                {fetcher.data.updateResults.map((result, index) => (
                  <Banner
                    key={index}
                    tone={result.success ? "success" : "critical"}
                  >
                    {result.success 
                      ? `${result.product} - ${result.variant}: ¥${result.oldPrice?.toLocaleString()} → ¥${result.newPrice?.toLocaleString()}`
                      : `${result.product} - ${result.variant}: ${result.error}`
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
  const { goldPrice, platinumPrice, selectedProductIds, savedSelectedProducts, shopSetting, forceRefresh, cacheTimestamp } = data;

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
                        <p>前日比</p>
                        <h4>{goldPrice.change}</h4>
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
      <Await resolve={data.products}>
        {(products) => (
          <ProductsContent
            products={products}
            goldPrice={goldPrice}
            platinumPrice={platinumPrice}
            selectedProductIds={selectedProductIds}
            savedSelectedProducts={savedSelectedProducts}
            shopSetting={shopSetting}
            forceRefresh={forceRefresh}
            cacheTimestamp={cacheTimestamp}
          />
        )}
      </Await>
    </Suspense>
  );
}