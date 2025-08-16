import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const base = (process.env.APP_URL ?? `https://${req.headers.host}`).replace(/\/$/, "");
    const secret = process.env.CRON_SECRET!;
    
    console.log(`Vercel Cron triggered: ${new Date().toISOString()}`);
    
    // 無限ループを回避: 異なるパスでRemixルートを呼び出す
    // /api/cron/price-update (Serverless Function) → /webhooks/cron/execute (Remix Route)
    const targetUrl = `${base}/webhooks/cron/execute?secret=${secret}`;
    console.log(`Target URL: ${targetUrl}`);
    
    const response = await fetch(targetUrl, {
      method: "POST",
      headers: { 
        "content-type": "application/json",
        "user-agent": "vercel-cron/1.0",
        "x-vercel-cron": "true"
      },
    });
    
    const text = await response.text();
    
    console.log(`Remix route response: ${response.status} - ${text}`);
    
    // Remixルートのレスポンスをそのまま返す
    res.status(response.status).send(text);
  } catch (error: any) {
    console.error("Vercel Cron error:", error);
    res.status(500).json({ 
      error: "Internal server error",
      message: String(error?.message ?? error),
      timestamp: new Date().toISOString()
    });
  }
}