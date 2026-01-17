import { useLoaderData, Form } from "@remix-run/react";
import { json, redirect } from "@remix-run/node";
import { Card, Page, Text, Button, Banner, Layout } from "@shopify/polaris";
import { billingManager, BILLING_PLANS } from "../services/billing.server";

export const loader = async ({ request }) => {
  const subscriptionStatus = await billingManager.getSubscriptionStatus(request);
  
  return json({
    subscriptionStatus,
    plans: BILLING_PLANS,
  });
};

export const action = async ({ request }) => {
  const formData = await request.formData();
  const planType = formData.get("planType");
  
  if (!planType || !BILLING_PLANS[planType]) {
    return json({ error: "Invalid plan selected" }, { status: 400 });
  }

  try {
    // 課金処理実行
    await billingManager.requireSubscription(request, planType);
    return redirect("/app");
  } catch (error) {
    return json(
      { error: `Billing failed: ${error.message}` },
      { status: 500 }
    );
  }
};

export default function Billing() {
  const { subscriptionStatus, plans } = useLoaderData();

  return (
    <Page title="Billing & Subscription">
      <Layout>
        <Layout.Section>
          {/* 🎉 自分の会社の特別表示 */}
          {subscriptionStatus?.isFree && (
            <Banner status="success">
              <Text variant="headingMd">Company Account - Free Access</Text>
              <p>
                As the company account, you have complimentary access to all premium features.
                No subscription required!
              </p>
              <p><strong>Current Plan:</strong> Premium (Company)</p>
            </Banner>
          )}

          {/* 通常のマーチャント向け課金 */}
          {!subscriptionStatus?.isFree && (
            <>
              <Card>
                <div style={{ padding: "20px" }}>
                  <Text variant="headingLg">Choose Your Plan</Text>
                  <p>Select a plan that fits your business needs.</p>
                </div>
              </Card>

              {/* プラン選択 */}
              <div style={{ display: "grid", gap: "20px", marginTop: "20px" }}>
                {Object.entries(plans).map(([key, plan]) => (
                  <Card key={key}>
                    <div style={{ padding: "20px" }}>
                      <Text variant="headingMd">{plan.name}</Text>
                      <Text variant="headingXl">${plan.price}/month</Text>
                      
                      <div style={{ marginTop: "15px" }}>
                        <Text variant="bodyMd">Features included:</Text>
                        <ul style={{ marginTop: "10px" }}>
                          {plan.features.map(feature => (
                            <li key={feature}>{feature.replace(/_/g, " ")}</li>
                          ))}
                        </ul>
                      </div>

                      <Form method="post" style={{ marginTop: "20px" }}>
                        <input type="hidden" name="planType" value={key} />
                        <Button primary submit>
                          Subscribe to {plan.name}
                        </Button>
                      </Form>
                    </div>
                  </Card>
                ))}
              </div>
            </>
          )}

          {/* 現在のサブスクリプション状況 */}
          {subscriptionStatus && (
            <Card>
              <div style={{ padding: "20px" }}>
                <Text variant="headingMd">Current Status</Text>
                <pre style={{ fontSize: "12px", marginTop: "10px" }}>
                  {JSON.stringify(subscriptionStatus, null, 2)}
                </pre>
              </div>
            </Card>
          )}
        </Layout.Section>
      </Layout>
    </Page>
  );
}

export function ErrorBoundary({ error }) {
  return (
    <Page title="Billing Error">
      <Banner status="critical">
        <p>Failed to load billing information: {error.message}</p>
        <Button primary url="/app">
          Back to App
        </Button>
      </Banner>
    </Page>
  );
}