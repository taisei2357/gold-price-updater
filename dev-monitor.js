#!/usr/bin/env node
/**
 * Development Server Monitor and Auto-Restart
 * 開発サーバーの監視と自動再起動スクリプト
 * 
 * Features:
 * - Monitors local development server on port 8000
 * - Monitors ngrok tunnel accessibility
 * - Auto-restart on failures
 * - Health check notifications
 */

const { spawn } = require('child_process');
const http = require('http');
const https = require('https');

const CONFIG = {
  LOCAL_PORT: 8000,
  NGROK_URL: 'https://91769a9b3fe3.ngrok-free.app',
  CHECK_INTERVAL: 30000, // 30 seconds
  RESTART_DELAY: 5000,   // 5 seconds
  MAX_RESTART_ATTEMPTS: 3
};

let viteProcess = null;
let restartAttempts = 0;

// Health check functions
async function checkLocalServer() {
  return new Promise((resolve) => {
    const req = http.get(`http://localhost:${CONFIG.LOCAL_PORT}/api/health`, (res) => {
      resolve(res.statusCode === 200 || res.statusCode === 503);
    });
    req.on('error', () => resolve(false));
    req.setTimeout(5000, () => {
      req.destroy();
      resolve(false);
    });
  });
}

async function checkNgrokTunnel() {
  return new Promise((resolve) => {
    const req = https.get(`${CONFIG.NGROK_URL}/api/health`, {
      headers: { 'ngrok-skip-browser-warning': 'true' }
    }, (res) => {
      resolve(res.statusCode === 200 || res.statusCode === 503);
    });
    req.on('error', () => resolve(false));
    req.setTimeout(10000, () => {
      req.destroy();
      resolve(false);
    });
  });
}

// Server management
function startViteServer() {
  if (viteProcess) {
    console.log('🔄 Killing existing Vite process...');
    viteProcess.kill();
  }

  console.log('🚀 Starting Vite development server...');
  viteProcess = spawn('npm', ['run', 'vite', '--', '--port', CONFIG.LOCAL_PORT], {
    stdio: 'pipe',
    shell: true
  });

  viteProcess.stdout.on('data', (data) => {
    console.log('📦 [Vite]:', data.toString().trim());
  });

  viteProcess.stderr.on('data', (data) => {
    console.error('❌ [Vite Error]:', data.toString().trim());
  });

  viteProcess.on('exit', (code) => {
    console.log(`⚠️ Vite process exited with code ${code}`);
    viteProcess = null;
  });
}

async function performHealthCheck() {
  const timestamp = new Date().toLocaleTimeString('ja-JP');
  console.log(`\n🔍 [${timestamp}] Performing health check...`);

  const localOK = await checkLocalServer();
  const ngrokOK = await checkNgrokTunnel();

  console.log(`   Local server (port ${CONFIG.LOCAL_PORT}): ${localOK ? '✅ Healthy' : '❌ Down'}`);
  console.log(`   Ngrok tunnel: ${ngrokOK ? '✅ Accessible' : '❌ Blocked'}`);

  if (!localOK && restartAttempts < CONFIG.MAX_RESTART_ATTEMPTS) {
    restartAttempts++;
    console.log(`🔄 Local server down. Restarting... (Attempt ${restartAttempts}/${CONFIG.MAX_RESTART_ATTEMPTS})`);
    
    setTimeout(() => {
      startViteServer();
    }, CONFIG.RESTART_DELAY);
  } else if (localOK) {
    restartAttempts = 0; // Reset counter on successful check
  }

  if (!ngrokOK) {
    console.log('⚠️ Ngrok tunnel inaccessible. Check tunnel status manually.');
    console.log('   Command: ngrok http 8000');
  }
}

// Signal handlers
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down monitor...');
  if (viteProcess) {
    viteProcess.kill();
  }
  process.exit(0);
});

// Initialize
console.log('🎯 Development Server Monitor Starting...');
console.log(`   Local port: ${CONFIG.LOCAL_PORT}`);
console.log(`   Ngrok URL: ${CONFIG.NGROK_URL}`);
console.log(`   Check interval: ${CONFIG.CHECK_INTERVAL/1000}s\n`);

// Start server and begin monitoring
startViteServer();
setInterval(performHealthCheck, CONFIG.CHECK_INTERVAL);

// Initial health check after a brief delay
setTimeout(performHealthCheck, 10000);