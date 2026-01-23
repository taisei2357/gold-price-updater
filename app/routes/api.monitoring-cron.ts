// app/routes/api.monitoring-cron.ts - 定期監視チェック用Cron
import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { runMonitoringCheck } from '../utils/monitoring.server';

// CRON認証チェック（Vercel Cron対応）
function verifyCronAuth(request: Request) {
  // Vercel Cron からの実行は x-vercel-cron ヘッダーが付く
  const fromVercelCron = request.headers.get('x-vercel-cron') === '1';
  if (fromVercelCron) return null; // 許可

  // 手動実行や外部から叩く場合だけ Bearer チェック
  const expected = process.env.MONITORING_SECRET || process.env.CRON_SECRET;
  if (!expected) return null;

  const got = request.headers.get('authorization') || '';
  if (got === `Bearer ${expected}`) return null;

  return json({ error: 'Unauthorized' }, { status: 401 });
}

// 定期監視チェック（Vercel Cronで実行）
export const loader: LoaderFunction = async ({ request }) => {
  const deny = verifyCronAuth(request);
  if (deny) return deny;
  
  try {
    console.log(`🔔 定期監視チェック開始: ${new Date().toISOString()}`);
    
    const result = await runMonitoringCheck();
    
    console.log(`🔔 定期監視チェック完了: ${result.status.isHealthy ? '正常' : '異常検知'}`);
    if (result.alertSent) {
      console.log('📧 アラートメール送信済み');
    }

    return json({
      message: "定期監視チェック完了",
      timestamp: new Date().toISOString(),
      healthy: result.status.isHealthy,
      systemStatus: result.status.systemStatus,
      issuesDetected: result.status.issues.length,
      alertSent: result.alertSent,
      issues: result.status.issues
    }, { 
      headers: { "Cache-Control": "no-store" } 
    });

  } catch (error) {
    console.error('定期監視チェックエラー:', error);
    
    // 監視システム自体のエラーは緊急アラート
    try {
      const { sendMonitoringAlert } = await import('../utils/email.server');
      await sendMonitoringAlert({
        alertType: 'SYSTEM_ERROR',
        timestamp: new Date().toISOString(),
        errorMessage: `定期監視チェックエラー: ${(error as Error).message}`,
        details: '定期監視システムでエラーが発生しました'
      });
    } catch (alertError) {
      console.error('緊急アラート送信も失敗:', alertError);
    }
    
    return json({
      error: (error as Error).message,
      timestamp: new Date().toISOString(),
      healthy: false,
      systemStatus: 'CRITICAL'
    }, { status: 500 });
  }
};