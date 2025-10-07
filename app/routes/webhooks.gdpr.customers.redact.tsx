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
    console.log("Customer redact request received:", payload);

    // GDPR対応: 顧客データ削除処理
    // 実際の実装では、該当顧客のデータを削除する必要があります
    // このアプリでは顧客データを保存していないため、ログ出力のみ

    const customerId = payload.customer?.id;
    const shopDomain = payload.shop_domain;

    if (customerId) {
      console.log(`Redacting customer data for customer ${customerId} from shop ${shopDomain}`);
      // ここで実際のデータ削除処理を実装
    }

    return new Response("OK", { status: 200 });
  } catch (error) {
    console.error("Error processing customer redact request:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
};