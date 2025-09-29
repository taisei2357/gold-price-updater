import type { TaskType, QueueStatus } from "@prisma/client";
import prisma from "../db.server";

export interface QueueTask {
  shopDomain: string;
  taskType: TaskType;
  payload: any;
  priority?: number;
  scheduledAt?: Date;
  maxAttempts?: number;
}

export interface QueueWorker {
  taskType: TaskType;
  handler: (payload: any, shopDomain: string) => Promise<void>;
  concurrency?: number;
}

class QueueManager {
  private workers: Map<TaskType, QueueWorker> = new Map();
  private isProcessing = false;
  private processingShops: Set<string> = new Set();

  // ワーカーを登録
  registerWorker(worker: QueueWorker) {
    this.workers.set(worker.taskType, worker);
  }

  // タスクをキューに追加
  async addTask(task: QueueTask): Promise<string> {
    const queueItem = await prisma.processingQueue.create({
      data: {
        shopDomain: task.shopDomain,
        taskType: task.taskType,
        payload: JSON.stringify(task.payload),
        priority: task.priority || 5,
        scheduledAt: task.scheduledAt || new Date(),
        maxAttempts: task.maxAttempts || 3,
      },
    });

    return queueItem.id;
  }

  // 店舗別キュー制限チェック
  async checkShopQueueLimit(shopDomain: string): Promise<boolean> {
    const [queueCount, shopLimit] = await Promise.all([
      prisma.processingQueue.count({
        where: {
          shopDomain,
          status: { in: ['pending', 'processing', 'retrying'] },
        },
      }),
      prisma.shopResourceLimit.findUnique({
        where: { shopDomain },
      }),
    ]);

    const maxQueueSize = shopLimit?.maxQueueSize || 50;
    return queueCount < maxQueueSize;
  }

  // 店舗の現在の処理中タスク数を取得
  async getShopProcessingCount(shopDomain: string): Promise<number> {
    return prisma.processingQueue.count({
      where: {
        shopDomain,
        status: 'processing',
      },
    });
  }

  // 次のタスクを取得（店舗別制限考慮）
  async getNextTask(): Promise<any | null> {
    // 現在処理中でない店舗の中から、優先度の高いタスクを取得
    const availableTasks = await prisma.processingQueue.findMany({
      where: {
        status: 'pending',
        scheduledAt: { lte: new Date() },
        shopDomain: { notIn: Array.from(this.processingShops) },
      },
      orderBy: [
        { priority: 'asc' },
        { scheduledAt: 'asc' },
      ],
      take: 10, // バッチサイズ
    });

    for (const task of availableTasks) {
      // 店舗の同時実行数制限をチェック
      const [processingCount, shopSetting] = await Promise.all([
        this.getShopProcessingCount(task.shopDomain),
        prisma.shopSetting.findUnique({
          where: { shopDomain: task.shopDomain, isActive: true },
        }),
      ]);

      const maxConcurrent = shopSetting?.maxConcurrentTasks || 5;
      
      if (processingCount < maxConcurrent) {
        return task;
      }
    }

    return null;
  }

