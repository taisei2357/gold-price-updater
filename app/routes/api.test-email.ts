import { json, type ActionFunction } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";
import { sendTestEmail } from "../utils/email.server";

export const action: ActionFunction = async ({ request }) => {
  try {
    const { session } = await authenticate.admin(request);
    const shop = session.shop;

    // ショップ設定からメールアドレス取得
    const setting = await prisma.shopSetting.findUnique({
      where: { shopDomain: shop },
      select: { notificationEmail: true }
    });

    const email = setting?.notificationEmail;
    if (!email) {
      return json({ 
        success: false, 
        error: "通知メールアドレスが設定されていません" 
      });
    }

    // テストメール送信
    const result = await sendTestEmail(email);
    
    if (result.success) {
      return json({ 
        success: true, 
        email, 
        message: "テストメールを送信しました" 
      });
    } else {
      return json({ 
        success: false, 
        error: result.error 
      });
    }
    
  } catch (error) {
    console.error("テストメール送信エラー:", error);
    return json({ 
      success: false, 
      error: "メール送信処理でエラーが発生しました" 
    });
  }
};