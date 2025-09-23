import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";
import { sendTestEmail } from '../utils/email.server';

export const loader: LoaderFunction = async ({ request }) => {
  try {
    const { session } = await authenticate.admin(request);
    const shop = session.shop;

    console.log('=== Shop Email Debug ===');
    console.log('Shop domain:', shop);

    // ショップ設定からメールアドレス取得
    const setting = await prisma.shopSetting.findUnique({
      where: { shopDomain: shop },
      select: { notificationEmail: true, autoUpdateEnabled: true, minPricePct: true }
    });

    console.log('Shop setting:', setting);

    const email = setting?.notificationEmail;
    console.log('Configured email address:', email);

    if (!email) {
      return json({ 
        success: false, 
        error: "通知メールアドレスが設定されていません",
        shop,
        setting: setting
      });
    }

    // 設定されたアドレスにテストメール送信
    const result = await sendTestEmail(email);
    console.log('Test email result:', result);
    
    return json({
      success: result.success,
      error: result.error,
      messageId: result.messageId,
      targetEmail: email,
      shop,
      setting: setting,
      fromAddress: process.env.NOTIFICATION_EMAIL_FROM || 't.takei@irisht.jp'
    });
    
  } catch (error) {
    console.error('Shop email debug error:', error);
    return json({
      success: false,
      error: (error as Error).message,
      stack: (error as Error).stack
    });
  }
};