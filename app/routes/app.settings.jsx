// app/routes/app.settings.jsx
import { json } from "@remix-run/node";
import { useLoaderData, useFetcher } from "@remix-run/react";
import { useState, useEffect } from "react";
import {
  Page,
  Layout,
  Card,
  FormLayout,
  TextField,
  Checkbox,
  Select,
  Button,
  Banner,
  BlockStack,
  InlineStack,
  Text,
  Divider,
  Badge,
  Icon,
} from "@shopify/polaris";
import {
  ClockIcon,
  NotificationIcon,
  SettingsIcon,
  CheckCircleIcon,
} from "@shopify/polaris-icons";
import prisma from "../db.server";
import { authenticate } from "../shopify.server";

export async function loader({ request }) {
  const { session } = await authenticate.admin(request);
  const shop = session.shop;

  const setting = await prisma.shopSetting.upsert({
    where: { shopDomain: shop },
    update: {},
    create: { 
      shopDomain: shop, 
      minPricePct: 93, 
      autoUpdateEnabled: false,
      autoUpdateHour: 10
    },
  });

  return json({ setting });
}

export async function action({ request }) {
  const { session } = await authenticate.admin(request);
  const shop = session.shop;

  const form = await request.formData();
  const autoUpdateEnabled = form.get("autoUpdateEnabled") === "true";
  const minPricePct = Math.max(1, Math.min(100, Number(form.get("minPricePct") || 93)));
  const autoUpdateHour = Math.max(0, Math.min(23, Number(form.get("autoUpdateHour") || 10)));
  const notificationEmail = String(form.get("notificationEmail") || "");

  await prisma.shopSetting.upsert({
    where: { shopDomain: shop },
    update: { 
      autoUpdateEnabled, 
      minPricePct, 
      autoUpdateHour,
      notificationEmail: notificationEmail || null 
    },
    create: {
      shopDomain: shop,
      autoUpdateEnabled,
      minPricePct,
      autoUpdateHour,
      notificationEmail: notificationEmail || null
    }
  });

  return json({ 
    success: true, 
    message: "設定が正常に保存されました",
    setting: {
      autoUpdateEnabled,
      minPricePct,
      autoUpdateHour,
      notificationEmail: notificationEmail || null
    }
  });
}

