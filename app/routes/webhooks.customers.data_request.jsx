import { createHmac, timingSafeEqual } from "crypto";

export const action = async ({ request }) => {
  const raw = await request.text();
  const hmac = request.headers.get("x-shopify-hmac-sha256") ?? "";
  const digest = createHmac("sha256", process.env.SHOPIFY_API_SECRET)
    .update(raw, "utf8")
    .digest("base64");

  const valid =
    hmac.length === digest.length &&
    timingSafeEqual(Buffer.from(hmac), Buffer.from(digest));

  if (!valid) return new Response("unauthorized", { status: 401 });

  // 顧客データリクエスト処理
  // 現在はセッション以外に個人データを保持していないため即座に200応答
  // 必要に応じてここでデータエクスポート処理やキュー通知を実装
  console.log("Customer data request received:", JSON.parse(raw));
  
  return new Response("ok", { status: 200 });
};

export const loader = () => new Response(null, { status: 405 });