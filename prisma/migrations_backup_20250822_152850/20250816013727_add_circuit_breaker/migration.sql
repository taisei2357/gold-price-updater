-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ShopSetting" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shopDomain" TEXT NOT NULL,
    "minPricePct" INTEGER NOT NULL DEFAULT 93,
    "autoUpdateEnabled" BOOLEAN NOT NULL DEFAULT false,
    "notificationEmail" TEXT,
    "consecutiveFailures" INTEGER NOT NULL DEFAULT 0,
    "lastFailureAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_ShopSetting" ("autoUpdateEnabled", "createdAt", "id", "minPricePct", "notificationEmail", "shopDomain", "updatedAt") SELECT "autoUpdateEnabled", "createdAt", "id", "minPricePct", "notificationEmail", "shopDomain", "updatedAt" FROM "ShopSetting";
DROP TABLE "ShopSetting";
ALTER TABLE "new_ShopSetting" RENAME TO "ShopSetting";
CREATE UNIQUE INDEX "ShopSetting_shopDomain_key" ON "ShopSetting"("shopDomain");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
