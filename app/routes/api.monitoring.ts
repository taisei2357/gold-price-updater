// app/routes/api.monitoring.ts - 死活監視API
import type { LoaderFunction, ActionFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { runMonitoringCheck, checkSystemHealth } from '../utils/monitoring.server';
import { sendTestMonitoringAlert } from '../utils/email.server';

// 認証チェック（監視用の軽い認証）
function verifyMonitoringAuth(request: Request) {
  const expected = process.env.MONITORING_SECRET || process.env.CRON_SECRET;
  if (!expected) return null; // 認証無効時は通す（開発時）

  const authHeader = request.headers.get('authorization') || '';
  const got = authHeader.replace('Bearer ', '');
  
  if (got !== expected) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  return null;
}

// GET: システムヘルスチェック（外部監視ツール用）
export const loader: LoaderFunction = async ({ request }) => {
  const deny = verifyMonitoringAuth(request);
  if (deny) return deny;

  try {
    const url = new URL(request.url);
    const action = url.searchParams.get('action') || 'status';

    switch (action) {
      case 'status':
        // シンプルなヘルスチェック
        const status = await checkSystemHealth();
        return json({
          healthy: status.isHealthy,
          systemStatus: status.systemStatus,
          lastCheck: new Date().toISOString(),
          issues: status.issues,
          lastSuccessfulExecution: status.lastSuccessfulExecution,
          recentFailures: status.recentFailures
        });

      case 'detailed':
        // 詳細な監視結果
        const detailedResult = await runMonitoringCheck();
        return json({
          ...detailedResult,
          timestamp: new Date().toISOString()
        });

      case 'ping':
        // 軽量なpingチェック（監視ツール用）
        return json({ 
          status: 'ok', 
          timestamp: new Date().toISOString(),
          uptime: process.uptime()
        });

      default:
        return json({ error: 'Invalid action' }, { status: 400 });
    }

  } catch (error) {
    console.error('監視APIエラー:', error);
    return json({
      healthy: false,
      error: (error as Error).message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
};

// POST: 手動監視実行・テスト
export const action: ActionFunction = async ({ request }) => {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }
  
  const deny = verifyMonitoringAuth(request);
  if (deny) return deny;

  try {
    const body = await request.json().catch(() => ({}));
    const action = body.action || 'check';

    switch (action) {
      case 'check':
        // 手動監視チェック実行
        console.log('📋 手動監視チェック実行');
        const result = await runMonitoringCheck();
        return json({
          message: '監視チェック実行完了',
          ...result,
          timestamp: new Date().toISOString()
        });

      case 'test_alert':
        // テストアラート送信
        const alertType = body.alertType || 'MISSED_EXECUTION';
        console.log(`📧 テストアラート送信: ${alertType}`);
        
        const testResult = await sendTestMonitoringAlert(alertType);
        return json({
          message: `テストアラート送信: ${alertType}`,
          success: testResult.success,
          error: testResult.error,
          timestamp: new Date().toISOString()
        });

      case 'force_check':
        // 強制監視チェック（重複アラート防止を無視）
        console.log('🔔 強制監視チェック実行');
        const forceResult = await checkSystemHealth();
        
        if (!forceResult.isHealthy) {
          const { sendMonitoringAlert } = await import('../utils/email.server');
          const alertResult = await sendMonitoringAlert({
            alertType: 'SYSTEM_ERROR',
            timestamp: new Date().toISOString(),
            details: forceResult.issues.join(', '),
            lastSuccessfulExecution: forceResult.lastSuccessfulExecution,
            errorMessage: '手動強制チェックによる検知'
          });
          
          return json({
            message: '強制監視チェック完了 - アラート送信',
            healthStatus: forceResult,
            alertSent: true,
            alertResult,
            timestamp: new Date().toISOString()
          });
        }

        return json({
          message: '強制監視チェック完了 - 問題なし',
          healthStatus: forceResult,
          alertSent: false,
          timestamp: new Date().toISOString()
        });

      default:
        return json({ error: 'Invalid action' }, { status: 400 });
    }

  } catch (error) {
    console.error('監視API POST エラー:', error);
    return json({
      error: (error as Error).message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
};