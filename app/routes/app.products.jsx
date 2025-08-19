import { useState, useCallback, useEffect, Suspense } from "react";
import { json, defer } from "@remix-run/node";
import { useLoaderData, useFetcher, Await, useRevalidator } from "@remix-run/react";
import {
  Page,
  Layout,
  Card,
  DataTable,
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
    const ids = formData.getAll("productId").map(String);
    const metalTypes = formData.getAll("metalType"); // 金属種別配列
    const uniqueIds = Array.from(new Set(ids)); // フロント由来の重複を除去
    
    // 既存の選択をクリア
    await prisma.selectedProduct.deleteMany({
      where: { shopDomain: session.shop }
    });
    
    // 新しい選択を保存（重複は既に除去済み）
    if (uniqueIds.length > 0) {
      await prisma.selectedProduct.createMany({
        data: uniqueIds.map((productId, index) => ({
          shopDomain: session.shop,
          productId: productId,
          selected: true,
          metalType: metalTypes[index] === 'platinum' ? 'platinum' : 'gold' // デフォルトは金
        }))
      });
    }
    
    return json({ success: true, message: `${uniqueIds.length}件の商品を選択しました` });
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
      // デフォルトで金を選択
      if (!productMetalTypes[productId]) {
        setProductMetalTypes(prev => ({ ...prev, [productId]: 'gold' }));
      }
    } else {
      setSelectedProducts(prev => prev.filter(p => p.id !== productId));
      // 選択解除時は金属種別も削除
      setProductMetalTypes(prev => {
        const newTypes = { ...prev };
        delete newTypes[productId];
        return newTypes;
      });
    }
  }, [products, productMetalTypes]);

  // 全選択/全解除
  const handleSelectAll = useCallback((isSelected) => {
    if (isSelected) {
      setSelectedProducts(filteredProducts);
      // 全選択時は全商品をデフォルトの金に設定
      const newMetalTypes = {};
      filteredProducts.forEach(product => {
        newMetalTypes[product.id] = productMetalTypes[product.id] || 'gold';
      });
      setProductMetalTypes(prev => ({ ...prev, ...newMetalTypes }));
    } else {
      setSelectedProducts([]);
      // 全解除時は金属種別もクリア
      setProductMetalTypes({});
    }
  }, [filteredProducts, productMetalTypes]);

  // 金属種別変更ハンドラー
  const handleMetalTypeChange = useCallback((productId, metalType) => {
    setProductMetalTypes(prev => ({ ...prev, [productId]: metalType }));
  }, []);

  // 選択状態を保存
  const saveSelection = useCallback(() => {
    const formData = new FormData();
    formData.append("action", "saveSelection");
    selectedProducts.forEach(product => {
      formData.append("productId", product.id);
      formData.append("metalType", productMetalTypes[product.id] || 'gold');
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

  // データテーブル用の行データ
  const tableRows = filteredProducts.map(product => {
    const isSelected = selectedProducts.some(p => p.id === product.id);
    const variants = product.variants.edges;
    const priceRange = variants.length > 1 
      ? `¥${Math.min(...variants.map(v => parseFloat(v.node.price)))} - ¥${Math.max(...variants.map(v => parseFloat(v.node.price)))}`
      : `¥${variants[0]?.node.price || 0}`;

    return [
      <Checkbox
        checked={isSelected}
        onChange={(checked) => handleSelectProduct(product.id, checked)}
      />,
      product.title,
      <Badge status={product.status === "ACTIVE" ? "success" : "critical"}>
        {product.status}
      </Badge>,
      priceRange,
      variants.length,
      isSelected ? (
        <Select
          options={[
            { label: "金価格", value: "gold" },
            { label: "プラチナ価格", value: "platinum" }
          ]}
          value={productMetalTypes[product.id] || 'gold'}
          onChange={(value) => handleMetalTypeChange(product.id, value)}
        />
      ) : (
        <Text variant="bodySm" tone="subdued">未選択</Text>
      )
    ];
  });

  return (
    <Page
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

          {!goldPrice && (
            <Banner tone="critical">
              金価格情報の取得に失敗しました。価格調整機能をご利用いただけません。
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
                    disabled={fetcher.state === "submitting"}
                    variant="primary"
                    size="large"
                  >
                    選択を保存
                  </Button>
                </InlineStack>
                
                {/* 選択状態の表示 */}
                {selectedProductIds && selectedProductIds.length > 0 && (
                  <Banner tone="info">
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
            <DataTable
              columnContentTypes={["text", "text", "text", "text", "numeric", "text"]}
              headings={["選択", "商品名", "ステータス", "価格", "バリエーション", "金属種別"]}
              rows={tableRows}
              pagination={{
                hasNext: false,
                hasPrevious: false,
              }}
            />
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