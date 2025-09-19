#!/usr/bin/env node
/**
 * Development Fallback Server
 * Shopify CLIでエラーが発生した場合のフォールバック開発サーバー
 */

import { exec, spawn } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function checkShopifyCLI() {
  try {
    console.log('🔍 Checking Shopify CLI status...');
    const { stdout } = await execAsync('shopify version');
    console.log('✅ Shopify CLI is available:', stdout.trim());
    return true;
  } catch (error) {
    console.log('❌ Shopify CLI error:', error.message);
    return false;
  }
}

async function startServer() {
  console.log('🚀 Starting development server...');
  
  const shopifyOK = await checkShopifyCLI();
  
  if (shopifyOK) {
    console.log('📦 Starting with Shopify CLI...');
    const shopifyProcess = spawn('npm', ['run', 'dev'], { 
      stdio: 'inherit',
      shell: true 
    });
    
    // 5秒後にプロセスが生きているかチェック
    setTimeout(() => {
      if (shopifyProcess.killed) {
        console.log('⚠️ Shopify CLI failed, falling back to Vite...');
        startVite();
      }
    }, 5000);
    
    shopifyProcess.on('error', (error) => {
      console.log('❌ Shopify CLI error:', error.message);
      console.log('🔄 Falling back to Vite server...');
      startVite();
    });
    
    shopifyProcess.on('exit', (code) => {
      if (code !== 0) {
        console.log(`❌ Shopify CLI exited with code ${code}`);
        console.log('🔄 Falling back to Vite server...');
        startVite();
      }
    });
  } else {
    startVite();
  }
}

function startVite() {
  console.log('⚡ Starting Vite development server...');
  console.log('🌐 Server will be available at: http://localhost:3000');
  console.log('⚠️ Note: Shopify app features may be limited without Shopify CLI');
  
  const viteProcess = spawn('npm', ['run', 'vite'], { 
    stdio: 'inherit',
    shell: true 
  });
  
  viteProcess.on('error', (error) => {
    console.error('❌ Failed to start Vite server:', error.message);
    process.exit(1);
  });
}

// SIGINT (Ctrl+C) handling
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down development server...');
  process.exit(0);
});

startServer();