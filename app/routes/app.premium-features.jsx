import { useLoaderData } from "@remix-run/react";
import { json } from "@remix-run/node";
import { Card, Page, Text, Banner, Button } from "@shopify/polaris";
import { billingManager } from "../services/billing.server";

// 🔥 課金チェック付きローダー
export const loader = async ({ request }) => {
  try {
    // Billingチェック実行
    const billingResult = await billingManager.requireSubscription(request, "PREMIUM");
    
    // サブスクリプション状況取得
    const subscriptionStatus = await billingManager.getSubscriptionStatus(request);
    
    return json({
      billingResult,
      subscriptionStatus,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    // 課金エラーの場合、課金画面へリダイレクト
    throw new Response("Subscription required", { 
      status: 402,
      headers: {
        "Location": "/app/billing",
      },
    });
  }
};

export default function PremiumFeatures() {
  const { billingResult, subscriptionStatus } = useLoaderData();

  return (
    <Page title="Premium Features">
      {/* 🎉 自分の会社の場合の表示 */}
      {subscriptionStatus?.isFree && (
        <Banner status="success">
          <p>
            <strong>Company Account</strong> - You have free access to all premium features!
            {subscriptionStatus.reason && ` (${subscriptionStatus.reason})`}
          </p>
        </Banner>
      )}

      {/* 通常の課金ユーザー */}
      {!subscriptionStatus?.isFree && billingResult.subscription && (
        <Banner status="info">
          <p>Premium subscription active. Thank you for your support!</p>
        </Banner>
      )}

      <Card>
        <div style={{ padding: "20px" }}>
          <Text variant="headingLg">Premium Analytics</Text>
          <Text>Advanced price tracking and analytics features.</Text>
          
          {/* プレミアム機能のコンテンツ */}
          <div style={{ marginTop: "20px" }}>
            <p>📊 Advanced price history charts</p>
            <p>📈 Profit margin analysis</p>
            <p>🎯 Custom pricing rules</p>
            <p>📧 Advanced email notifications</p>
          </div>
        </div>
      </Card>

      {/* デバッグ情報（開発時のみ） */}
      {process.env.NODE_ENV === "development" && (
        <Card>
          <div style={{ padding: "20px" }}>
            <Text variant="headingMd">Debug Info</Text>
            <pre style={{ fontSize: "12px", marginTop: "10px" }}>
              {JSON.stringify({ billingResult, subscriptionStatus }, null, 2)}
            </pre>
          </div>
        </Card>
      )}
    </Page>
  );
}

// エラー境界
export function ErrorBoundary({ error }) {
  return (
    <Page title="Access Denied">
      <Banner status="critical">
        <p>Premium subscription required to access this feature.</p>
        <Button primary url="/app/billing">
          Subscribe Now
        </Button>
      </Banner>
    </Page>
  );
}