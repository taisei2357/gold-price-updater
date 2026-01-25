import { PrismaClient } from "@prisma/client";

// JavaScript版: global変数の型定義なし
export const prisma =
  global.__prisma ??
  new PrismaClient({
    // log: ['query', 'error', 'warn'], // 必要なら一時的に有効化
    // DB接続プール拡張 - スケーラビリティ向上
    datasources: {
      db: {
        url: process.env.DATABASE_URL
      }
    },
    // 接続プールの設定強化
    __internal: {
      engine: {
        // 最大接続数を増加（デフォルト: num_physical_cpus * 2 + 1）
        connection_limit: process.env.DATABASE_CONNECTION_LIMIT ? 
          parseInt(process.env.DATABASE_CONNECTION_LIMIT) : 20,
        // プール最大待機時間延長
        pool_timeout: 30,
        // 接続クリーンアップ間隔
        connect_timeout: 60
      }
    }
  });

if (process.env.NODE_ENV !== "production") global.__prisma = prisma;

export default prisma;
