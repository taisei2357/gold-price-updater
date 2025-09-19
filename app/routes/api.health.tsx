/**
 * Health Check Endpoint
 * アプリケーションの健全性チェック
 */

import { json } from "@remix-run/node";
import type { LoaderFunction } from "@remix-run/node";
import prisma from "../db.server";
import { AppErrorHandler } from "../utils/error-handler";

export const loader: LoaderFunction = async ({ request }) => {
  const startTime = Date.now();
  const checks: any = {};
  
  try {
    // Database connectivity check
    try {
      await prisma.$queryRaw`SELECT 1`;
      checks.database = { status: 'healthy', latency: `${Date.now() - startTime}ms` };
    } catch (dbError) {
      checks.database = { status: 'unhealthy', error: (dbError as Error).message };
    }
    
    // Memory usage check
    const memUsage = process.memoryUsage();
    checks.memory = {
      status: memUsage.heapUsed < 500 * 1024 * 1024 ? 'healthy' : 'warning', // 500MB threshold
      usage: {
        heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
        heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`,
        rss: `${Math.round(memUsage.rss / 1024 / 1024)}MB`
      }
    };
    
    // Error logs check
    const recentErrors = AppErrorHandler.getRecentLogs(10).filter(log => log.level === 'error');
    checks.errorLogs = {
      status: recentErrors.length === 0 ? 'healthy' : recentErrors.length < 5 ? 'warning' : 'unhealthy',
      recentErrors: recentErrors.length,
      lastError: recentErrors[0]?.timestamp
    };
    
    // Environment check
    const requiredEnvVars = ['DATABASE_URL', 'SHOPIFY_API_KEY', 'SHOPIFY_API_SECRET'];
    const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
    checks.environment = {
      status: missingEnvVars.length === 0 ? 'healthy' : 'unhealthy',
      missingVars: missingEnvVars
    };
    
    // Overall status
    const hasUnhealthy = Object.values(checks).some((check: any) => check.status === 'unhealthy');
    const hasWarning = Object.values(checks).some((check: any) => check.status === 'warning');
    
    const overallStatus = hasUnhealthy ? 'unhealthy' : hasWarning ? 'warning' : 'healthy';
    const responseTime = Date.now() - startTime;
    
    return json({
      status: overallStatus,
      timestamp: new Date().toISOString(),
      responseTime: `${responseTime}ms`,
      version: process.env.npm_package_version || 'unknown',
      checks
    }, {
      status: overallStatus === 'unhealthy' ? 503 : 200,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Content-Type': 'application/json'
      }
    });
    
  } catch (error) {
    AppErrorHandler.logError(error as Error, { route: 'health' });
    
    return json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      responseTime: `${Date.now() - startTime}ms`,
      error: (error as Error).message
    }, {
      status: 503,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Content-Type': 'application/json'
      }
    });
  }
};