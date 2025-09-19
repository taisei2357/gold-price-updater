-- CreateTable
CREATE TABLE "public"."ManualPriceLock" (
    "id" TEXT NOT NULL,
    "shopDomain" TEXT NOT NULL,
    "variantId" TEXT NOT NULL,
    "until" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ManualPriceLock_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ManualPriceLock_shopDomain_until_idx" ON "public"."ManualPriceLock"("shopDomain", "until");

-- CreateIndex
CREATE UNIQUE INDEX "ManualPriceLock_shopDomain_variantId_key" ON "public"."ManualPriceLock"("shopDomain", "variantId");
