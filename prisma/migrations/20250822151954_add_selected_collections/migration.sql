-- CreateTable
CREATE TABLE "SelectedCollection" (
    "id" TEXT NOT NULL,
    "shopDomain" TEXT NOT NULL,
    "collectionId" TEXT NOT NULL,
    "selected" BOOLEAN NOT NULL DEFAULT true,
    "metalType" "MetalType" NOT NULL DEFAULT 'gold',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SelectedCollection_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SelectedCollection_shopDomain_collectionId_key" ON "SelectedCollection"("shopDomain", "collectionId");

-- CreateIndex
CREATE INDEX "SelectedCollection_shopDomain_idx" ON "SelectedCollection"("shopDomain");

-- CreateIndex
CREATE INDEX "SelectedCollection_shopDomain_metalType_idx" ON "SelectedCollection"("shopDomain", "metalType");