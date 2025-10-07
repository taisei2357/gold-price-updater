import type { ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import crypto from "crypto";

export const action = async ({ request }: ActionFunctionArgs) => {
  // HMAC署名検証
  const body = await request.text();
  const hmac = request.headers.get("x-shopify-hmac-sha256");
  const topic = request.headers.get("x-shopify-topic");
  const webhookSecret = process.env.SHOPIFY_WEBHOOK_SECRET;

  console.log("GDPR webhook received:", {
    topic,
    hasHmac: !!hmac,
    hasSecret: !!webhookSecret,
    bodyLength: body.length
  });

  if (!hmac || !webhookSecret) {
    console.error("Missing HMAC or webhook secret", { hmac: !!hmac, webhookSecret: !!webhookSecret });
    return new Response("Unauthorized", { status: 401 });
  }

  const calculatedHmac = crypto
    .createHmac("sha256", webhookSecret)
    .update(body, "utf8")
    .digest("base64");

  console.log("HMAC verification:", {
    received: hmac,
    calculated: calculatedHmac,
    match: hmac === calculatedHmac
  });

  if (hmac !== calculatedHmac) {
    console.error("HMAC verification failed", {
      received: hmac,
      calculated: calculatedHmac,
      webhookSecret: webhookSecret?.substring(0, 10) + "..."
    });
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const payload = JSON.parse(body);
    console.log(`GDPR webhook received - Topic: ${topic}`, payload);

    // トピック別処理
    switch (topic) {
      case "customers/data_request":
        console.log("Processing customer data request:", payload);
        // GDPR対応: 顧客データ要求処理
        // このアプリでは顧客データを保存していないため、ログ出力のみ
        break;

      case "customers/redact":
        console.log("Processing customer redact request:", payload);
        // GDPR対応: 顧客データ削除処理
        const customerId = payload.customer?.id;
        const shopDomain = payload.shop_domain;
        
        if (customerId) {
          console.log(`Redacting customer data for customer ${customerId} from shop ${shopDomain}`);
          // ここで実際のデータ削除処理を実装
        }
        break;

      case "shop/redact":
        console.log("Processing shop redact request:", payload);
        // GDPR対応: ショップデータ削除処理
        const shopId = payload.shop_id;
        const shopDomainRedact = payload.shop_domain;
        
        if (shopId) {
          console.log(`Redacting shop data for shop ${shopDomainRedact} (ID: ${shopId})`);
          // 実際のデータ削除処理を実装
        }
        break;

      default:
        console.log(`Unknown GDPR topic: ${topic}`);
    }

    return new Response("OK", { status: 200 });
  } catch (error) {
    console.error("Error processing GDPR webhook:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
};