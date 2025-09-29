import type { ActionType, ResourceType } from "@prisma/client";
import prisma from "../db.server";

export interface UsageMetrics {
  actionType: ActionType;
  resourceType: ResourceType;
  shopDomain: string;
  resourceId?: string;
  requestDetails?: any;
  responseStatus?: number;
  executionTime?: number;
  apiCalls?: number;
  dataSize?: number;
  userAgent?: string;
  ipAddress?: string;
  sessionId?: string;
  errorDetails?: string;
}

export class UsageLogger {
  // 使用状況ログを記録
  async log(metrics: UsageMetrics): Promise<void> {
    try {
      await prisma.usageLog.create({
        data: {
          shopDomain: metrics.shopDomain,
          actionType: metrics.actionType,
          resourceType: metrics.resourceType,
          resourceId: metrics.resourceId,
          requestDetails: metrics.requestDetails ? JSON.stringify(metrics.requestDetails) : null,
          responseStatus: metrics.responseStatus,
          executionTime: metrics.executionTime,
          apiCalls: metrics.apiCalls || 0,
          dataSize: metrics.dataSize,
          userAgent: metrics.userAgent,
          ipAddress: metrics.ipAddress,
          sessionId: metrics.sessionId,
          errorDetails: metrics.errorDetails,
        },
      });
    } catch (error) {
      // ログ記録の失敗はアプリケーションの動作を妨げない
      console.error('Failed to log usage:', error);
    }
  }

  // 一括ログ記録
  async logBatch(metrics: UsageMetrics[]): Promise<void> {
    if (metrics.length === 0) return;

    try {
      await prisma.usageLog.createMany({
        data: metrics.map(m => ({
          shopDomain: m.shopDomain,
          actionType: m.actionType,
          resourceType: m.resourceType,
          resourceId: m.resourceId,
          requestDetails: m.requestDetails ? JSON.stringify(m.requestDetails) : null,
          responseStatus: m.responseStatus,
          executionTime: m.executionTime,
          apiCalls: m.apiCalls || 0,
          dataSize: m.dataSize,
          userAgent: m.userAgent,
          ipAddress: m.ipAddress,
          sessionId: m.sessionId,
          errorDetails: m.errorDetails,
        })),
        skipDuplicates: true,
      });
    } catch (error) {
      console.error('Failed to log batch usage:', error);
    }
  }

  // 店舗の使用統計を取得
  async getShopUsageStats(
    shopDomain: string, 
    fromDate?: Date, 
    toDate?: Date
  ): Promise<{
    totalApiCalls: number;
    totalExecutionTime: number;
    averageResponseTime: number;
    errorRate: number;
    actionBreakdown: Record<string, number>;
    hourlyUsage: Array<{ hour: string; count: number; apiCalls: number }>;
  }> {
    const from = fromDate || new Date(Date.now() - 24 * 60 * 60 * 1000); // 24時間前
    const to = toDate || new Date();

    const [stats, actionStats, hourlyStats] = await Promise.all([
      prisma.usageLog.aggregate({
        where: {
          shopDomain,
          createdAt: { gte: from, lte: to },
        },
        _sum: {
          apiCalls: true,
          executionTime: true,
        },
        _avg: {
          executionTime: true,
        },
        _count: {
          id: true,
        },
      }),
      
      prisma.usageLog.groupBy({
        by: ['actionType'],
        where: {
          shopDomain,
          createdAt: { gte: from, lte: to },
        },
        _count: {
          id: true,
        },
      }),

      prisma.$queryRaw`
        SELECT 
          DATE_TRUNC('hour', "createdAt") as hour,
          COUNT(*) as count,
          SUM("apiCalls") as "apiCalls"
        FROM "UsageLog"
        WHERE "shopDomain" = ${shopDomain}
          AND "createdAt" >= ${from}
          AND "createdAt" <= ${to}
        GROUP BY DATE_TRUNC('hour', "createdAt")
        ORDER BY hour
      ` as Array<{ hour: Date; count: string; apiCalls: string }>,
    ]);

    const errorCount = await prisma.usageLog.count({
      where: {
        shopDomain,
        createdAt: { gte: from, lte: to },
        responseStatus: { gte: 400 },
      },
    });

    const actionBreakdown = actionStats.reduce((acc, item) => {
      acc[item.actionType] = item._count.id;
      return acc;
    }, {} as Record<string, number>);

    const hourlyUsage = hourlyStats.map(item => ({
      hour: item.hour.toISOString(),
      count: parseInt(item.count),
      apiCalls: parseInt(item.apiCalls || '0'),
    }));

    return {
      totalApiCalls: stats._sum.apiCalls || 0,
      totalExecutionTime: stats._sum.executionTime || 0,
      averageResponseTime: stats._avg.executionTime || 0,
      errorRate: stats._count.id > 0 ? (errorCount / stats._count.id) * 100 : 0,
      actionBreakdown,
      hourlyUsage,
    };
  }

