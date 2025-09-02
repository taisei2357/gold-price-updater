import { json, type LoaderFunction } from "@remix-run/node";

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const uid = url.searchParams.get("uid");
  const state = url.searchParams.get("state");
  const code = url.searchParams.get("code");

  // Health check
  if (url.searchParams.has("health")) {
    return json({ ok: true, path: url.pathname });
  }

  // Step 1: UID received → get access token directly
  if (uid && state) {
    try {
      // NextEngine token API
      const tokenRes = await fetch("https://api.next-engine.org/api_neauth", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          uid,
          state,
          client_id: process.env.NE_CLIENT_ID!,
          client_secret: process.env.NE_CLIENT_SECRET!,
        }),
      });

      const tokens = await tokenRes.json();
      
      if (tokens.access_token) {
        const html = `
          <h1>NextEngine 認証成功</h1>
          <p>トークンを取得しました。以下の値をconfig.jsonに保存してください：</p>
          <pre>
{
  "access_token": "${tokens.access_token}",
  "refresh_token": "${tokens.refresh_token || 'なし'}",
  "expires_in": ${tokens.expires_in || 'なし'}
}
          </pre>
          <p><strong>config.jsonのaccess_tokenとrefresh_tokenを上記の値で更新してください。</strong></p>
        `;
        return new Response(html, { headers: { "content-type": "text/html; charset=utf-8" }});
      } else {
        return json({ error: "token_exchange_failed", response: tokens }, { status: 400 });
      }
    } catch (error) {
      return json({ error: "api_call_failed", message: String(error) }, { status: 500 });
    }
  }

  // No uid/code
  return json({ error: "missing_uid_or_code", received: Object.fromEntries(url.searchParams.entries()) }, { status: 400 });
};