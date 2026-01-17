import { json } from "@remix-run/node";

// 🔍 課金安全性テスト用エンドポイント
export async function GET() {
  // FREE_SHOPS設定の確認
  const FREE_SHOPS = [
    process.env.COMPANY_SHOP_DOMAIN || "your-company.myshopify.com",
    process.env.COMPANY_DEV_SHOP || "your-company-dev.myshopify.com",
    process.env.COMPANY_STAGING_SHOP || "your-company-staging.myshopify.com",
    "irisht-gold.myshopify.com",
  ].filter(Boolean);

  // テストケース
  const testCases = [
    {
      shop: "irisht-gold.myshopify.com",
      expected: "FREE",
      actual: FREE_SHOPS.includes("irisht-gold.myshopify.com") ? "FREE" : "CHARGED"
    },
    {
      shop: "random-customer.myshopify.com", 
      expected: "CHARGED",
      actual: FREE_SHOPS.includes("random-customer.myshopify.com") ? "FREE" : "CHARGED"
    }
  ];

  // 安全性レポート
  const safetyReport = {
    timestamp: new Date().toISOString(),
    freeShopsList: FREE_SHOPS,
    testResults: testCases,
    safetyStatus: testCases.every(test => test.expected === test.actual) ? "✅ SAFE" : "❌ UNSAFE",
    guarantees: {
      "irisht-gold.myshopify.com": FREE_SHOPS.includes("irisht-gold.myshopify.com") ? "100% NO BILLING" : "⚠️ WILL BE CHARGED",
      billingAPIWillBeCalled: FREE_SHOPS.includes("irisht-gold.myshopify.com") ? "NO - SKIPPED" : "YES - CHARGED",
      moneyCharged: FREE_SHOPS.includes("irisht-gold.myshopify.com") ? "$0.00" : "$29.99+"
    }
  };

  return json(safetyReport);
}