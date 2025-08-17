import { useState, useCallback, useEffect, Suspense } from "react";
import { json, defer } from "@remix-run/node";
import { useLoaderData, useFetcher, Await } from "@remix-run/react";
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
} from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import { runBulkUpdateBySpec } from "../models/price.server";
import { fetchGoldPriceDataTanaka, fetchGoldChangeRatioTanaka } from "../models/gold.server";
import prisma from "../db.server";

// 金価格情報を取得（詳細データ版）
async function fetchGoldPrice() {
  try {
    const goldData = await fetchGoldPriceDataTanaka();
    if (!goldData || goldData.changeRatio === null) return null;
    
    return {
      ratio: goldData.changeRatio,
      percentage: (goldData.changeRatio * 100).toFixed(2),
      change: goldData.changePercent,
      retailPrice: goldData.retailPrice,
      retailPriceFormatted: goldData.retailPriceFormatted,
      changeDirection: goldData.changeDirection,
      lastUpdated: goldData.lastUpdated
    };
  } catch (error) {
    console.error("金価格取得エラー:", error);
    return null;
  }
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

export const loader = async ({ request }) => {
  const { admin, session } = await authenticate.admin(request);

  // 軽い処理は即座に実行
  const [goldPrice, selectedProducts, shopSetting] = await Promise.all([
    fetchGoldPrice(),
    prisma.selectedProduct.findMany({
      where: { 
        shopDomain: session.shop,
        selected: true 
      },
      select: { productId: true }
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
    goldPrice: goldPrice,
    selectedProductIds: selectedProductIds,
    shopSetting: shopSetting
  });
};

export const action = async ({ request }) => {
  const { admin, session } = await authenticate.admin(request);
  const formData = await request.formData();
  const action = formData.get("action");

  if (action === "saveSelection") {
    const ids = formData.getAll("productId").map(String);
    const uniqueIds = Array.from(new Set(ids)); // フロント由来の重複を除去
    
    // 既存の選択をクリア
    await prisma.selectedProduct.deleteMany({
      where: { shopDomain: session.shop }
    });
    
    // 新しい選択を保存（重複は既に除去済み）
    if (uniqueIds.length > 0) {
      await prisma.selectedProduct.createMany({
        data: uniqueIds.map(productId => ({
          shopDomain: session.shop,
          productId: productId,
          selected: true
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

function ProductsContent({ products, goldPrice, selectedProductIds, shopSetting }) {
  const fetcher = useFetcher();
  
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [minPriceRate, setMinPriceRate] = useState(shopSetting?.minPricePct || 93);
  const [showPreview, setShowPreview] = useState(false);
  const [pricePreview, setPricePreview] = useState([]);
  
  // 永続化された選択状態を初期化
  useEffect(() => {
    if (selectedProductIds && selectedProductIds.length > 0) {
      const persistedSelected = products.filter(p => selectedProductIds.includes(p.id));
      setSelectedProducts(persistedSelected);
    }
  }, [products, selectedProductIds]);

  // 商品フィルタリング
  const filteredProducts = filterProducts(products, searchValue, filterType);

  // 商品選択ハンドラ
  const handleSelectProduct = useCallback((productId, isSelected) => {
    const product = products.find(p => p.id === productId);
    if (isSelected) {
      setSelectedProducts(prev => [...prev, product]);
    } else {
      setSelectedProducts(prev => prev.filter(p => p.id !== productId));
    }
  }, [products]);

  // 全選択/全解除
  const handleSelectAll = useCallback((isSelected) => {
    if (isSelected) {
      setSelectedProducts(filteredProducts);
    } else {
      setSelectedProducts([]);
    }
  }, [filteredProducts]);

  // 選択状態を保存
  const saveSelection = useCallback(() => {
    const formData = new FormData();
    formData.append("action", "saveSelection");
    selectedProducts.forEach(product => {
      formData.append("productId", product.id);
    });
    
    fetcher.submit(formData, { method: "post" });
  }, [selectedProducts, fetcher]);

  // 価格プレビュー生成
  const generatePricePreview = useCallback(() => {
    if (selectedProducts.length === 0 || !goldPrice) return;

    const preview = selectedProducts.map(product => ({
      ...product,
      variants: product.variants.edges.map(edge => {
        const variant = edge.node;
        const currentPrice = parseFloat(variant.price);
        const newPrice = calculateNewPrice(currentPrice, goldPrice.ratio, minPriceRate / 100);
        
        return {
          ...variant,
          currentPrice,
          newPrice,
          priceChange: newPrice - currentPrice,
          changed: newPrice !== currentPrice
        };
      })
    }));

    setPricePreview(preview);
    setShowPreview(true);
  }, [selectedProducts, goldPrice, minPriceRate]);

  // 価格更新実行
  const executePriceUpdate = useCallback(() => {
    if (!goldPrice) return;
    
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
  }, [selectedProducts, goldPrice, minPriceRate, fetcher]);

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
      variants.length
    ];
  });

  return (
    <Page
      title="商品価格自動調整"
      subtitle={`${filteredProducts.length}件の商品（全${products.length}件）`}
      primaryAction={{
        content: "価格調整プレビュー",
        onAction: generatePricePreview,
        disabled: selectedProducts.length === 0 || !goldPrice,
        loading: fetcher.state === "submitting"
      }}
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
                    <p style={{color: '#6B7280', fontSize: '14px'}}>店頭小売価格（税込）</p>
                    <p style={{fontSize: '18px', fontWeight: 'bold'}}>{goldPrice.retailPriceFormatted}</p>
                  </div>
                  <div>
                    <p style={{color: '#6B7280', fontSize: '14px'}}>前日比</p>
                    <p style={{fontSize: '18px', fontWeight: 'bold', color: goldPrice.changeDirection === 'up' ? '#DC2626' : goldPrice.changeDirection === 'down' ? '#059669' : '#6B7280'}}>
                      {goldPrice.change}
                    </p>
                  </div>
                </InlineStack>
                
                <div style={{padding: '12px', backgroundColor: '#F3F4F6', borderRadius: '8px'}}>
                  <p style={{margin: 0}}>
                    <strong>価格調整率: {goldPrice.percentage}%</strong>
                    （この変動率で商品価格を自動調整します）
                  </p>
                </div>
                
                <p style={{color: '#6B7280', fontSize: '12px', margin: 0}}>
                  最終更新: {new Date(goldPrice.lastUpdated).toLocaleString('ja-JP')}
                </p>
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

              <ButtonGroup>
                <Button 
                  onClick={() => handleSelectAll(true)}
                  disabled={filteredProducts.length === 0}
                >
                  すべて選択
                </Button>
                <Button 
                  onClick={() => handleSelectAll(false)}
                  disabled={selectedProducts.length === 0}
                >
                  選択解除
                </Button>
                <Button 
                  onClick={saveSelection}
                  disabled={fetcher.state === "submitting"}
                  variant="primary"
                >
                  選択を保存
                </Button>
              </ButtonGroup>
              
              {/* 選択状態の表示 */}
              {selectedProductIds && selectedProductIds.length > 0 && (
                <Banner tone="info">
                  現在 {selectedProductIds.length} 件の商品が自動更新対象として保存されています
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
              columnContentTypes={["text", "text", "text", "text", "numeric"]}
              headings={["選択", "商品名", "ステータス", "価格", "バリエーション"]}
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
                    <h4>{product.title}</h4>
                    {product.variants.map(variant => (
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
                    ))}
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
                  <Card background="bg-surface-secondary">
                    <InlineStack gap="400">
                      <div>合計: <strong>{fetcher.data.summary.total}</strong>件</div>
                      <div>成功: <strong style={{color: 'green'}}>{fetcher.data.summary.success}</strong>件</div>
                      <div>失敗: <strong style={{color: 'red'}}>{fetcher.data.summary.failed}</strong>件</div>
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
  const { goldPrice, selectedProductIds, shopSetting } = data;

  return (
    <Suspense
      fallback={
        <Page title="商品価格自動調整" subtitle="読み込み中...">
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
                        <p style={{color: '#6B7280', fontSize: '14px'}}>店頭小売価格（税込）</p>
                        <p style={{fontSize: '18px', fontWeight: 'bold'}}>{goldPrice.retailPriceFormatted}</p>
                      </div>
                      <div>
                        <p style={{color: '#6B7280', fontSize: '14px'}}>前日比</p>
                        <p style={{fontSize: '18px', fontWeight: 'bold', color: goldPrice.changeDirection === 'up' ? '#DC2626' : goldPrice.changeDirection === 'down' ? '#059669' : '#6B7280'}}>
                          {goldPrice.change}
                        </p>
                      </div>
                    </InlineStack>
                    
                    <div style={{padding: '12px', backgroundColor: '#F3F4F6', borderRadius: '8px'}}>
                      <p style={{margin: 0}}>
                        <strong>価格調整率: {goldPrice.percentage}%</strong>
                        （この変動率で商品価格を自動調整します）
                      </p>
                    </div>
                    
                    <p style={{color: '#6B7280', fontSize: '12px', margin: 0}}>
                      最終更新: {new Date(goldPrice.lastUpdated).toLocaleString('ja-JP')}
                    </p>
                  </BlockStack>
                </Card>
              )}
            </Layout.Section>
            
            <Layout.Section>
              <Card>
                <BlockStack gap="400">
                  <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                    <Spinner size="large" />
                    <p style={{ marginTop: '20px', color: '#6B7280' }}>
                      商品データを読み込んでいます...
                    </p>
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
            selectedProductIds={selectedProductIds}
            shopSetting={shopSetting}
          />
        )}
      </Await>
    </Suspense>
  );
}