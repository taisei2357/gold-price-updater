import { PrismaClient } from "@prisma/client";

// JavaScript版: global変数の型定義なし
export const prisma =
  global.__prisma ??
  new PrismaClient({
    // log: ['query', 'error', 'warn'], // 必要なら一時的に有効化
  });

if (process.env.NODE_ENV !== "production") global.__prisma = prisma;

export default prisma;