export default function Settings() {
  const { setting } = useLoaderData();
  const fetcher = useFetcher();
  const testEmailFetcher = useFetcher(); // テストメール用のfetcher
  
  // フォームの状態管理
  const [autoUpdateEnabled, setAutoUpdateEnabled] = useState(setting.autoUpdateEnabled);
  const [minPricePct, setMinPricePct] = useState(setting.minPricePct.toString());
  const [autoUpdateHour, setAutoUpdateHour] = useState(setting.autoUpdateHour.toString());
  const [notificationEmail, setNotificationEmail] = useState(setting.notificationEmail || "");
  
  // 保存成功メッセージの管理
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showEmailTestMessage, setShowEmailTestMessage] = useState(false);
  
  // 保存成功時の処理
  useEffect(() => {
    if (fetcher.data?.success) {
      setShowSuccessMessage(true);
      // 3秒後にメッセージを非表示
      const timer = setTimeout(() => setShowSuccessMessage(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [fetcher.data]);

  // テストメール結果の処理
  useEffect(() => {
    if (testEmailFetcher.data) {
      setShowEmailTestMessage(true);
      const timer = setTimeout(() => setShowEmailTestMessage(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [testEmailFetcher.data]);

  // 時刻オプションの生成
  const hourOptions = [...Array(24)].map((_, i) => ({
    label: `${String(i).padStart(2, '0')}:00`,
    value: i.toString(),
  }));

  // フォーム送信
  const handleSubmit = () => {
    const formData = new FormData();
    formData.append("autoUpdateEnabled", autoUpdateEnabled.toString());
    formData.append("minPricePct", minPricePct);
    formData.append("autoUpdateHour", autoUpdateHour);
    formData.append("notificationEmail", notificationEmail);
    
    fetcher.submit(formData, { method: "post" });
  };

  // テストメール送信
  const handleTestEmail = () => {
    testEmailFetcher.submit({}, { 
      method: "post", 
      action: "/api/test-email" 
    });
  };

  return (
    <Page
      title="アプリ設定"
      subtitle="自動価格調整の設定を管理します"
      titleMetadata={<Badge tone="info">V2.0</Badge>}
    >
      <Layout>
        {/* 保存成功メッセージ */}
        {showSuccessMessage && (
          <Layout.Section>
            <Banner tone="success" onDismiss={() => setShowSuccessMessage(false)}>
              <InlineStack gap="200" align="center">
                <Icon source={CheckCircleIcon} tone="success" />
                <Text>設定が正常に保存されました</Text>
              </InlineStack>
            </Banner>
          </Layout.Section>
        )}

        {/* テストメール結果メッセージ */}
        {showEmailTestMessage && (
          <Layout.Section>
            <Banner 
              tone={testEmailFetcher.data?.success ? "success" : "critical"} 
              onDismiss={() => setShowEmailTestMessage(false)}
            >
              <InlineStack gap="200" align="center">
                <Icon 
                  source={CheckCircleIcon} 
                  tone={testEmailFetcher.data?.success ? "success" : "critical"} 
                />
                <Text>
                  {testEmailFetcher.data?.success 
                    ? `テストメールを送信しました: ${testEmailFetcher.data?.email}`
                    : `テストメール送信失敗: ${testEmailFetcher.data?.error}`
                  }
                </Text>
              </InlineStack>
            </Banner>
          </Layout.Section>
        )}

        {/* 自動更新設定 */}
        <Layout.Section>
          <Card>
            <BlockStack gap="500">
              <InlineStack gap="300" align="start">
                <Icon source={SettingsIcon} tone="base" />
                <BlockStack gap="200">
                  <Text variant="headingMd" as="h2">
                    自動更新設定
                  </Text>
                  <Text variant="bodySm" tone="subdued">
                    田中貴金属の価格変動に基づいて商品価格を自動調整します
                  </Text>
                </BlockStack>
              </InlineStack>
              
              <Divider />
              
              <FormLayout>
                <Checkbox
                  label="自動更新を有効化"
                  helpText="有効にすると設定時刻に自動で価格調整が実行されます"
                  checked={autoUpdateEnabled}
                  onChange={setAutoUpdateEnabled}
                />
                
                <InlineStack gap="400" align="start">
                  <div style={{ minWidth: '200px' }}>
                    <Select
                      label="自動更新時刻（JST）"
                      options={hourOptions}
                      value={autoUpdateHour}
                      onChange={setAutoUpdateHour}
                      disabled={!autoUpdateEnabled}
                    />
                  </div>
                  <div style={{ paddingTop: '24px' }}>
                    <Badge tone={autoUpdateEnabled ? 'info' : 'warning'}>
                      {autoUpdateEnabled ? '有効' : '無効'}
                    </Badge>
                  </div>
                </InlineStack>

                <TextField
                  label="価格下限設定（%）"
                  type="number"
                  value={minPricePct}
                  onChange={setMinPricePct}
                  min={1}
                  max={100}
                  suffix="%"
                  helpText={`現在価格の${minPricePct}%を下限として保護します（例: ${minPricePct}% = ${100 - parseInt(minPricePct)}%以上下がらない）`}
                />
              </FormLayout>
            </BlockStack>
          </Card>
        </Layout.Section>

        {/* 通知設定 */}
        <Layout.Section>
          <Card>
            <BlockStack gap="500">
              <InlineStack gap="300" align="start">
                <Icon source={NotificationIcon} tone="base" />
                <BlockStack gap="200">
                  <Text variant="headingMd" as="h2">
                    通知設定
                  </Text>
                  <Text variant="bodySm" tone="subdued">
                    価格更新の実行結果やエラーを通知します
                  </Text>
                </BlockStack>
              </InlineStack>
              
              <Divider />
              
              <FormLayout>
                <TextField
                  label="通知メールアドレス（任意）"
                  type="email"
                  value={notificationEmail}
                  onChange={setNotificationEmail}
                  placeholder="you@example.com"
                  helpText="設定すると自動更新の結果がメールで通知されます"
                />
                
                {notificationEmail && (
                  <InlineStack gap="200" align="start">
                    <Button
                      variant="secondary"
                      size="medium"
                      onClick={handleTestEmail}
                      loading={testEmailFetcher.state === "submitting"}
                      disabled={!notificationEmail}
                    >
                      テストメール送信
                    </Button>
                    <div style={{ paddingTop: '6px' }}>
                      <Text variant="bodySm" tone="subdued">
                        設定したメールアドレスに通知のテストメールを送信します
                      </Text>
                    </div>
                  </InlineStack>
                )}
              </FormLayout>
            </BlockStack>
          </Card>
        </Layout.Section>

        {/* スケジュール情報 */}
        <Layout.Section>
          <Card>
            <BlockStack gap="500">
              <InlineStack gap="300" align="start">
                <Icon source={ClockIcon} tone="base" />
                <BlockStack gap="200">
                  <Text variant="headingMd" as="h2">
                    実行スケジュール
                  </Text>
                  <Text variant="bodySm" tone="subdued">
                    自動更新の実行タイミングについて
                  </Text>
                </BlockStack>
              </InlineStack>
              
              <Divider />
              
              <BlockStack gap="300">
                <InlineStack gap="600">
                  <div>
                    <Text variant="bodyMd" as="p" fontWeight="semibold">
                      実行曜日
                    </Text>
                    <Text variant="bodySm" tone="subdued">
                      平日（月〜金曜日）
                    </Text>
                  </div>
                  <div>
                    <Text variant="bodyMd" as="p" fontWeight="semibold">
                      実行時刻
                    </Text>
                    <Text variant="bodySm" tone="subdued">
                      {String(setting.autoUpdateHour || 10).padStart(2, '0')}:00（日本時間）
                    </Text>
                  </div>
                  <div>
                    <Text variant="bodyMd" as="p" fontWeight="semibold">
                      祝日対応
                    </Text>
                    <Text variant="bodySm" tone="subdued">
                      自動的にスキップ
                    </Text>
                  </div>
                </InlineStack>
                
                <Banner tone="success">
                  <BlockStack gap="200">
                    <Text fontWeight="semibold">
                      🕙 自動更新スケジュール
                    </Text>
                    <Text>
                      • <strong>実行時刻:</strong> 設定した時刻に自動実行<br/>
                      • <strong>対象曜日:</strong> 月曜日〜金曜日（平日のみ）<br/>
                      • <strong>祝日:</strong> 自動的にスキップ<br/>
                      • <strong>実行条件:</strong> 自動更新が有効で、対象商品が選択されている場合
                    </Text>
                  </BlockStack>
                </Banner>
              </BlockStack>
            </BlockStack>
          </Card>
        </Layout.Section>

        {/* 保存ボタン */}
        <Layout.Section>
          <InlineStack align="end">
            <Button
              variant="primary"
              size="large"
              onClick={handleSubmit}
              loading={fetcher.state === "submitting"}
            >
              設定を保存
            </Button>
          </InlineStack>
        </Layout.Section>
      </Layout>
    </Page>
  );
}