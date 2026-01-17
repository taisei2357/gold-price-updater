import { authenticate } from "../shopify.server";
import { shopIsolationManager } from "./shop-isolation.server";
import { Request } from "@remix-run/node";

// 🔥 自分の会社のショップだけ無料にする設定
const FREE_SHOPS = [
  process.env.COMPANY_SHOP_DOMAIN || "your-company.myshopify.com",
  process.env.COMPANY_DEV_SHOP || "your-company-dev.myshopify.com",
  process.env.COMPANY_STAGING_SHOP || "your-company-staging.myshopify.com",
  // 直接指定も可能
  "irisht-gold.myshopify.com",
].filter(Boolean);

// 課金プラン設定
export const BILLING_PLANS = {
  BASIC: {
    id: "basic_plan",
    name: "Basic Plan",
    price: 29.99,
    interval: "EVERY_30_DAYS",
    features: ["price_update", "email_notifications"],
  },
  PREMIUM: {
    id: "premium_plan", 
    name: "Premium Plan",
    price: 99.99,
    interval: "EVERY_30_DAYS",
    features: ["advanced_pricing", "bulk_operations", "analytics"],
  },
} as const;

export class BillingManager {
  /**
   * 🔥 重要：特定ショップの課金をスキップする判定
   */
  private shouldSkipBilling(shop: string): boolean {
    const isFreeShop = FREE_SHOPS.includes(shop);
    
    // 🔍 デバッグログ（安全性確認用）
    console.log(`[BILLING CHECK]`);
    console.log(`Shop: ${shop}`);
    console.log(`Free shops list: ${JSON.stringify(FREE_SHOPS)}`);
    console.log(`Is free shop: ${isFreeShop}`);
    console.log(`Will skip billing: ${isFreeShop ? 'YES' : 'NO'}`);
    
    return isFreeShop;
  }

  /**
   * 課金が必要かチェック（認証後に呼ぶ）
   */
  async requireSubscription(
    request: Request,
    planType: keyof typeof BILLING_PLANS = "BASIC"
  ) {
    const { session, billing } = await authenticate.admin(request);
    
    if (!session?.shop) {
      throw new Error("No shop session");
    }

    // 🚀 自分の会社だけスキップ
    if (this.shouldSkipBilling(session.shop)) {
      console.log(`🎉 Billing skipped for company shop: ${session.shop}`);
      
      // 店舗設定をPREMIUMに自動設定
      await shopIsolationManager.updateShopPlan(session.shop, "premium");
      
      return { 
        billingRequired: false, 
        subscription: null,
        reason: "Company shop - free access"
      };
    }

    // 他のマーチャントは課金チェック
    const plan = BILLING_PLANS[planType];
    
    try {
      const subscription = await billing.require({
        plans: [plan],
        isTest: process.env.NODE_ENV !== "production",
      });

      return { 
        billingRequired: true, 
        subscription,
        reason: "Subscription required"
      };
    } catch (error) {
      throw new Error(`Billing check failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * 現在のサブスクリプション状況を確認
   */
  async getSubscriptionStatus(request: Request) {
    const { session, billing } = await authenticate.admin(request);
    
    if (!session?.shop) {
      return null;
    }

    // 自分の会社は常にPREMIUM扱い
    if (this.shouldSkipBilling(session.shop)) {
      return {
        shop: session.shop,
        plan: "premium",
        status: "active",
        isFree: true,
        reason: "Company shop"
      };
    }

    // 他のマーチャントの実際の課金状況をチェック
    try {
      const subscriptions = await billing.check();
      
      return {
        shop: session.shop,
        subscriptions,
        isFree: false,
      };
    } catch (error) {
      console.error("Billing check failed:", error);
      return null;
    }
  }

  /**
   * 課金が必要な機能へのアクセス前チェック
   */
  async checkFeatureAccess(
    request: Request, 
    feature: string
  ): Promise<boolean> {
    const { session } = await authenticate.admin(request);
    
    if (!session?.shop) {
      return false;
    }

    // 自分の会社は全機能無料
    if (this.shouldSkipBilling(session.shop)) {
      return true;
    }

    // 他のマーチャントは課金チェック
    const shopContext = await shopIsolationManager.getShopContext(request);
    
    if (!shopContext) {
      return false;
    }

    return shopContext.features.includes(feature);
  }
}

// ビリングマネージャーのインスタンス
export const billingManager = new BillingManager();

// ミドルウェア：課金が必要なルートで使用
export function requireBilling(planType: keyof typeof BILLING_PLANS = "BASIC") {
  return async (request: Request) => {
    const result = await billingManager.requireSubscription(request, planType);
    
    if (result.billingRequired && !result.subscription) {
      throw new Response("Subscription required", { status: 402 });
    }
    
    return result;
  };
}