  // タスクを実行
  async processTask(taskId: string): Promise<void> {
    const task = await prisma.processingQueue.findUnique({
      where: { id: taskId },
    });

    if (!task || task.status !== 'pending') {
      return;
    }

    const worker = this.workers.get(task.taskType);
    if (!worker) {
      await this.markTaskFailed(taskId, `Worker not found for task type: ${task.taskType}`);
      return;
    }

    // 店舗を処理中リストに追加
    this.processingShops.add(task.shopDomain);

    try {
      await prisma.processingQueue.update({
        where: { id: taskId },
        data: {
          status: 'processing',
          startedAt: new Date(),
          attempts: task.attempts + 1,
        },
      });

      const startTime = Date.now();
      const payload = JSON.parse(task.payload);
      
      await worker.handler(payload, task.shopDomain);
      
      const executionTime = Date.now() - startTime;

      await prisma.processingQueue.update({
        where: { id: taskId },
        data: {
          status: 'completed',
          completedAt: new Date(),
        },
      });

      // 使用状況ログを記録
      await this.logUsage({
        shopDomain: task.shopDomain,
        actionType: 'queue_process',
        resourceType: 'queue_item',
        resourceId: taskId,
        executionTime,
        responseStatus: 200,
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      if (task.attempts < task.maxAttempts) {
        // リトライ
        await prisma.processingQueue.update({
          where: { id: taskId },
          data: {
            status: 'retrying',
            scheduledAt: new Date(Date.now() + Math.pow(2, task.attempts) * 1000), // Exponential backoff
            errorMessage,
          },
        });
      } else {
        await this.markTaskFailed(taskId, errorMessage);
      }
    } finally {
      // 店舗を処理中リストから削除
      this.processingShops.delete(task.shopDomain);
    }
  }

  // タスクを失敗としてマーク
  private async markTaskFailed(taskId: string, errorMessage: string): Promise<void> {
    await prisma.processingQueue.update({
      where: { id: taskId },
      data: {
        status: 'failed',
        completedAt: new Date(),
        errorMessage,
      },
    });
  }

  // 使用状況ログを記録
  private async logUsage(data: {
    shopDomain: string;
    actionType: string;
    resourceType: string;
    resourceId?: string;
    executionTime?: number;
    responseStatus?: number;
    apiCalls?: number;
    errorDetails?: string;
  }): Promise<void> {
    await prisma.usageLog.create({
      data: {
        shopDomain: data.shopDomain,
        actionType: data.actionType as any,
        resourceType: data.resourceType as any,
        resourceId: data.resourceId,
        executionTime: data.executionTime,
        responseStatus: data.responseStatus,
        apiCalls: data.apiCalls || 0,
        errorDetails: data.errorDetails,
      },
    });
  }

  // メインの処理ループ
  async startProcessing(): Promise<void> {
    if (this.isProcessing) {
      return;
    }

    this.isProcessing = true;

    while (this.isProcessing) {
      try {
        const task = await this.getNextTask();
        
        if (task) {
          // 非同期でタスク処理（並行処理を可能にする）
          this.processTask(task.id).catch(console.error);
        } else {
          // タスクがない場合は少し待機
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } catch (error) {
        console.error('Queue processing error:', error);
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }
  }

  // 処理を停止
  stopProcessing(): void {
    this.isProcessing = false;
  }

  // 店舗のキューをクリア（緊急時用）
  async clearShopQueue(shopDomain: string): Promise<void> {
    await prisma.processingQueue.updateMany({
      where: {
        shopDomain,
        status: { in: ['pending', 'retrying'] },
      },
      data: {
        status: 'cancelled',
        completedAt: new Date(),
      },
    });
  }

  // キュー統計を取得
  async getQueueStats(shopDomain?: string): Promise<any> {
    const whereClause = shopDomain ? { shopDomain } : {};
    
    const [pending, processing, completed, failed] = await Promise.all([
      prisma.processingQueue.count({ where: { ...whereClause, status: 'pending' } }),
      prisma.processingQueue.count({ where: { ...whereClause, status: 'processing' } }),
      prisma.processingQueue.count({ where: { ...whereClause, status: 'completed' } }),
      prisma.processingQueue.count({ where: { ...whereClause, status: 'failed' } }),
    ]);

    return { pending, processing, completed, failed };
  }
}

export const queueManager = new QueueManager();

// 店舗リソース制限チェック
export async function checkShopResourceLimits(shopDomain: string): Promise<{
  canProcess: boolean;
  usage: {
    apiCalls: number;
    products: number;
    queueSize: number;
  };
  limits: {
    maxApiCallsPerHour: number;
    maxProductsPerHour: number;
    maxQueueSize: number;
  };
}> {
  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

  const [resourceLimit, usageStats] = await Promise.all([
    prisma.shopResourceLimit.upsert({
      where: { shopDomain },
      create: {
        shopDomain,
        maxProductsPerHour: 1000,
        maxApiCallsPerHour: 100,
        maxQueueSize: 50,
      },
      update: {},
    }),
    prisma.usageLog.aggregate({
      where: {
        shopDomain,
        createdAt: { gte: oneHourAgo },
      },
      _sum: {
        apiCalls: true,
      },
    }),
  ]);

  const currentQueueSize = await prisma.processingQueue.count({
    where: {
      shopDomain,
      status: { in: ['pending', 'processing', 'retrying'] },
    },
  });

  const productUpdates = await prisma.usageLog.count({
    where: {
      shopDomain,
      actionType: 'price_update',
      createdAt: { gte: oneHourAgo },
    },
  });

  const apiCalls = usageStats._sum.apiCalls || 0;
  
  const canProcess = 
    apiCalls < resourceLimit.maxApiCallsPerHour &&
    productUpdates < resourceLimit.maxProductsPerHour &&
    currentQueueSize < resourceLimit.maxQueueSize;

  return {
    canProcess,
    usage: {
      apiCalls,
      products: productUpdates,
      queueSize: currentQueueSize,
    },
    limits: {
      maxApiCallsPerHour: resourceLimit.maxApiCallsPerHour,
      maxProductsPerHour: resourceLimit.maxProductsPerHour,
      maxQueueSize: resourceLimit.maxQueueSize,
    },
  };
}