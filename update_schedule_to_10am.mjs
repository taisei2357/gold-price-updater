#!/usr/bin/env node
// 自動更新時刻をJST 10:00に変更するスクリプト

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateScheduleTo10AM() {
  try {
    console.log('🕙 自動更新時刻をJST 10:00に変更中...');
    
    // 現在の設定を確認
    console.log('\n📊 変更前の設定:');
    const currentSettings = await prisma.shopSetting.findMany();
    currentSettings.forEach(shop => {
      console.log(`- ${shop.shopDomain}: JST ${shop.autoUpdateHour}:00`);
    });
    
    // 全ショップを10時に変更
    const result = await prisma.shopSetting.updateMany({
      data: {
        autoUpdateHour: 10
      }
    });
    
    console.log(`\n✅ ${result.count}件のショップ設定を更新しました`);
    
    // 変更後の設定を確認
    console.log('\n📊 変更後の設定:');
    const updatedSettings = await prisma.shopSetting.findMany();
    updatedSettings.forEach(shop => {
      console.log(`- ${shop.shopDomain}: JST ${shop.autoUpdateHour}:00`);
    });
    
    console.log('\n🎯 次回実行時刻: 毎日JST 10:00（平日のみ）');
    console.log('📍 Vercel Cronで自動実行されます');
    
  } catch (error) {
    console.error('❌ エラーが発生しました:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateScheduleTo10AM();