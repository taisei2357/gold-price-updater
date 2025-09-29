import { PrismaClient } from "@prisma/client";
import { authenticate } from "../shopify.server";
import type { Request } from "@remix-run/node";

const prisma = new PrismaClient();

export interface ShopContext {
  shopDomain: string;
  accessToken: string;
  userId?: string;
  isActive: boolean;
  planType: string;
  features: string[];
}

// 店舗コンテキスト管理クラス
export class ShopIsolationManager {
  // 認証された店舗のコンテキストを取得
  async getShopContext(request: Request): Promise<ShopContext | null> {
    try {
      const { session } = await authenticate.admin(request);
      
      if (!session?.shop) {
        return null;
      }

      const shopSetting = await prisma.shopSetting.findUnique({
        where: { shopDomain: session.shop },
      });

      if (!shopSetting?.isActive) {
        throw new Error('Shop account is suspended or inactive');
      }

      const features = this.parseFeatures(shopSetting.featuresEnabled);

      return {
        shopDomain: session.shop,
        accessToken: session.accessToken,
        userId: session.userId?.toString(),
        isActive: shopSetting.isActive,
        planType: shopSetting.planType,
        features,
      };
    } catch (error) {
      console.error('Failed to get shop context:', error);
      return null;
    }
  }

  // 機能フラグを解析
  private parseFeatures(featuresJson: string): string[] {
    try {
      const features = JSON.parse(featuresJson);
      if (features.basic) return ['basic_pricing', 'email_notifications'];
      if (features.premium) return ['advanced_pricing', 'bulk_operations', 'analytics'];
      if (features.enterprise) return ['custom_rules', 'api_access', 'priority_support'];
      return ['basic_pricing'];
    } catch {
      return ['basic_pricing'];
    }
  }

  // 店舗の機能アクセス権をチェック
  async checkFeatureAccess(shopDomain: string, feature: string): Promise<boolean> {
    const shopSetting = await prisma.shopSetting.findUnique({
      where: { shopDomain },
    });

    if (!shopSetting?.isActive) {
      return false;
    }

    const features = this.parseFeatures(shopSetting.featuresEnabled);
    return features.includes(feature);
  }

  // 店舗データの完全分離チェック
  async validateDataIsolation(shopDomain: string, resourceId: string, resourceType: 'product' | 'collection'): Promise<boolean> {
    try {
      switch (resourceType) {
        case 'product':
          const product = await prisma.selectedProduct.findUnique({
            where: { 
              shopDomain_productId: {
                shopDomain,
                productId: resourceId
              }
            },
          });
          return !!product;

        case 'collection':
          const collection = await prisma.selectedCollection.findUnique({
            where: {
              shopDomain_collectionId: {
                shopDomain,
                collectionId: resourceId
              }
            },
          });
          return !!collection;

        default:
          return false;
      }
    } catch (error) {
      console.error('Data isolation validation failed:', error);
      return false;
    }
  }

