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

export const loader = async ({ request }) => {
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
      platinumPrice: platinumData ? {
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
      platinumPrice: null,
      stats: { selectedProducts: 0, totalLogs: 0, lastExecution: null, autoScheduleEnabled: false },
      recentLogs: []
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
              <div style={{padding: '24px', background: '#fbbf24', borderRadius: '8px'}}>
              <InlineStack align="space-between" blockAlign="center">
                <BlockStack gap="300">
                  <InlineStack gap="200" blockAlign="center">
                    <span style={{ fontSize: '24px', marginRight: '8px' }}>🥇</span>
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
                          小売 前日比: {goldPrice.change}
                        </Badge>
                        <Badge tone="base" size="large">
                          調整率: {goldPrice.percentage}%
                        </Badge>
                      </InlineStack>
                      <InlineStack gap="300" blockAlign="center">
                        <Badge tone="base" size="medium">
                          買取: {goldPrice.buyPriceFormatted || '取得失敗'}
                        </Badge>
                        <Badge tone="info" size="medium">
                          買取 前日比: {goldPrice.buyChangePercent || '0.00%'}
                        </Badge>
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
              </div>
            </Card>
          </Layout.Section>
          
          <Layout.Section>
            {/* プラチナ価格 */}
            <Card>
              <div style={{padding: '24px', background: '#94a3b8', borderRadius: '8px'}}>
              <InlineStack align="space-between" blockAlign="center">
                <BlockStack gap="300">
                  <InlineStack gap="200" blockAlign="center">
                    <span style={{ fontSize: '24px', marginRight: '8px' }}>🥈</span>
                    <Text variant="headingLg" as="h2" tone="text-inverse">
                      田中貴金属 プラチナ価格
                    </Text>
                  </InlineStack>
                  
                  {platinumPrice ? (
                    <>
                      <Text variant="heading2xl" as="p" tone="text-inverse">
                        {platinumPrice.retailPriceFormatted}
                      </Text>
                      <InlineStack gap="300" blockAlign="center">
                        <Badge 
                          tone={platinumPrice.changeDirection === 'up' ? 'critical' : platinumPrice.changeDirection === 'down' ? 'success' : 'info'}
                          size="large"
                        >
                          小売 前日比: {platinumPrice.change}
                        </Badge>
                        <Badge tone="base" size="large">
                          調整率: {platinumPrice.percentage}%
                        </Badge>
                      </InlineStack>
                      <InlineStack gap="300" blockAlign="center">
                        <Badge tone="base" size="medium">
                          買取: {platinumPrice.buyPriceFormatted || '取得失敗'}
                        </Badge>
                        <Badge tone="info" size="medium">
                          買取 前日比: {platinumPrice.buyChangePercent || '0.00%'}
                        </Badge>
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
                    {platinumPrice ? new Date(platinumPrice.lastUpdated).toLocaleString('ja-JP') : '--'}
                  </Text>
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
