/**
 * Debug Environment Variables
 * 本番環境でのSHOPIFY_APP_URL等を確認するデバッグエンドポイント
 */

import { json } from "@remix-run/node";
import type { LoaderFunction } from "@remix-run/node";

export const loader: LoaderFunction = async ({ request }) => {
  // 本番環境でのみ動作（セキュリティ上の理由）
  const host = request.headers.get('host');
  const isProduction = host?.includes('vercel.app') || host?.includes('gold-price-updater');
  
  if (!isProduction) {
    return json({ error: 'Debug endpoint only available in production' }, { status: 403 });
  }

  const debugInfo = {
    timestamp: new Date().toISOString(),
    host: host,
    forwardedHost: request.headers.get('x-forwarded-host'),
    userAgent: request.headers.get('user-agent'),
    env: {
      NODE_ENV: process.env.NODE_ENV,
      SHOPIFY_APP_URL: process.env.SHOPIFY_APP_URL,
      APP_URL: process.env.APP_URL,
      PUBLIC_APP_URL: process.env.PUBLIC_APP_URL,
      NEXT_PUBLIC_SHOPIFY_APP_URL: process.env.NEXT_PUBLIC_SHOPIFY_APP_URL,
      VERCEL_URL: process.env.VERCEL_URL,
      VERCEL_GIT_COMMIT_SHA: process.env.VERCEL_GIT_COMMIT_SHA
    },
    headers: {
      host: request.headers.get('host'),
      origin: request.headers.get('origin'),
      referer: request.headers.get('referer'),
      'x-forwarded-for': request.headers.get('x-forwarded-for'),
      'x-forwarded-proto': request.headers.get('x-forwarded-proto')
    }
  };

  return json(debugInfo, {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store, no-cache, must-revalidate'
    }
  });
};