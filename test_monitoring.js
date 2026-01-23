import { runMonitoringCheck, checkSystemHealth } from './app/utils/monitoring.server.ts';
import { sendTestMonitoringAlert } from './app/utils/email.server.ts';

async function testMonitoringSystem() {
  try {
    console.log('🧪 監視システムテスト開始');
    console.log('=' * 50);

    // 1. システムヘルスチェック
    console.log('\n🔍 システムヘルスチェックテスト');
    const healthStatus = await checkSystemHealth();
    console.log('📊 ヘルス結果:');
    console.log(`   健全性: ${healthStatus.isHealthy ? '✅ 正常' : '❌ 異常'}`);
    console.log(`   システム状態: ${healthStatus.systemStatus}`);
    console.log(`   問題点: ${healthStatus.issues.length}件`);
    healthStatus.issues.forEach(issue => console.log(`     - ${issue}`));
    console.log(`   最終成功実行: ${healthStatus.lastSuccessfulExecution ? new Date(healthStatus.lastSuccessfulExecution).toLocaleString('ja-JP') : '不明'}`);
    console.log(`   最近の失敗数: ${healthStatus.recentFailures}`);

    // 2. 完全な監視チェック
    console.log('\n🔔 完全監視チェックテスト');
    const monitoringResult = await runMonitoringCheck();
    console.log('📧 監視結果:');
    console.log(`   アラート送信: ${monitoringResult.alertSent ? '✅ 送信済み' : '⏭️ 送信なし'}`);
    if (monitoringResult.alertResult) {
      console.log(`   メール送信成功: ${monitoringResult.alertResult.success ? '✅' : '❌'}`);
      if (monitoringResult.alertResult.error) {
        console.log(`   エラー: ${monitoringResult.alertResult.error}`);
      }
    }

    // 3. テストアラート送信
    console.log('\n📧 テストアラート送信');
    
    const alertTypes = ['MISSED_EXECUTION', 'UPDATE_FAILURE', 'SYSTEM_ERROR'];
    for (const alertType of alertTypes) {
      console.log(`\n   テスト: ${alertType}`);
      const testResult = await sendTestMonitoringAlert(alertType);
      console.log(`   送信結果: ${testResult.success ? '✅ 成功' : '❌ 失敗'}`);
      if (testResult.error) {
        console.log(`   エラー: ${testResult.error}`);
      }
      
      // メール送信制限対策で少し待機
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log('\n✅ 監視システムテスト完了');

  } catch (error) {
    console.error('❌ 監視システムテストエラー:', error);
  }
}

testMonitoringSystem();