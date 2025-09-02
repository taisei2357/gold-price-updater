import type { LoaderFunction } from "@remix-run/node";

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const params = Object.fromEntries(url.searchParams.entries());
  
  const html = `
    <h1>NextEngine Callback</h1>
    <p>クエリを受信しました。値を控えてください。</p>
    <pre>${JSON.stringify(params, null, 2)}</pre>
  `;
  return new Response(html, { headers: { "content-type": "text/html; charset=utf-8" }});
};