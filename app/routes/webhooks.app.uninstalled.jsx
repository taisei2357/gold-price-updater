import { authenticate } from "../shopify.server";
import db from "../db.server";

export const action = async ({ request }) => {
  const { shop, session, topic } = await authenticate.webhook(request);

  console.log(`Received ${topic} webhook for ${shop}`);

  try {
    // アプリアンインストール時の包括的なデータクリーンアップ
    // 複数回実行される可能性があるため、エラーを無視して続行
    await db.$transaction([
      // セッションデータ削除
      db.session.deleteMany({ where: { shop } }),
      // 商品選択データ削除
      db.selectedProduct.deleteMany({ where: { shopDomain: shop } }),
      // ショップ設定削除
      db.shopSetting.deleteMany({ where: { shopDomain: shop } }),
      // 実行ログは監査のため残す（必要に応じて削除）
      // db.priceUpdateLog.deleteMany({ where: { shopDomain: shop } }),
    ]);

    console.log(`Successfully cleaned up all data for shop: ${shop}`);
  } catch (error) {
    console.error(`Error cleaning up data for shop ${shop}:`, error);
    // エラーが発生してもWebhookは成功として扱う
  }

  return new Response();
};
