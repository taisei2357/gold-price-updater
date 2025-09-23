import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";

export const loader: LoaderFunction = async ({ request }) => {
  try {
    const { session } = await authenticate.admin(request);
    const shop = session.shop;

    console.log('=== Database Check ===');
    console.log('Checking shop:', shop);

    // ショップ設定を全て取得
    const setting = await prisma.shopSetting.findUnique({
      where: { shopDomain: shop }
    });

    console.log('Complete shop setting:', JSON.stringify(setting, null, 2));

    // 全てのショップ設定を一覧表示（デバッグ用）
    const allSettings = await prisma.shopSetting.findMany({
      select: {
        shopDomain: true,
        notificationEmail: true,
        autoUpdateEnabled: true,
        minPricePct: true,
        createdAt: true,
        updatedAt: true
      }
    });

    console.log('All shop settings:', JSON.stringify(allSettings, null, 2));

    return json({
      success: true,
      currentShop: shop,
      setting: setting,
      allSettings: allSettings,
      hasNotificationEmail: !!setting?.notificationEmail,
      notificationEmail: setting?.notificationEmail
    });
    
  } catch (error) {
    console.error('Database check error:', error);
    return json({
      success: false,
      error: (error as Error).message,
      stack: (error as Error).stack
    });
  }
};