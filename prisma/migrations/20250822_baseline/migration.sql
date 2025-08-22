-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "public"."ExecutionType" AS ENUM ('cron', 'manual', 'webhook');

-- CreateEnum
CREATE TYPE "public"."MetalType" AS ENUM ('gold', 'platinum');

-- CreateTable
CREATE TABLE "public"."PriceUpdateLog" (
    "id" TEXT NOT NULL,
    "shopDomain" TEXT NOT NULL,
    "executionType" "public"."ExecutionType" NOT NULL,
    "priceRatio" DOUBLE PRECISION,
    "minPricePct" INTEGER NOT NULL,
    "totalProducts" INTEGER NOT NULL DEFAULT 0,
    "updatedCount" INTEGER NOT NULL DEFAULT 0,
    "failedCount" INTEGER NOT NULL DEFAULT 0,
    "success" BOOLEAN NOT NULL,
    "errorMessage" TEXT,
    "executedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "details" TEXT,
    "metalType" "public"."MetalType" DEFAULT 'gold',

    CONSTRAINT "PriceUpdateLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SelectedProduct" (
    "id" TEXT NOT NULL,
    "shopDomain" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "selected" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "metalType" "public"."MetalType" DEFAULT 'gold',

    CONSTRAINT "SelectedProduct_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Session" (
    "id" TEXT NOT NULL,
    "shop" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "isOnline" BOOLEAN NOT NULL DEFAULT false,
    "scope" TEXT,
    "expires" TIMESTAMP(3),
    "accessToken" TEXT NOT NULL,
    "userId" BIGINT,
    "firstName" TEXT,
    "lastName" TEXT,
    "email" TEXT,
    "accountOwner" BOOLEAN NOT NULL DEFAULT false,
    "locale" TEXT,
    "collaborator" BOOLEAN DEFAULT false,
    "emailVerified" BOOLEAN DEFAULT false,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ShopSetting" (
    "id" TEXT NOT NULL,
    "shopDomain" TEXT NOT NULL,
    "minPricePct" INTEGER NOT NULL DEFAULT 93,
    "autoUpdateEnabled" BOOLEAN NOT NULL DEFAULT false,
    "autoUpdateHour" INTEGER NOT NULL DEFAULT 10,
    "notificationEmail" TEXT,
    "consecutiveFailures" INTEGER NOT NULL DEFAULT 0,
    "lastFailureAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShopSetting_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PriceUpdateLog_shopDomain_metalType_executedAt_idx" ON "public"."PriceUpdateLog"("shopDomain" ASC, "metalType" ASC, "executedAt" ASC);

-- CreateIndex
CREATE INDEX "SelectedProduct_shopDomain_metalType_idx" ON "public"."SelectedProduct"("shopDomain" ASC, "metalType" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "SelectedProduct_shopDomain_productId_key" ON "public"."SelectedProduct"("shopDomain" ASC, "productId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "ShopSetting_shopDomain_key" ON "public"."ShopSetting"("shopDomain" ASC);

