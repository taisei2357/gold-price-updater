// 平日の時刻設定テスト
import { PrismaClient } from '@prisma/client';

async function testWeekdaySchedule() {
  const prisma = new PrismaClient();
  
  try {
    // 現在の日本時間を計算
    const now = new Date();
    const jstNow = new Date(now.getTime() + 9 * 60 * 60 * 1000);
    const currentHour = jstNow.getHours();
    const dayOfWeek = jstNow.getDay(); // 0=日曜, 1=月曜...
    const isWeekday = dayOfWeek >= 1 && dayOfWeek <= 5;
    
    console.log('📅 現在の時刻情報:');
    console.log(`   JST: ${jstNow.toLocaleString('ja-JP', {timeZone: 'Asia/Tokyo'})}`);
    console.log(`   現在時刻: ${currentHour}:00`);
    console.log(`   曜日: ${['日','月','火','水','木','金','土'][dayOfWeek]}曜日`);
    console.log(`   平日: ${isWeekday ? 'はい' : 'いいえ'}\n`);
    
    // ショップの設定を確認
    const shop = await prisma.shopSetting.findUnique({
      where: { shopDomain: 'luxrexor2.myshopify.com' },
      select: { autoUpdateHour: true, autoUpdateEnabled: true }
    });
    
    console.log('⚙️ ショップ設定:');
    console.log(`   設定時刻: JST ${shop.autoUpdateHour}:00`);
    console.log(`   自動更新: ${shop.autoUpdateEnabled ? '有効' : '無効'}\n`);
    
    // 実行判定のシミュレーション
    const timeMatch = shop.autoUpdateHour === currentHour;
    const shouldRun = isWeekday && shop.autoUpdateEnabled && timeMatch;
    
    console.log('🔍 実行判定:');
    console.log(`   時刻一致: ${timeMatch ? '✅' : '❌'} (設定:${shop.autoUpdateHour} vs 現在:${currentHour})`);
    console.log(`   平日チェック: ${isWeekday ? '✅' : '❌'}`);
    console.log(`   自動更新: ${shop.autoUpdateEnabled ? '✅' : '❌'}`);
    console.log(`   → 実行する: ${shouldRun ? '✅ はい' : '❌ いいえ'}\n`);
    
    // 平日の複数時間帯でテスト
    console.log('⏰ 各時刻での実行対象テスト:');
    for (const testHour of [8, 10, 14, 16, 18]) {
      const shops = await prisma.shopSetting.count({
        where: { 
          autoUpdateEnabled: true,
          autoUpdateHour: testHour
        }
      });
      
      console.log(`   JST ${testHour}:00 → ${shops}件のショップが対象`);
    }
    
    console.log('\n✅ 時刻設定テスト完了');
    
  } catch (error) {
    console.error('❌ エラー:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testWeekdaySchedule();