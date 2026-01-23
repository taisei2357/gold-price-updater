// app/utils/monitoring.server.ts - 価格更新システムの死活監視ロジック
import prisma from '../db.server';
import { sendMonitoringAlert, type MonitoringAlertData } from './email.server';
import { isJapanHolidayJST } from '../models/scheduler.server';

export interface MonitoringStatus {
  isHealthy: boolean;
  issues: string[];
  lastSuccessfulExecution?: string;
  missedExecutions: number;
  recentFailures: number;
  systemStatus: 'OK' | 'WARNING' | 'CRITICAL';
}

/**
 * メイン監視チェック関数
 * 営業日に価格更新が実行されているかをチェック
 */
export async function checkSystemHealth(): Promise<MonitoringStatus> {
  const now = new Date();
  const jstNow = new Date(now.getTime() + 9 * 60 * 60 * 1000); // JSTに調整
  const issues: string[] = [];
  let systemStatus: 'OK' | 'WARNING' | 'CRITICAL' = 'OK';
  
  try {
    console.log('🔍 死活監視チェック開始:', jstNow.toISOString());

    // 1. 営業日チェック（土日・祝日は監視しない）
    const dayOfWeek = jstNow.getDay(); // 0=日曜, 6=土曜
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const isHoliday = isJapanHolidayJST(jstNow);

    if (isWeekend || isHoliday) {
      console.log('📅 土日・祝日のため監視をスキップ');
      return {
        isHealthy: true,
        issues: ['土日・祝日のため監視対象外'],
        systemStatus: 'OK',
        missedExecutions: 0,
        recentFailures: 0
      };
    }

    // 2. 今日の成功実行チェック
    const todayJST = jstNow.toISOString().split('T')[0]; // YYYY-MM-DD
    const todayStart = new Date(`${todayJST}T00:00:00.000Z`);
    const todayEnd = new Date(`${todayJST}T23:59:59.999Z`);

    const todaySuccessfulExecution = await prisma.priceUpdateLog.findFirst({
      where: {
        success: true,
        executionType: 'cron',
        executedAt: {
          gte: todayStart,
          lte: todayEnd
        }
      },
      orderBy: { executedAt: 'desc' }
    });

    // 3. 最終成功実行時刻を取得
    const lastSuccessfulExecution = await prisma.priceUpdateLog.findFirst({
      where: {
        success: true,
        executionType: 'cron'
      },
      orderBy: { executedAt: 'desc' }
    });

    // 4. 実行漏れチェック（平日の午後2時以降に今日の成功実行がない場合）
    const currentHour = jstNow.getHours();
    const isMissedExecution = currentHour >= 14 && !todaySuccessfulExecution;

    if (isMissedExecution) {
      issues.push('今日の価格更新が実行されていません');
      systemStatus = 'CRITICAL';
    }

    // 5. 過去3日間の失敗率チェック
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
    const recentLogs = await prisma.priceUpdateLog.findMany({
      where: {
        executionType: 'cron',
        executedAt: { gte: threeDaysAgo }
      },
      orderBy: { executedAt: 'desc' }
    });

    const recentFailures = recentLogs.filter(log => !log.success).length;
    const recentTotal = recentLogs.length;
    const failureRate = recentTotal > 0 ? recentFailures / recentTotal : 0;

    if (failureRate > 0.5) {
      issues.push(`過去3日間の失敗率が高い: ${(failureRate * 100).toFixed(1)}%`);
      if (systemStatus !== 'CRITICAL') systemStatus = 'WARNING';
    }

    // 6. 連続失敗チェック
    const last5Executions = await prisma.priceUpdateLog.findMany({
      where: { executionType: 'cron' },
      orderBy: { executedAt: 'desc' },
      take: 5
    });

    const consecutiveFailures = last5Executions.findIndex(log => log.success);
    if (consecutiveFailures === -1 && last5Executions.length >= 3) {
      issues.push('連続して失敗しています');
      systemStatus = 'CRITICAL';
    }

    // 7. 古い成功実行チェック（2日以上成功実行がない場合）
    if (lastSuccessfulExecution) {
      const daysSinceSuccess = (now.getTime() - lastSuccessfulExecution.executedAt.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceSuccess > 2) {
        issues.push(`最終成功実行から${daysSinceSuccess.toFixed(1)}日経過`);
        systemStatus = 'CRITICAL';
      }
    }

    const result: MonitoringStatus = {
      isHealthy: issues.length === 0,
      issues,
      lastSuccessfulExecution: lastSuccessfulExecution?.executedAt.toISOString(),
      missedExecutions: isMissedExecution ? 1 : 0,
      recentFailures,
      systemStatus
    };

    console.log('🔍 死活監視結果:', result);
    return result;

  } catch (error) {
    console.error('🚨 死活監視チェックエラー:', error);
    
    return {
      isHealthy: false,
      issues: [`監視システムエラー: ${(error as Error).message}`],
      systemStatus: 'CRITICAL',
      missedExecutions: 0,
      recentFailures: 0
    };
  }
}

