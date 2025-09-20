#!/usr/bin/env node
/**
 * Shopify Store Apps Checker
 * ストアにインストールされているアプリの一覧を確認
 */

const fs = require('fs');
const https = require('https');

console.log('🔍 Shopify Store Apps Configuration Check\n');

// 基本情報
const STORE = 'luxrexor2';
const EXPECTED_APP_URL = 'https://gold-price-updater-pb8o.vercel.app';
const PROBLEMATIC_URL = 'boolean-paul-instructor-anchor.trycloudflare.com';

console.log(`Target Store: ${STORE}.myshopify.com`);
console.log(`Expected App URL: ${EXPECTED_APP_URL}`);
console.log(`Problematic URL: ${PROBLEMATIC_URL}\n`);

// shopify.app.toml の内容確認
try {
  const tomlContent = fs.readFileSync('./shopify.app.toml', 'utf8');
  console.log('📋 Current shopify.app.toml configuration:');
  
  const appUrlMatch = tomlContent.match(/application_url\s*=\s*"([^"]+)"/);
  const redirectMatch = tomlContent.match(/redirect_urls\s*=\s*\[\s*"([^"]+)"\s*\]/);
  
  if (appUrlMatch) {
    const appUrl = appUrlMatch[1];
    console.log(`  Application URL: ${appUrl}`);
    if (appUrl === EXPECTED_APP_URL) {
      console.log('  ✅ Correct production URL');
    } else if (appUrl.includes('trycloudflare')) {
      console.log('  ❌ Still using development tunnel URL');
    } else {
      console.log('  ⚠️  Different URL detected');
    }
  }
  
  if (redirectMatch) {
    const redirectUrl = redirectMatch[1];
    console.log(`  Redirect URL: ${redirectUrl}`);
    if (redirectUrl.startsWith(EXPECTED_APP_URL)) {
      console.log('  ✅ Correct redirect URL');
    } else {
      console.log('  ❌ Incorrect redirect URL');
    }
  }
  
} catch (error) {
  console.log('❌ Could not read shopify.app.toml');
}

console.log('\n📱 Manual Actions Required:');
console.log('1. Go to Shopify Admin: https://admin.shopify.com/store/luxrexor2/settings/apps');
console.log('2. Check if there are multiple "gold-price-updater" apps installed');
console.log('3. Uninstall any development/tunnel-based apps');
console.log('4. Keep only the production app from Partners Dashboard');
console.log('\n5. Go to Partners Dashboard: https://partners.shopify.com');
console.log('6. Ensure App URL is set to:', EXPECTED_APP_URL);
console.log('7. Ensure Redirect URL is set to:', EXPECTED_APP_URL + '/auth/callback');

console.log('\n🔄 Reinstall URL (if needed):');
console.log(`https://gold-price-updater-pb8o.vercel.app/api/auth?shop=${STORE}.myshopify.com`);

console.log('\n🎯 Expected Result:');
console.log('After these steps, clicking the app in Shopify Admin should go directly to:');
console.log(EXPECTED_APP_URL);
console.log('NOT to any trycloudflare.com URL');

// 環境確認
console.log('\n🔧 Current Environment Check:');
console.log(`Node.js: ${process.version}`);
console.log(`Current Directory: ${process.cwd()}`);
console.log(`Timestamp: ${new Date().toISOString()}`);