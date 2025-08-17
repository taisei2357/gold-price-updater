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
  BellIcon,
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
  
  // フォームの状態管理
  const [autoUpdateEnabled, setAutoUpdateEnabled] = useState(setting.autoUpdateEnabled);
  const [minPricePct, setMinPricePct] = useState(setting.minPricePct.toString());
  const [autoUpdateHour, setAutoUpdateHour] = useState(setting.autoUpdateHour.toString());
  const [notificationEmail, setNotificationEmail] = useState(setting.notificationEmail || "");
  
  // 保存成功メッセージの管理
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  
  // 保存成功時の処理
  useEffect(() => {
    if (fetcher.data?.success) {
      setShowSuccessMessage(true);
      // 3秒後にメッセージを非表示
      const timer = setTimeout(() => setShowSuccessMessage(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [fetcher.data]);

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
                <Icon source={BellIcon} tone="base" />
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
                
                <Banner tone="info">
                  <Text>
                    自動更新は平日の設定時刻に実行され、日本の祝日は自動的にスキップされます。
                    価格変動がない場合や取得エラー時は更新をスキップします。
                  </Text>
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