  // 店舗の全データを安全に削除（GDPR対応）
  async deleteShopData(shopDomain: string): Promise<{
    deletedRecords: Record<string, number>;
    errors: string[];
  }> {
    const deletedRecords: Record<string, number> = {};
    const errors: string[] = [];

    try {
      // トランザクションで全データを削除
      await prisma.$transaction(async (tx) => {
        // 1. UsageLogを削除
        const usageLogs = await tx.usageLog.deleteMany({
          where: { shopDomain },
        });
        deletedRecords.usageLogs = usageLogs.count;

        // 2. ProcessingQueueを削除
        const processingQueue = await tx.processingQueue.deleteMany({
          where: { shopDomain },
        });
        deletedRecords.processingQueue = processingQueue.count;

        // 3. PriceUpdateLogを削除
        const priceUpdateLogs = await tx.priceUpdateLog.deleteMany({
          where: { shopDomain },
        });
        deletedRecords.priceUpdateLogs = priceUpdateLogs.count;

        // 4. ManualPriceLockを削除
        const priceLocks = await tx.manualPriceLock.deleteMany({
          where: { shopDomain },
        });
        deletedRecords.priceLocks = priceLocks.count;

        // 5. SelectedProductを削除
        const selectedProducts = await tx.selectedProduct.deleteMany({
          where: { shopDomain },
        });
        deletedRecords.selectedProducts = selectedProducts.count;

        // 6. SelectedCollectionを削除
        const selectedCollections = await tx.selectedCollection.deleteMany({
          where: { shopDomain },
        });
        deletedRecords.selectedCollections = selectedCollections.count;

        // 7. ShopResourceLimitを削除
        const resourceLimits = await tx.shopResourceLimit.deleteMany({
          where: { shopDomain },
        });
        deletedRecords.resourceLimits = resourceLimits.count;

        // 8. ShopSettingを削除
        const shopSettings = await tx.shopSetting.deleteMany({
          where: { shopDomain },
        });
        deletedRecords.shopSettings = shopSettings.count;

        // 9. Sessionを削除
        const sessions = await tx.session.deleteMany({
          where: { shop: shopDomain },
        });
        deletedRecords.sessions = sessions.count;
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      errors.push(`Failed to delete shop data: ${errorMessage}`);
    }

    return { deletedRecords, errors };
  }

  // 店舗のデータ整合性チェック
  async validateShopDataIntegrity(shopDomain: string): Promise<{
    isValid: boolean;
    issues: string[];
    recommendations: string[];
  }> {
    const issues: string[] = [];
    const recommendations: string[] = [];

    try {
      // 1. 孤立した商品データをチェック
      const orphanedProducts = await prisma.selectedProduct.findMany({
        where: { 
          shopDomain,
          NOT: {
            shopDomain: {
              in: await prisma.shopSetting.findMany({
                where: { isActive: true },
                select: { shopDomain: true },
              }).then(shops => shops.map(s => s.shopDomain))
            }
          }
        },
      });

      if (orphanedProducts.length > 0) {
        issues.push(`Found ${orphanedProducts.length} orphaned products`);
        recommendations.push('Clean up orphaned product references');
      }

      // 2. 重複データをチェック
      const duplicateProducts = await prisma.$queryRaw<Array<{ productId: string; count: number }>>`
        SELECT "productId", COUNT(*) as count
        FROM "SelectedProduct"
        WHERE "shopDomain" = ${shopDomain}
        GROUP BY "productId"
        HAVING COUNT(*) > 1
      `;

      if (duplicateProducts.length > 0) {
        issues.push(`Found ${duplicateProducts.length} duplicate product selections`);
        recommendations.push('Remove duplicate product selections');
      }

      // 3. 不整合な価格更新ログをチェック
      const inconsistentLogs = await prisma.priceUpdateLog.findMany({
        where: {
          shopDomain,
          OR: [
            { updatedCount: { gt: prisma.selectedProduct.count({ where: { shopDomain } }) } },
            { totalProducts: { lt: 0 } },
            { updatedCount: { lt: 0 } },
          ]
        },
      });

      if (inconsistentLogs.length > 0) {
        issues.push(`Found ${inconsistentLogs.length} inconsistent price update logs`);
        recommendations.push('Review and clean up price update logs');
      }

      // 4. 古いセッションデータをチェック
      const oldSessions = await prisma.session.findMany({
        where: {
          shop: shopDomain,
          expires: { lt: new Date() },
        },
      });

      if (oldSessions.length > 0) {
        issues.push(`Found ${oldSessions.length} expired sessions`);
        recommendations.push('Clean up expired sessions');
      }

      // 5. リソース制限の妥当性をチェック
      const resourceLimit = await prisma.shopResourceLimit.findUnique({
        where: { shopDomain },
      });

      if (!resourceLimit) {
        issues.push('Missing resource limit configuration');
        recommendations.push('Initialize resource limits for the shop');
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      issues.push(`Data integrity check failed: ${errorMessage}`);
    }

    return {
      isValid: issues.length === 0,
      issues,
      recommendations,
    };
  }

  // 店舗間データ漏洩チェック
  async auditCrossShopAccess(shopDomain: string): Promise<{
    violations: Array<{
      type: string;
      description: string;
      severity: 'low' | 'medium' | 'high' | 'critical';
      resourceId?: string;
    }>;
    summary: {
      totalViolations: number;
      criticalViolations: number;
      shopCompliance: number; // パーセンテージ
    };
  }> {
    const violations: Array<{
      type: string;
      description: string;
      severity: 'low' | 'medium' | 'high' | 'critical';
      resourceId?: string;
    }> = [];

    try {
      // 1. 他店舗のデータへの不正アクセスチェック
      const crossShopUsage = await prisma.usageLog.findMany({
        where: {
          shopDomain,
          resourceId: {
            not: null,
          },
        },
        include: {
          _count: true,
        },
      });

      for (const log of crossShopUsage) {
        if (log.resourceId && log.resourceType === 'product') {
          const isValidAccess = await this.validateDataIsolation(shopDomain, log.resourceId, 'product');
          if (!isValidAccess) {
            violations.push({
              type: 'unauthorized_product_access',
              description: `Access to product ${log.resourceId} not owned by shop ${shopDomain}`,
              severity: 'critical',
              resourceId: log.resourceId,
            });
          }
        }
      }

      // 2. 処理キューでの店舗混在チェック
      const queueContamination = await prisma.processingQueue.findMany({
        where: {
          shopDomain: { not: shopDomain },
          payload: { contains: shopDomain }, // payloadに他店舗のドメインが含まれる
        },
      });

      if (queueContamination.length > 0) {
        violations.push({
          type: 'queue_contamination',
          description: `Found ${queueContamination.length} queue items with cross-shop data`,
          severity: 'high',
        });
      }

      // 3. セッションの不整合チェック
      const sessionMismatch = await prisma.session.findMany({
        where: {
          shop: { not: shopDomain },
          OR: [
            { email: { contains: shopDomain } },
            { firstName: { contains: shopDomain } },
            { lastName: { contains: shopDomain } },
          ]
        },
      });

      if (sessionMismatch.length > 0) {
        violations.push({
          type: 'session_mismatch',
          description: `Found ${sessionMismatch.length} sessions with mismatched shop data`,
          severity: 'medium',
        });
      }

    } catch (error) {
      violations.push({
        type: 'audit_error',
        description: `Audit failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        severity: 'high',
      });
    }

    const criticalViolations = violations.filter(v => v.severity === 'critical').length;
    const totalViolations = violations.length;
    const shopCompliance = totalViolations === 0 ? 100 : Math.max(0, 100 - (criticalViolations * 20) - ((totalViolations - criticalViolations) * 5));

    return {
      violations,
      summary: {
        totalViolations,
        criticalViolations,
        shopCompliance,
      },
    };
  }

  // 店舗の初期化（新規インストール時）
  async initializeShop(shopDomain: string, accessToken: string): Promise<void> {
    await prisma.$transaction(async (tx) => {
      // 1. 店舗設定を作成
      await tx.shopSetting.upsert({
        where: { shopDomain },
        create: {
          shopDomain,
          minPricePct: 93,
          autoUpdateEnabled: false,
          planType: 'free',
          isActive: true,
          maxConcurrentTasks: 3, // Free planのデフォルト
          priorityLevel: 8, // 低優先度
          featuresEnabled: JSON.stringify({ basic: true }),
        },
        update: {
          isActive: true,
          suspendedAt: null,
          suspensionReason: null,
        },
      });

      // 2. リソース制限を設定
      await tx.shopResourceLimit.upsert({
        where: { shopDomain },
        create: {
          shopDomain,
          maxProductsPerHour: 500, // Free plan制限
          maxApiCallsPerHour: 50,
          maxQueueSize: 20,
        },
        update: {},
      });
    });
  }

  // 店舗の停止（アンインストール時）
  async suspendShop(shopDomain: string, reason: string): Promise<void> {
    await prisma.shopSetting.update({
      where: { shopDomain },
      data: {
        isActive: false,
        suspendedAt: new Date(),
        suspensionReason: reason,
      },
    });

    // 進行中のキューをキャンセル
    await prisma.processingQueue.updateMany({
      where: {
        shopDomain,
        status: { in: ['pending', 'processing', 'retrying'] },
      },
      data: {
        status: 'cancelled',
        completedAt: new Date(),
        errorMessage: `Shop suspended: ${reason}`,
      },
    });
  }
}

export const shopIsolationManager = new ShopIsolationManager();

// データアクセス制御のミドルウェア
export function createDataAccessMiddleware() {
  return async (
    request: Request,
    operation: (shopContext: ShopContext) => Promise<any>
  ) => {
    const shopContext = await shopIsolationManager.getShopContext(request);
    
    if (!shopContext) {
      throw new Error('Unauthorized: Invalid shop context');
    }

    if (!shopContext.isActive) {
      throw new Error('Shop account is suspended or inactive');
    }

    return operation(shopContext);
  };
}