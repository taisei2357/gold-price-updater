import { json } from "@remix-run/node";
import { useLoaderData, Link as RemixLink } from "@remix-run/react";
import {
  Page,
  Layout,
  Text,
  Card,
  Button,
  BlockStack,
  Box,
  InlineStack,
  Badge,
  Icon,
  Banner,
  Divider,
} from "@shopify/polaris";
import {
  ClockIcon,
  ProductIcon,
  SettingsIcon,
  NotificationIcon,
} from "@shopify/polaris-icons";
import { authenticate } from "../shopify.server";
import { fetchGoldPriceDataTanaka, fetchPlatinumPriceDataTanaka } from "../models/gold.server";
import prisma from "../db.server";
import { AppErrorHandler, handleAppError } from "../utils/error-handler";

export const loader = async ({ request }) => {
  // デバッグ: 現在の環境変数とホストを確認
  console.log('🔍 DEBUG INFO:', {
    host: request.headers.get('x-forwarded-host') || request.headers.get('host'),
    SHOPIFY_APP_URL: process.env.SHOPIFY_APP_URL,
    NODE_ENV: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  });

  const { session } = await authenticate.admin(request);

  try {
    // 金・プラチナ価格情報を取得
    const [goldData, platinumData] = await Promise.all([
      fetchGoldPriceDataTanaka(),
      fetchPlatinumPriceDataTanaka()
    ]);
    
    // ダッシュボード統計を取得
    const [selectedProducts, recentLogs, shopSetting] = await Promise.all([
      prisma.selectedProduct.count({
        where: { shopDomain: session.shop, selected: true }
      }),
      prisma.priceUpdateLog.findMany({
        where: { shopDomain: session.shop },
        orderBy: { executedAt: 'desc' },
        take: 5
      }),
      prisma.shopSetting.findUnique({
        where: { shopDomain: session.shop }
      })
    ]);

    return json({
      goldPrice: goldData ? {
        ratio: (typeof goldData.changeRatio === 'number' && Number.isFinite(goldData.changeRatio)) ? goldData.changeRatio : null,
        percentage: (typeof goldData.changeRatio === 'number' && Number.isFinite(goldData.changeRatio)) ? (goldData.changeRatio * 100).toFixed(2) : '0.00',
        change: goldData.changePercent,
        retailPrice: goldData.retailPrice,
        retailPriceFormatted: goldData.retailPriceFormatted,
        buyPrice: goldData.buyPrice,
        buyPriceFormatted: goldData.buyPriceFormatted,
        buyChangePercent: goldData.buyChangePercent,
        changeDirection: goldData.changeDirection,
        lastUpdated: goldData.lastUpdated
      } : null,
      platinumPrice: platinumData ? {
        ratio: (typeof platinumData.changeRatio === 'number' && Number.isFinite(platinumData.changeRatio)) ? platinumData.changeRatio : null,
        percentage: (typeof platinumData.changeRatio === 'number' && Number.isFinite(platinumData.changeRatio)) ? (platinumData.changeRatio * 100).toFixed(2) : '0.00',
        change: platinumData.changePercent,
        retailPrice: platinumData.retailPrice,
        retailPriceFormatted: platinumData.retailPriceFormatted,
        buyPrice: platinumData.buyPrice,
        buyPriceFormatted: platinumData.buyPriceFormatted,
        buyChangePercent: platinumData.buyChangePercent,
        changeDirection: platinumData.changeDirection,
        lastUpdated: platinumData.lastUpdated
      } : null,
      stats: {
        selectedProducts,
        totalLogs: recentLogs.length,
        lastExecution: recentLogs[0]?.executedAt || null,
        autoScheduleEnabled: shopSetting?.autoScheduleEnabled || false
      },
      recentLogs
    });
  } catch (error) {
    AppErrorHandler.logError(error, { 
      route: 'app._index',
      shop: session?.shop
    });
    
    // フォールバックデータを返す
    return json({
      goldPrice: null,
      platinumPrice: null,
      stats: { selectedProducts: 0, totalLogs: 0, lastExecution: null, autoScheduleEnabled: false },
      recentLogs: [],
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      fallback: true
    });
  }
};

