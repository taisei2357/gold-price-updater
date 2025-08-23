// app/routes/api.test-email.ts - メール送信テスト用API
import type { ActionFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import { sendTestEmail } from "../utils/email.server";
import prisma from '../db.server';

export const action: ActionFunction = async ({ request }) => {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    // Shopify認証
    const { session } = await authenticate.admin(request);
    const shop = session.shop;

    // ショップの通知メール設定を取得
    const setting = await prisma.shopSetting.findUnique({
      where: { shopDomain: shop },
      select: { notificationEmail: true }
    });

    if (!setting?.notificationEmail) {
      return json({ 
        success: false, 
        error: "通知メールアドレスが設定されていません。設定画面でメールアドレスを入力してください。" 
      }, { status: 400 });
    }

    console.log(`🧪 テストメール送信開始: ${setting.notificationEmail}`);

    // テストメール送信
    const result = await sendTestEmail(setting.notificationEmail);

    if (result.success) {
      console.log(`✅ テストメール送信成功: ${setting.notificationEmail}`);
      return json({ 
        success: true, 
        message: `テストメールを ${setting.notificationEmail} に送信しました`,
        email: setting.notificationEmail
      });
    } else {
      console.error(`❌ テストメール送信失敗: ${result.error}`);
      return json({ 
        success: false, 
        error: `メール送信に失敗しました: ${result.error}` 
      }, { status: 500 });
    }

  } catch (error) {
    console.error('テストメールAPI エラー:', error);
    return json({ 
      success: false, 
      error: `サーバーエラーが発生しました: ${(error as Error).message}` 
    }, { status: 500 });
  }
};