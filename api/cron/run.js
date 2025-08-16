export default async function handler(req, res) {
  try {
    const base = (process.env.APP_URL ?? `https://${req.headers.host}`).replace(/\/$/, "");
    const secret = process.env.CRON_SECRET;
    if (!secret) return res.status(500).json({ error: "CRON_SECRET missing" });

    const resp = await fetch(`${base}/webhooks/cron/execute?secret=${encodeURIComponent(secret)}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
    });

    const text = await resp.text();
    res.status(resp.status).send(text);
  } catch (e) {
    res.status(500).json({ error: String(e?.message ?? e) });
  }
}