/**
 * 監視チェックを実行し、問題があればアラートメールを送信
 */
export async function runMonitoringCheck(): Promise<{
  status: MonitoringStatus;
  alertSent: boolean;
  alertResult?: any;
}> {
  
  console.log('🔔 監視チェック実行開始');
  
  try {
    const status = await checkSystemHealth();

    // アラート送信判定
    let alertSent = false;
    let alertResult;

    if (!status.isHealthy) {
      console.log('⚠️ システムに問題を検知、アラートメール送信');

      // アラートタイプを決定
      let alertType: MonitoringAlertData['alertType'] = 'UPDATE_FAILURE';
      if (status.issues.some(issue => issue.includes('実行されていません'))) {
        alertType = 'MISSED_EXECUTION';
      } else if (status.systemStatus === 'CRITICAL') {
        alertType = 'SYSTEM_ERROR';
      }

      const alertData: MonitoringAlertData = {
        alertType,
        timestamp: new Date().toISOString(),
        lastSuccessfulExecution: status.lastSuccessfulExecution,
        details: status.issues.join(', '),
        errorMessage: status.systemStatus === 'CRITICAL' ? status.issues[0] : undefined
      };

      // 重複アラート防止（同じ日に同じタイプのアラートを送信済みかチェック）
      if (!(await isDuplicateAlert(alertType))) {
        alertResult = await sendMonitoringAlert(alertData);
        alertSent = true;
        
        // アラート送信履歴を記録
        await recordAlertHistory(alertType, alertResult.success);
      } else {
        console.log('📧 今日は既に同タイプのアラートを送信済み');
      }
    }

    return {
      status,
      alertSent,
      alertResult
    };

  } catch (error) {
    console.error('🚨 監視チェック実行エラー:', error);

    // 監視システム自体のエラーは緊急アラート
    const alertData: MonitoringAlertData = {
      alertType: 'SYSTEM_ERROR',
      timestamp: new Date().toISOString(),
      errorMessage: `監視システムエラー: ${(error as Error).message}`,
      details: '監視システム自体に問題が発生しています'
    };

    const alertResult = await sendMonitoringAlert(alertData);
    
    return {
      status: {
        isHealthy: false,
        issues: [`監視システムエラー: ${(error as Error).message}`],
        systemStatus: 'CRITICAL',
        missedExecutions: 0,
        recentFailures: 0
      },
      alertSent: true,
      alertResult
    };
  }
}

// 重複アラート防止のための履歴チェック
async function isDuplicateAlert(alertType: MonitoringAlertData['alertType']): Promise<boolean> {
  try {
    // 今日の日付を取得（JST）
    const now = new Date();
    const jstNow = new Date(now.getTime() + 9 * 60 * 60 * 1000);
    const todayJST = jstNow.toISOString().split('T')[0];
    const todayStart = new Date(`${todayJST}T00:00:00.000Z`);
    const todayEnd = new Date(`${todayJST}T23:59:59.999Z`);

    const existingAlert = await prisma.monitoringAlert.findFirst({
      where: {
        alertType,
        createdAt: {
          gte: todayStart,
          lte: todayEnd
        }
      }
    });

    return !!existingAlert;
  } catch (error) {
    console.error('重複チェックエラー:', error);
    return false; // エラー時は送信を許可
  }
}

// アラート送信履歴を記録
async function recordAlertHistory(alertType: MonitoringAlertData['alertType'], success: boolean): Promise<void> {
  try {
    await prisma.monitoringAlert.create({
      data: {
        alertType,
        success,
        sentAt: new Date()
      }
    });
  } catch (error) {
    console.error('アラート履歴記録エラー:', error);
    // 履歴記録の失敗は監視には影響させない
  }
}