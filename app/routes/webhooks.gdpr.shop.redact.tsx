import type { ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import crypto from "crypto";

export const action = async ({ request }: ActionFunctionArgs) => {
  // HMAC署名検証
  const body = await request.text();
  const hmac = request.headers.get("x-shopify-hmac-sha256");
  const webhookSecret = process.env.SHOPIFY_WEBHOOK_SECRET;

  if (!hmac || !webhookSecret) {
    console.error("Missing HMAC or webhook secret");
    return new Response("Unauthorized", { status: 401 });
  }

  const calculatedHmac = crypto
    .createHmac("sha256", webhookSecret)
    .update(body, "utf8")
    .digest("base64");

  if (hmac !== calculatedHmac) {
    console.error("HMAC verification failed");
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const payload = JSON.parse(body);
    console.log("Shop redact request received:", payload);

    // GDPR対応: ショップデータ削除処理
    // アプリがアンインストールされた際、該当ショップのデータを削除
    
    const shopDomain = payload.shop_domain;
    const shopId = payload.shop_id;

    if (shopId) {
      console.log(`Redacting shop data for shop ${shopDomain} (ID: ${shopId})`);
      
      // 実際の実装では以下のような処理を実装:
      // - データベースから該当ショップのデータを削除
      // - ログファイルから該当ショップの記録を削除
      // - 一時的なキャッシュをクリア
      
      // 例: Prismaを使用している場合
      // await prisma.priceUpdateLog.deleteMany({
      //   where: { shop: shopDomain }
      // });
    }

    return new Response("OK", { status: 200 });
  } catch (error) {
    console.error("Error processing shop redact request:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
};