  // 全体統計を取得（管理者用）
  async getGlobalStats(fromDate?: Date, toDate?: Date): Promise<{
    totalShops: number;
    totalApiCalls: number;
    totalActions: number;
    topShops: Array<{ shopDomain: string; apiCalls: number; actions: number }>;
    errorsByShop: Array<{ shopDomain: string; errorCount: number; errorRate: number }>;
    performanceMetrics: {
      averageResponseTime: number;
      p95ResponseTime: number;
      slowestActions: Array<{ actionType: string; avgTime: number }>;
    };
  }> {
    const from = fromDate || new Date(Date.now() - 24 * 60 * 60 * 1000);
    const to = toDate || new Date();

    const [globalStats, topShops, errorStats, performanceData] = await Promise.all([
      prisma.usageLog.aggregate({
        where: {
          createdAt: { gte: from, lte: to },
        },
        _sum: {
          apiCalls: true,
        },
        _count: {
          id: true,
        },
      }),

      prisma.usageLog.groupBy({
        by: ['shopDomain'],
        where: {
          createdAt: { gte: from, lte: to },
        },
        _sum: {
          apiCalls: true,
        },
        _count: {
          id: true,
        },
        orderBy: {
          _sum: {
            apiCalls: 'desc',
          },
        },
        take: 10,
      }),

      prisma.usageLog.groupBy({
        by: ['shopDomain'],
        where: {
          createdAt: { gte: from, lte: to },
          responseStatus: { gte: 400 },
        },
        _count: {
          id: true,
        },
      }),

      prisma.usageLog.groupBy({
        by: ['actionType'],
        where: {
          createdAt: { gte: from, lte: to },
          executionTime: { not: null },
        },
        _avg: {
          executionTime: true,
        },
        orderBy: {
          _avg: {
            executionTime: 'desc',
          },
        },
        take: 5,
      }),
    ]);

    // 店舗数を取得
    const totalShops = await prisma.usageLog.findMany({
      where: {
        createdAt: { gte: from, lte: to },
      },
      select: { shopDomain: true },
      distinct: ['shopDomain'],
    });

    // P95レスポンス時間を計算
    const responseTimes = await prisma.usageLog.findMany({
      where: {
        createdAt: { gte: from, lte: to },
        executionTime: { not: null },
      },
      select: { executionTime: true },
      orderBy: { executionTime: 'desc' },
    });

    const p95Index = Math.ceil(responseTimes.length * 0.05);
    const p95ResponseTime = responseTimes[p95Index]?.executionTime || 0;

    // エラー率を計算
    const errorsByShop = await Promise.all(
      topShops.map(async shop => {
        const totalActions = await prisma.usageLog.count({
          where: {
            shopDomain: shop.shopDomain,
            createdAt: { gte: from, lte: to },
          },
        });
        const errorCount = errorStats.find(e => e.shopDomain === shop.shopDomain)?._count.id || 0;
        
        return {
          shopDomain: shop.shopDomain,
          errorCount,
          errorRate: totalActions > 0 ? (errorCount / totalActions) * 100 : 0,
        };
      })
    );

    return {
      totalShops: totalShops.length,
      totalApiCalls: globalStats._sum.apiCalls || 0,
      totalActions: globalStats._count.id,
      topShops: topShops.map(shop => ({
        shopDomain: shop.shopDomain,
        apiCalls: shop._sum.apiCalls || 0,
        actions: shop._count.id,
      })),
      errorsByShop,
      performanceMetrics: {
        averageResponseTime: performanceData.reduce((acc, p) => acc + (p._avg.executionTime || 0), 0) / performanceData.length,
        p95ResponseTime,
        slowestActions: performanceData.map(p => ({
          actionType: p.actionType,
          avgTime: p._avg.executionTime || 0,
        })),
      },
    };
  }

