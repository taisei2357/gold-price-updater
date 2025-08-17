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
import { fetchGoldPriceDataTanaka } from "../models/gold.server";
import prisma from "../db.server";

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);

  try {
    // 金価格情報を取得
    const goldData = await fetchGoldPriceDataTanaka();
    
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
        ratio: goldData.changeRatio,
        percentage: (goldData.changeRatio * 100).toFixed(2),
        change: goldData.changePercent,
        retailPrice: goldData.retailPrice,
        retailPriceFormatted: goldData.retailPriceFormatted,
        changeDirection: goldData.changeDirection,
        lastUpdated: goldData.lastUpdated
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
    console.error('Dashboard loader error:', error);
    return json({
      goldPrice: null,
      stats: { selectedProducts: 0, totalLogs: 0, lastExecution: null, autoScheduleEnabled: false },
      recentLogs: []
    });
  }
};

export default function Dashboard() {
  const { goldPrice, stats, recentLogs } = useLoaderData();

  return (
    <Page
      title="金価格自動調整ダッシュボード"
      subtitle="K18商品の価格を田中貴金属の金価格に連動して自動調整"
    >
      <BlockStack gap="600">
        {/* Hero Section - 金価格情報 */}
        <Card>
          <Box
            padding="600"
            style={{
              background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
              borderRadius: '16px',
              color: 'white',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
          
          <InlineStack align="space-between" blockAlign="center">
            <BlockStack gap="300">
              <InlineStack gap="200" blockAlign="center">
                <span style={{ fontSize: '24px', marginRight: '8px' }}>📈</span>
                <Text variant="headingLg" as="h2" tone="text-inverse">
                  田中貴金属 金価格
                </Text>
              </InlineStack>
              
              {goldPrice ? (
                <>
                  <Text variant="heading2xl" as="p" tone="text-inverse">
                    {goldPrice.retailPriceFormatted}
                  </Text>
                  <InlineStack gap="300" blockAlign="center">
                    <Badge 
                      tone={goldPrice.changeDirection === 'up' ? 'critical' : goldPrice.changeDirection === 'down' ? 'success' : 'info'}
                      size="large"
                    >
                      {goldPrice.change}
                    </Badge>
                    <Text variant="bodyLg" tone="text-inverse">
                      前日比 • 調整率: {goldPrice.percentage}%
                    </Text>
                  </InlineStack>
                </>
              ) : (
                <Text variant="headingLg" tone="text-inverse">
                  価格情報取得中...
                </Text>
              )}
            </BlockStack>
            
            <BlockStack gap="200" align="end">
              <Text variant="bodySm" tone="text-inverse">
                最終更新
              </Text>
              <Text variant="bodyMd" tone="text-inverse">
                {goldPrice ? new Date(goldPrice.lastUpdated).toLocaleString('ja-JP') : '--'}
              </Text>
            </BlockStack>
          </InlineStack>
          </Box>
        </Card>

        {/* 統計カード */}
        <Layout>
          <Layout.Section>
            <InlineStack gap="400">
              <Card>
                <Box padding="400" style={{ textAlign: 'center' }}>
                  <BlockStack gap="300" align="center">
                    <Box
                      style={{
                        width: '48px',
                        height: '48px',
                        background: '#e0f2fe',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Icon source={ProductIcon} tone="info" />
                    </Box>
                    <Text variant="heading2xl" as="p">{stats.selectedProducts}</Text>
                    <Text variant="bodyMd" tone="subdued">選択中の商品</Text>
                  </BlockStack>
                </Box>
              </Card>

              <Card>
                <Box padding="400" style={{ textAlign: 'center' }}>
                  <BlockStack gap="300" align="center">
                    <Box
                      style={{
                        width: '48px',
                        height: '48px',
                        background: stats.autoScheduleEnabled ? '#dcfce7' : '#fef3c7',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Icon source={ClockIcon} tone={stats.autoScheduleEnabled ? 'success' : 'warning'} />
                    </Box>
                    <Badge tone={stats.autoScheduleEnabled ? 'success' : 'warning'}>
                      {stats.autoScheduleEnabled ? '有効' : '無効'}
                    </Badge>
                    <Text variant="bodyMd" tone="subdued">自動スケジュール</Text>
                  </BlockStack>
                </Box>
              </Card>

              <Card>
                <Box padding="400" style={{ textAlign: 'center' }}>
                  <BlockStack gap="300" align="center">
                    <Box
                      style={{
                        width: '48px',
                        height: '48px',
                        background: '#fce7f3',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Icon source={NotificationIcon} tone="base" />
                    </Box>
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
                    <RemixLink to="/app/settings" style={{ textDecoration: 'none' }}>
                      <Button icon={SettingsIcon}>設定</Button>
                    </RemixLink>
                  </InlineStack>
                </InlineStack>
                
                <InlineStack gap="300">
                  <RemixLink to="/app/products" style={{ textDecoration: 'none' }}>
                    <Button variant="primary" size="large">
                      商品価格を調整
                    </Button>
                  </RemixLink>
                  <RemixLink to="/app/logs" style={{ textDecoration: 'none' }}>
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
                  <Box padding="600" style={{ textAlign: 'center' }}>
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
                        style={{
                          background: '#f9fafb',
                          borderRadius: '8px',
                          borderLeft: `4px solid ${log.success ? '#10b981' : '#ef4444'}`
                        }}
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
                      <RemixLink to="/app/logs" style={{ textDecoration: 'none' }}>
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
          <Box
            padding="600"
            style={{
              background: 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)',
              borderRadius: '12px'
            }}
          >
            <InlineStack align="space-between" blockAlign="center">
              <BlockStack gap="200">
                <Text variant="headingMd" as="h3">Gold Price Updater</Text>
                <Text variant="bodyMd" tone="subdued">
                  田中貴金属の金価格に連動したK18商品の自動価格調整システム
                </Text>
              </BlockStack>
              
              <InlineStack gap="200">
                <Badge>Version 7</Badge>
                <Badge tone="success">稼働中</Badge>
              </InlineStack>
            </InlineStack>
          </Box>
        </Card>
      </BlockStack>
    </Page>
  );
}
