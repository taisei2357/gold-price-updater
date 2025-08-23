// 動的時刻設定のテスト
import { PrismaClient } from '@prisma/client';

async function testDynamicSchedule() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🧪 動的時刻設定のテスト\n');
    
    const shopDomain = "luxrexor2.myshopify.com";
    const currentHour = new Date(Date.now() + 9 * 60 * 60 * 1000).getHours();
    
    console.log(`現在時刻: JST ${currentHour}:00\n`);
    
    // 1. 現在の設定を確認
    let setting = await prisma.shopSetting.findUnique({
      where: { shopDomain },
      select: { autoUpdateHour: true, autoUpdateEnabled: true }
    });
    
    console.log('1️⃣ 現在の設定:');
    console.log(`   設定時刻: JST ${setting.autoUpdateHour}:00`);
    console.log(`   自動更新: ${setting.autoUpdateEnabled ? '有効' : '無効'}\n`);
    
    // 2. 現在時刻で実行されるかテスト
    const shouldRun = setting.autoUpdateEnabled && setting.autoUpdateHour === currentHour;
    console.log('2️⃣ 現在時刻での実行判定:');
    console.log(`   実行する: ${shouldRun ? '✅ はい' : '❌ いいえ'}\n`);
    
    // 3. 異なる時刻に変更してテスト
    const testHour = (currentHour + 1) % 24;
    console.log(`3️⃣ 時刻を ${testHour}:00 に変更してテスト:`);
    
    await prisma.shopSetting.update({
      where: { shopDomain },
      data: { autoUpdateHour: testHour }
    });
    
    // 4. 各時刻での実行対象をチェック
    console.log('4️⃣ 各時刻での実行対象チェック:');
    
    for (const hour of [currentHour, testHour]) {
      const shops = await prisma.shopSetting.findMany({
        where: { 
          autoUpdateEnabled: true,
          autoUpdateHour: hour
        },
        select: { shopDomain: true, autoUpdateHour: true }
      });
      
      console.log(`   JST ${hour}:00 - ${shops.length}件のショップが対象`);
      shops.forEach(s => console.log(`     • ${s.shopDomain} (${s.autoUpdateHour}:00)`));
    }
    
    // 5. 元の設定に戻す
    await prisma.shopSetting.update({
      where: { shopDomain },
      data: { autoUpdateHour: 10 } // デフォルトの10時に戻す
    });
    
    console.log('\n✅ テスト完了: 設定を元に戻しました (JST 10:00)');
    
  } catch (error) {
    console.error('❌ エラー:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testDynamicSchedule();