// app/routes/api.test-cron.ts - 冗長cron実行テスト用エンドポイント
import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";

export const loader: LoaderFunction = async ({ request }) => {
  // Basic auth check
  const authHeader = request.headers.get('authorization');
  const expected = process.env.CRON_SECRET;
  
  if (!expected || authHeader !== `Bearer ${expected}`) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // 通常のcron APIを呼び出し
    const cronUrl = new URL('/api/cron', request.url);
    const cronRequest = new Request(cronUrl.toString(), {
      method: 'GET',
      headers: {
        'authorization': authHeader,
        'x-vercel-cron': '1', // Vercel cronとして識別
      }
    });

    // 内部でcron APIを呼び出し
    const { loader: cronLoader } = await import('./api.cron');
    const result = await cronLoader({ 
      request: cronRequest, 
      params: {}, 
      context: {} 
    });

    const cronResponse = await result.json();

    return json({
      testInfo: {
        timestamp: new Date().toISOString(),
        jstTime: new Date(Date.now() + 9 * 60 * 60 * 1000).toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' }),
        userAgent: request.headers.get('user-agent'),
        source: 'test-endpoint'
      },
      cronResult: cronResponse
    });

  } catch (error) {
    console.error('Test cron execution error:', error);
    return json({ 
      error: (error as Error).message,
      timestamp: new Date().toISOString() 
    }, { status: 500 });
  }
};