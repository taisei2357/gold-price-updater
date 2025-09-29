import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Page, Card, BlockStack, InlineStack, Text, Badge, DataTable } from "@shopify/polaris";
import { usageLogger } from "../services/usage-logger.server";
import { shopIsolationManager } from "../services/shop-isolation.server";
import { queueManager } from "../services/queue.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const shopContext = await shopIsolationManager.getShopContext(request);
  
  if (!shopContext) {
    throw new Response("Unauthorized", { status: 401 });
  }

  // 機能アクセス権をチェック（プレミアム機能）
  const hasAnalyticsAccess = await shopIsolationManager.checkFeatureAccess(
    shopContext.shopDomain, 
    'analytics'
  );

  if (!hasAnalyticsAccess) {
    return json({ 
      error: "Analytics feature requires premium plan",
      hasAccess: false 
    });
  }

  const [usageStats, queueStats, resourceUsage] = await Promise.all([
    usageLogger.getShopUsageStats(shopContext.shopDomain),
    queueManager.getQueueStats(shopContext.shopDomain),
    usageLogger.checkShopResourceUsage(shopContext.shopDomain),
  ]);

  return json({
    hasAccess: true,
    shopDomain: shopContext.shopDomain,
    planType: shopContext.planType,
    usageStats,
    queueStats,
    resourceUsage,
  });
}

export default function AnalyticsPage() {
  const data = useLoaderData<typeof loader>();

  if (!data.hasAccess) {
    return (
      <Page
        title="Analytics"
        breadcrumbs={[{ content: "Settings", url: "/app" }]}
      >
        <Card>
          <BlockStack gap="400">
            <Text variant="headingMd">Premium Feature</Text>
            <Text>Analytics dashboard requires a premium plan. Please upgrade to access detailed usage statistics.</Text>
          </BlockStack>
        </Card>
      </Page>
    );
  }

  const { usageStats, queueStats, resourceUsage } = data;

  return (
    <Page
      title="Analytics Dashboard"
      breadcrumbs={[{ content: "Settings", url: "/app" }]}
    >
      <BlockStack gap="500">
        {/* 使用状況概要 */}
        <Card>
          <BlockStack gap="400">
            <Text variant="headingMd">Usage Overview (24h)</Text>
            <InlineStack gap="400">
              <div>
                <Text variant="headingLg">{usageStats.totalApiCalls}</Text>
                <Text tone="subdued">API Calls</Text>
              </div>
              <div>
                <Text variant="headingLg">{Math.round(usageStats.averageResponseTime)}ms</Text>
                <Text tone="subdued">Avg Response Time</Text>
              </div>
              <div>
                <Text variant="headingLg">{usageStats.errorRate.toFixed(2)}%</Text>
                <Text tone="subdued">Error Rate</Text>
              </div>
            </InlineStack>
          </BlockStack>
        </Card>

        {/* リソース使用状況 */}
        <Card>
          <BlockStack gap="400">
            <Text variant="headingMd">Current Hour Limits</Text>
            <InlineStack gap="400">
              <div>
                <Text variant="headingMd">
                  {resourceUsage.currentHourUsage.apiCalls} / {resourceUsage.limits.maxApiCallsPerHour}
                </Text>
                <Text tone="subdued">API Calls</Text>
                <Badge 
                  tone={resourceUsage.quotaRemaining.apiCalls > 10 ? "success" : "critical"}
                >
                  {resourceUsage.quotaRemaining.apiCalls} remaining
                </Badge>
              </div>
              <div>
                <Text variant="headingMd">
                  {resourceUsage.currentHourUsage.actions} / {resourceUsage.limits.maxActionsPerHour}
                </Text>
                <Text tone="subdued">Actions</Text>
                <Badge 
                  tone={resourceUsage.quotaRemaining.actions > 50 ? "success" : "attention"}
                >
                  {resourceUsage.quotaRemaining.actions} remaining
                </Badge>
              </div>
            </InlineStack>
          </BlockStack>
        </Card>

        {/* キュー統計 */}
        <Card>
          <BlockStack gap="400">
            <Text variant="headingMd">Processing Queue</Text>
            <InlineStack gap="400">
              <div>
                <Text variant="headingLg">{queueStats.pending}</Text>
                <Text tone="subdued">Pending</Text>
              </div>
              <div>
                <Text variant="headingLg">{queueStats.processing}</Text>
                <Text tone="subdued">Processing</Text>
              </div>
              <div>
                <Text variant="headingLg">{queueStats.completed}</Text>
                <Text tone="subdued">Completed</Text>
              </div>
              <div>
                <Text variant="headingLg">{queueStats.failed}</Text>
                <Text tone="subdued">Failed</Text>
              </div>
            </InlineStack>
          </BlockStack>
        </Card>

        {/* アクション別使用状況 */}
        <Card>
          <BlockStack gap="400">
            <Text variant="headingMd">Action Breakdown</Text>
            <DataTable
              columnContentTypes={['text', 'numeric']}
              headings={['Action Type', 'Count']}
              rows={Object.entries(usageStats.actionBreakdown).map(([action, count]) => [
                action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
                count
              ])}
            />
          </BlockStack>
        </Card>

        {/* 時間別使用状況 */}
        <Card>
          <BlockStack gap="400">
            <Text variant="headingMd">Hourly Usage Pattern</Text>
            <DataTable
              columnContentTypes={['text', 'numeric', 'numeric']}
              headings={['Hour', 'Actions', 'API Calls']}
              rows={usageStats.hourlyUsage.slice(-12).map(hour => [
                new Date(hour.hour).toLocaleString('ja-JP', { 
                  month: 'short', 
                  day: 'numeric', 
                  hour: '2-digit' 
                }),
                hour.count,
                hour.apiCalls
              ])}
            />
          </BlockStack>
        </Card>

        {/* プラン情報 */}
        <Card>
          <BlockStack gap="400">
            <InlineStack align="space-between">
              <Text variant="headingMd">Plan Information</Text>
              <Badge tone={data.planType === 'free' ? 'info' : 'success'}>
                {data.planType.toUpperCase()} PLAN
              </Badge>
            </InlineStack>
            <Text tone="subdued">
              Shop: {data.shopDomain}
            </Text>
            <Text tone="subdued">
              Quota resets at: {new Date(resourceUsage.resetAt).toLocaleString('ja-JP')}
            </Text>
          </BlockStack>
        </Card>
      </BlockStack>
    </Page>
  );
}