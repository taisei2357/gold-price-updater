// api/cron/price-update.js
export default async function handler(req, res) {
  try {
    const base = (process.env.APP_URL ?? `https://${req.headers.host}`).replace(/\/$/, "");
    const secret = process.env.CRON_SECRET;
    if (!secret) return res.status(500).json({ error: "CRON_SECRET missing" });

    console.log(`Vercel Cron triggered: ${new Date().toISOString()}`);
    console.log(`Target URL: ${base}/webhooks/cron/execute?secret=${secret}`);

    // 無限ループ防止：Remix 側の実行ルートを叩く
    const resp = await fetch(`${base}/webhooks/cron/execute?secret=${encodeURIComponent(secret)}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
    });

    const text = await resp.text();
    console.log(`Remix route response: ${resp.status} - ${text}`);
    
    res.status(resp.status).send(text);
  } catch (e) {
    console.error("Vercel Cron error:", e);
    res.status(500).json({ error: String(e?.message ?? e) });
  }
}