  // 店舗のリソース使用状況をチェック
  async checkShopResourceUsage(shopDomain: string): Promise<{
    currentHourUsage: {
      apiCalls: number;
      actions: number;
      dataTransferred: number; // bytes
    };
    limits: {
      maxApiCallsPerHour: number;
      maxActionsPerHour: number;
      maxDataPerHour: number;
    };
    quotaRemaining: {
      apiCalls: number;
      actions: number;
      dataTransfer: number;
    };
    resetAt: Date;
  }> {
    const currentHour = new Date();
    currentHour.setMinutes(0, 0, 0);
    const nextHour = new Date(currentHour.getTime() + 60 * 60 * 1000);

    const [currentUsage, resourceLimit] = await Promise.all([
      prisma.usageLog.aggregate({
        where: {
          shopDomain,
          createdAt: { gte: currentHour, lt: nextHour },
        },
        _sum: {
          apiCalls: true,
          dataSize: true,
        },
        _count: {
          id: true,
        },
      }),
      prisma.shopResourceLimit.findUnique({
        where: { shopDomain },
      }),
    ]);

    const limits = {
      maxApiCallsPerHour: resourceLimit?.maxApiCallsPerHour || 100,
      maxActionsPerHour: 1000, // デフォルト値
      maxDataPerHour: 10 * 1024 * 1024, // 10MB
    };

    const usage = {
      apiCalls: currentUsage._sum.apiCalls || 0,
      actions: currentUsage._count.id,
      dataTransferred: currentUsage._sum.dataSize || 0,
    };

    return {
      currentHourUsage: usage,
      limits,
      quotaRemaining: {
        apiCalls: Math.max(0, limits.maxApiCallsPerHour - usage.apiCalls),
        actions: Math.max(0, limits.maxActionsPerHour - usage.actions),
        dataTransfer: Math.max(0, limits.maxDataPerHour - usage.dataTransferred),
      },
      resetAt: nextHour,
    };
  }

  // 古いログをクリーンアップ
  async cleanupOldLogs(daysToKeep: number = 30): Promise<number> {
    const cutoffDate = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000);
    
    const result = await prisma.usageLog.deleteMany({
      where: {
        createdAt: { lt: cutoffDate },
      },
    });

    return result.count;
  }
}

// パフォーマンス測定のミドルウェア
export function createUsageMiddleware(logger: UsageLogger) {
  return async (
    shopDomain: string,
    actionType: ActionType,
    resourceType: ResourceType,
    operation: () => Promise<any>,
    metadata?: Partial<UsageMetrics>
  ) => {
    const startTime = Date.now();
    let responseStatus = 200;
    let errorDetails: string | undefined;
    
    try {
      const result = await operation();
      return result;
    } catch (error) {
      responseStatus = 500;
      errorDetails = error instanceof Error ? error.message : 'Unknown error';
      throw error;
    } finally {
      const executionTime = Date.now() - startTime;
      
      await logger.log({
        shopDomain,
        actionType,
        resourceType,
        executionTime,
        responseStatus,
        errorDetails,
        ...metadata,
      });
    }
  };
}

export const usageLogger = new UsageLogger();