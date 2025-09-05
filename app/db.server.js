import { PrismaClient } from "@prisma/client";

declare global {
  // for hot-reload in dev
  var __prisma: PrismaClient | undefined;
}

export const prisma =
  global.__prisma ??
  new PrismaClient({
    // log: ['query', 'error', 'warn'], // 必要なら一時的に有効化
  });

if (process.env.NODE_ENV !== "production") global.__prisma = prisma;

export default prisma;
