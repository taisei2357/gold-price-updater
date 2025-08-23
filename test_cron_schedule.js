// Vercelでの動的Cron時刻設定の確認
import { PrismaClient } from '@prisma/client';

async function checkCronSchedule() {
  const prisma = new PrismaClient();
  
  try {
    // 1) 現在の設定を取得
    const settings = await prisma.shopSetting.findMany({
      select: { shopDomain: true, autoUpdateHour: true, autoUpdateEnabled: true }
    });
    
    console.log('🕐 現在の時刻設定:');
    settings.forEach(s => {
      const jstHour = s.autoUpdateHour;
      const utcHour = (jstHour - 9 + 24) % 24; // JST -> UTC変換
      console.log(`  ${s.shopDomain}: JST ${jstHour}:00 -> UTC ${utcHour}:00`);
      console.log(`  Cron表記: "${0} ${utcHour} * * 1-5"`);
      console.log(`  有効: ${s.autoUpdateEnabled ? 'はい' : 'いいえ'}`);
      console.log('');
    });
    
    // 2) Vercel Cronの制限確認
    console.log('⚠️ Vercel Cronの制限:');
    console.log('- vercel.jsonで静的に定義する必要がある');
    console.log('- 動的な時刻変更は不可');
    console.log('- 解決策: 全時間帯のCronを作成し、DB設定で実際の実行を制御');
    console.log('');
    
    // 3) 推奨の実装方法
    console.log('🔧 推奨の修正方法:');
    console.log('1. vercel.jsonで毎時Cronを設定: "0 * * * 1-5"');
    console.log('2. /api/cronで現在時刻とDB設定を比較');
    console.log('3. 設定時刻と一致する場合のみ価格更新を実行');
    console.log('');
    
    // 4) 現在時刻での実行判定テスト
    const now = new Date();
    const jstNow = new Date(now.getTime() + 9 * 60 * 60 * 1000);
    const currentHour = jstNow.getHours();
    
    console.log(`🕒 現在時刻: JST ${currentHour}:${jstNow.getMinutes().toString().padStart(2, '0')}`);
    
    settings.forEach(s => {
      const shouldRun = s.autoUpdateEnabled && s.autoUpdateHour === currentHour;
      console.log(`  ${s.shopDomain}: ${shouldRun ? '✅ 実行する' : '❌ スキップ'} (設定: ${s.autoUpdateHour}:00)`);
    });
    
  } catch (error) {
    console.error('エラー:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkCronSchedule();