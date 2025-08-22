-- CreateTable
CREATE TABLE "SelectedProduct" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shopDomain" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "selected" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ShopSetting" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shopDomain" TEXT NOT NULL,
    "minPricePct" INTEGER NOT NULL DEFAULT 93,
    "autoUpdateEnabled" BOOLEAN NOT NULL DEFAULT false,
    "notificationEmail" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "PriceUpdateLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shopDomain" TEXT NOT NULL,
    "executionType" TEXT NOT NULL,
    "goldRatio" REAL,
    "minPricePct" INTEGER NOT NULL,
    "totalProducts" INTEGER NOT NULL DEFAULT 0,
    "updatedCount" INTEGER NOT NULL DEFAULT 0,
    "failedCount" INTEGER NOT NULL DEFAULT 0,
    "success" BOOLEAN NOT NULL,
    "errorMessage" TEXT,
    "executedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "details" TEXT
);

-- CreateIndex
CREATE UNIQUE INDEX "SelectedProduct_shopDomain_productId_key" ON "SelectedProduct"("shopDomain", "productId");

-- CreateIndex
CREATE UNIQUE INDEX "ShopSetting_shopDomain_key" ON "ShopSetting"("shopDomain");