export default function Dashboard() {
  const { goldPrice, platinumPrice, stats, recentLogs } = useLoaderData();

  return (
    <Page
      title="金・プラチナ価格自動調整ダッシュボード"
      subtitle="商品の価格を田中貴金属の金・プラチナ価格に連動して自動調整"
    >
      <BlockStack gap="600">
        {/* Hero Section - 金・プラチナ価格情報 */}
        <Layout>
          <Layout.Section>
            {/* 金価格 */}
            <Card>
              <div style={{
                padding: '24px', 
                background: 'white', 
                border: '2px solid #f59e0b',
                borderRadius: '8px'
              }}>
                <InlineStack align="space-between" blockAlign="center">
                  <BlockStack gap="300">
                    <InlineStack gap="300" blockAlign="center">
                      <div style={{
                        width: '40px',
                        height: '40px',
                        background: '#f59e0b',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '18px',
                        fontWeight: '700',
                        color: 'white'
                      }}>
                        AU
                      </div>
                      <BlockStack gap="100">
                        <Text variant="headingLg" as="h2">
                          金価格
                        </Text>
                        <Text variant="bodySm" tone="subdued">
                          田中貴金属工業
                        </Text>
                      </BlockStack>
                    </InlineStack>
                    
                    {goldPrice ? (
                      <>
                        <Text variant="heading2xl" as="p" style={{
                          fontWeight: '700',
                          color: '#000'
                        }}>
                          {goldPrice.retailPriceFormatted}
                        </Text>
                        <InlineStack gap="200" blockAlign="center">
                          <Badge 
                            tone={goldPrice.changeDirection === 'up' ? 'critical' : goldPrice.changeDirection === 'down' ? 'success' : 'info'}
                            size="large"
                          >
                            {goldPrice.changeDirection === 'up' ? '↗️' : goldPrice.changeDirection === 'down' ? '↘️' : '➡️'} {goldPrice.change}
                          </Badge>
                          <Badge tone="warning" size="large">
                            調整率 {goldPrice.percentage}%
                          </Badge>
                        </InlineStack>
                      </>
                    ) : (
                      <div style={{
                        background: '#f3f4f6',
                        padding: '16px',
                        borderRadius: '8px',
                        border: '1px solid #e5e7eb'
                      }}>
                        <Text variant="bodyLg">
                          📡 価格情報を取得中...
                        </Text>
                      </div>
                    )}
                  </BlockStack>
                  
                  <BlockStack gap="200" align="end">
                    <div style={{
                      background: '#f9fafb',
                      padding: '12px',
                      borderRadius: '8px',
                      textAlign: 'center',
                      minWidth: '120px',
                      border: '1px solid #e5e7eb'
                    }}>
                      <Text variant="bodySm" tone="subdued">
                        最終更新
                      </Text>
                      <Text variant="bodyMd" style={{fontWeight: '500', marginTop: '4px'}}>
                        {goldPrice ? new Date(goldPrice.lastUpdated).toLocaleTimeString('ja-JP', {
                          hour: '2-digit',
                          minute: '2-digit'
                        }) : '--:--'}
                      </Text>
                    </div>
                  </BlockStack>
                </InlineStack>
              </div>
            </Card>
          </Layout.Section>
          
          <Layout.Section>
            {/* プラチナ価格 */}
            <Card>
              <div style={{
                padding: '24px', 
                background: 'white', 
                border: '2px solid #64748b',
                borderRadius: '8px'
              }}>
                <InlineStack align="space-between" blockAlign="center">
                  <BlockStack gap="300">
                    <InlineStack gap="300" blockAlign="center">
                      <div style={{
                        width: '40px',
                        height: '40px',
                        background: '#64748b',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '16px',
                        fontWeight: '700',
                        color: 'white'
                      }}>
                        Pt
                      </div>
                      <BlockStack gap="100">
                        <Text variant="headingLg" as="h2">
                          プラチナ価格
                        </Text>
                        <Text variant="bodySm" tone="subdued">
                          田中貴金属工業
                        </Text>
                      </BlockStack>
                    </InlineStack>
                    
                    {platinumPrice ? (
                      <>
                        <Text variant="heading2xl" as="p" style={{
                          fontWeight: '700',
                          color: '#000'
                        }}>
                          {platinumPrice.retailPriceFormatted}
                        </Text>
                        <InlineStack gap="200" blockAlign="center">
                          <Badge 
                            tone={platinumPrice.changeDirection === 'up' ? 'critical' : platinumPrice.changeDirection === 'down' ? 'success' : 'info'}
                            size="large"
                          >
                            {platinumPrice.changeDirection === 'up' ? '↗️' : platinumPrice.changeDirection === 'down' ? '↘️' : '➡️'} {platinumPrice.change}
                          </Badge>
                          <Badge tone="info" size="large">
                            調整率 {platinumPrice.percentage}%
                          </Badge>
                        </InlineStack>
                      </>
                    ) : (
                      <div style={{
                        background: '#f3f4f6',
                        padding: '16px',
                        borderRadius: '8px',
                        border: '1px solid #e5e7eb'
                      }}>
                        <Text variant="bodyLg">
                          📡 価格情報を取得中...
                        </Text>
                      </div>
                    )}
                  </BlockStack>
                  
                  <BlockStack gap="200" align="end">
                    <div style={{
                      background: '#f9fafb',
                      padding: '12px',
                      borderRadius: '8px',
                      textAlign: 'center',
                      minWidth: '120px',
                      border: '1px solid #e5e7eb'
                    }}>
                      <Text variant="bodySm" tone="subdued">
                        最終更新
                      </Text>
                      <Text variant="bodyMd" style={{fontWeight: '500', marginTop: '4px'}}>
                        {platinumPrice ? new Date(platinumPrice.lastUpdated).toLocaleTimeString('ja-JP', {
                          hour: '2-digit',
                          minute: '2-digit'
                        }) : '--:--'}
                      </Text>
                    </div>
                  </BlockStack>
                </InlineStack>
              </div>
            </Card>
          </Layout.Section>
        </Layout>

        {/* 統計カード */}
        <Layout>
          <Layout.Section>
            <InlineStack gap="400">
              <Card>
                <Box padding="400">
                  <BlockStack gap="300" align="center">
                    <Icon source={ProductIcon} tone="info" />
                    <Text variant="heading2xl" as="p">{stats.selectedProducts}</Text>
                    <Text variant="bodyMd" tone="subdued">選択中の商品</Text>
                  </BlockStack>
                </Box>
              </Card>

              <Card>
                <Box padding="400">
                  <BlockStack gap="300" align="center">
                    <Icon source={ClockIcon} tone={stats.autoScheduleEnabled ? 'success' : 'warning'} />
                    <Badge tone={stats.autoScheduleEnabled ? 'success' : 'warning'}>
                      {stats.autoScheduleEnabled ? '有効' : '無効'}
                    </Badge>
                    <Text variant="bodyMd" tone="subdued">自動スケジュール</Text>
                  </BlockStack>
                </Box>
              </Card>

              <Card>
                <Box padding="400">
                  <BlockStack gap="300" align="center">
                    <Icon source={NotificationIcon} tone="base" />
                    <Text variant="heading2xl" as="p">{stats.totalLogs}</Text>
                    <Text variant="bodyMd" tone="subdued">最近の実行</Text>
                  </BlockStack>
                </Box>
              </Card>
            </InlineStack>
          </Layout.Section>
        </Layout>

        {/* アクション & 最新ログ */}
        <Layout>
          <Layout.Section>
            <Card>
              <BlockStack gap="500">
                <InlineStack align="space-between" blockAlign="center">
                  <Text variant="headingMd" as="h3">クイックアクション</Text>
                  <InlineStack gap="200">
                    <RemixLink to="/app/settings">
                      <Button icon={SettingsIcon}>設定</Button>
                    </RemixLink>
                  </InlineStack>
                </InlineStack>
                
                <InlineStack gap="300">
                  <RemixLink to="/app/products">
                    <Button variant="primary" size="large">
                      商品価格を調整
                    </Button>
                  </RemixLink>
                  <RemixLink to="/app/logs">
                    <Button>実行ログを確認</Button>
                  </RemixLink>
                </InlineStack>

                {stats.lastExecution && (
                  <>
                    <Divider />
                    <BlockStack gap="200">
                      <Text variant="bodyMd" tone="subdued">
                        最終実行: {new Date(stats.lastExecution).toLocaleString('ja-JP')}
                      </Text>
                    </BlockStack>
                  </>
                )}
              </BlockStack>
            </Card>
          </Layout.Section>

          <Layout.Section variant="oneThird">
            <Card>
              <BlockStack gap="400">
                <Text variant="headingMd" as="h3">最近の実行ログ</Text>
                
                {recentLogs.length === 0 ? (
                  <Box padding="600">
                    <BlockStack gap="200" align="center">
                      <Icon source={ClockIcon} tone="subdued" />
                      <Text variant="bodyMd" tone="subdued">
                        まだ実行履歴がありません
                      </Text>
                    </BlockStack>
                  </Box>
                ) : (
                  <BlockStack gap="300">
                    {recentLogs.slice(0, 3).map((log, index) => (
                      <Box
                        key={log.id}
                        padding="400"
                      >
                        <BlockStack gap="200">
                          <InlineStack align="space-between" blockAlign="center">
                            <Badge tone={log.success ? 'success' : 'critical'}>
                              {log.success ? '成功' : '失敗'}
                            </Badge>
                            <Text variant="bodySm" tone="subdued">
                              {new Date(log.executedAt).toLocaleDateString('ja-JP')}
                            </Text>
                          </InlineStack>
                          
                          <InlineStack gap="400">
                            <Text variant="bodySm">
                              商品: {log.totalProducts || 0}件
                            </Text>
                            <Text variant="bodySm">
                              成功: {log.updatedCount || 0}件
                            </Text>
                          </InlineStack>
                        </BlockStack>
                      </Box>
                    ))}
                    
                    {recentLogs.length > 3 && (
                      <RemixLink to="/app/logs">
                        <Button variant="plain" fullWidth>
                          すべてのログを表示
                        </Button>
                      </RemixLink>
                    )}
                  </BlockStack>
                )}
              </BlockStack>
            </Card>
          </Layout.Section>
        </Layout>

        {/* アプリ情報 */}
        <Card>
          <div style={{padding: '24px', background: '#f8fafc'}}>
            <InlineStack align="space-between" blockAlign="center">
              <BlockStack gap="200">
                <Text variant="headingMd" as="h3">Gold & Platinum Price Updater</Text>
                <Text variant="bodyMd" tone="subdued">
                  田中貴金属の金・プラチナ価格に連動した商品の自動価格調整システム
                </Text>
              </BlockStack>
              
              <InlineStack gap="200">
                <Badge>Version 7</Badge>
                <Badge tone="success">稼働中</Badge>
              </InlineStack>
            </InlineStack>
          </div>
        </Card>
      </BlockStack>
    </Page>
  );
}
