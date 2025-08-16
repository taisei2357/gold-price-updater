// api/cron/price-update.mjs
export default async function handler(req, res) {
  try {
    console.log(`Vercel Cron triggered: ${new Date().toISOString()}`);
    
    // 簡易実装：現在は200レスポンスを返すのみ
    // 実際のPrisma+Shopify API呼び出しは後で実装
    const result = {
      message: "Cron executed successfully",
      timestamp: new Date().toISOString(),
      shops: []
    };

    console.log("Cron execution completed:", result);
    res.status(200).json(result);
  } catch (e) {
    console.error("Vercel Cron error:", e);
    res.status(500).json({ error: String(e?.message ?? e) });
  }
}