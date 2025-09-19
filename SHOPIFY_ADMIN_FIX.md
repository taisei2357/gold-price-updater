# Shopify Admin 404 Error Fix & Prevention

## Problem Summary
Shopify admin showed "このアドレスにページはありません" (This page does not exist) when accessing the app.

## Root Cause
- App configuration in `shopify.app.toml` pointed to production URL (`https://gold-price-updater-pb8o.vercel.app`)
- Local development needed ngrok tunnel configuration
- Vite server needed to allow ngrok host in `allowedHosts`

## Solution Applied

### 1. Updated App Configuration
Updated `shopify.app.toml` to use ngrok tunnel:
```toml
application_url = "https://91769a9b3fe3.ngrok-free.app"
redirect_urls = ["https://91769a9b3fe3.ngrok-free.app/auth/callback"]
```

### 2. Updated Vite Configuration
Added ngrok host to `vite.config.js`:
```javascript
server: {
  allowedHosts: [host, "candidate-jeremy-fossil-match.trycloudflare.com", "91769a9b3fe3.ngrok-free.app"],
}
```

### 3. Server Configuration
- Vite server running on port 8000
- Ngrok tunnel: `https://91769a9b3fe3.ngrok-free.app` → `localhost:8000`
- Health check endpoint accessible: `/api/health`

### 4. Prevention Measures

#### A. Monitoring Script (`dev-monitor.js`)
- Auto-monitors local server and ngrok tunnel
- Auto-restarts server on failures
- Health check every 30 seconds
- Usage: `node dev-monitor.js`

#### B. Fallback Development Script (`dev-fallback.js`)
- Handles Shopify CLI failures
- Automatic Vite fallback
- Usage: `node dev-fallback.js`

#### C. Error Handler (`app/utils/error-handler.ts`)
- Comprehensive error logging
- Server health monitoring
- Memory and database checks

#### D. Health Check Endpoint (`app/routes/api.health.tsx`)
- Real-time application health status
- Database connectivity check
- Memory usage monitoring
- Error log analysis

## Manual Steps Required

### 1. Shopify Partners Dashboard Update
⚠️ **IMPORTANT**: Must be done manually in browser
1. Go to [Shopify Partners Dashboard](https://partners.shopify.com)
2. Select "アイリスヘルスケアテクノロジー" organization
3. Find "gold-price-updater-2024" app
4. Update App URL to: `https://91769a9b3fe3.ngrok-free.app`
5. Update Redirect URLs to: `https://91769a9b3fe3.ngrok-free.app/auth/callback`

### 2. Ngrok Tunnel Maintenance
If ngrok URL changes, update:
- `shopify.app.toml`
- `vite.config.js` 
- `dev-monitor.js`
- Shopify Partners dashboard

## Commands for Development

### Start Development Server
```bash
# Option 1: Basic Vite
npm run vite -- --port 8000

# Option 2: With monitoring
node dev-monitor.js

# Option 3: Fallback script
node dev-fallback.js
```

### Health Checks
```bash
# Local health
curl http://localhost:8000/api/health

# Ngrok tunnel health
curl -H "ngrok-skip-browser-warning: true" https://91769a9b3fe3.ngrok-free.app/api/health
```

## Production Deployment
When deploying to production, revert `shopify.app.toml`:
```toml
application_url = "https://gold-price-updater-pb8o.vercel.app"
redirect_urls = ["https://gold-price-updater-pb8o.vercel.app/auth/callback"]
```

## Verification
✅ Local server: `http://localhost:8000/api/health`  
✅ Ngrok tunnel: `https://91769a9b3fe3.ngrok-free.app/api/health`  
✅ Vite configuration updated  
✅ Prevention scripts created  
⏳ **Pending**: Shopify Partners dashboard manual update

## Next Steps
1. Manually update Shopify Partners dashboard (required)
2. Test app access through Shopify admin interface  
3. Verify all functionality works through tunnel
4. Monitor with automated scripts