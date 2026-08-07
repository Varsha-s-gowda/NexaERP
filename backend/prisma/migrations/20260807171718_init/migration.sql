-- CreateEnum
CREATE TYPE "public"."Role" AS ENUM ('ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS');

-- CreateEnum
CREATE TYPE "public"."CustomerType" AS ENUM ('RETAIL', 'WHOLESALE', 'DISTRIBUTOR');

-- CreateEnum
CREATE TYPE "public"."CustomerStatus" AS ENUM ('LEAD', 'ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "public"."MovementType" AS ENUM ('IN', 'OUT');

-- CreateEnum
CREATE TYPE "public"."ChallanStatus" AS ENUM ('DRAFT', 'CONFIRMED', 'CANCELLED');

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "public"."Role" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Customer" (
    "id" TEXT NOT NULL,
    "customerCode" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "businessName" TEXT NOT NULL,
    "mobile" TEXT NOT NULL,
    "email" TEXT,
    "gstNumber" TEXT,
    "customerType" "public"."CustomerType" NOT NULL,
    "status" "public"."CustomerStatus" NOT NULL DEFAULT 'LEAD',
    "address" TEXT NOT NULL,
    "followUpDate" TIMESTAMP(3),
    "notes" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CustomerFollowUp" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "notes" TEXT NOT NULL,
    "followUpDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomerFollowUp_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Warehouse" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Warehouse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Product" (
    "id" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "unitPrice" DECIMAL(10,2) NOT NULL,
    "currentStock" INTEGER NOT NULL DEFAULT 0,
    "minimumStockAlert" INTEGER NOT NULL DEFAULT 10,
    "warehouseId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."StockMovement" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "movementType" "public"."MovementType" NOT NULL,
    "reason" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StockMovement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SalesChallan" (
    "id" TEXT NOT NULL,
    "challanNumber" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "totalQuantity" INTEGER NOT NULL,
    "status" "public"."ChallanStatus" NOT NULL DEFAULT 'DRAFT',
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SalesChallan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SalesChallanItem" (
    "id" TEXT NOT NULL,
    "challanId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "unitPrice" DECIMAL(10,2) NOT NULL,
    "quantity" INTEGER NOT NULL,
    "totalPrice" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SalesChallanItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "public"."User"("role");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_customerCode_key" ON "public"."Customer"("customerCode");

-- CreateIndex
CREATE INDEX "Customer_customerName_idx" ON "public"."Customer"("customerName");

-- CreateIndex
CREATE INDEX "Customer_businessName_idx" ON "public"."Customer"("businessName");

-- CreateIndex
CREATE INDEX "Customer_mobile_idx" ON "public"."Customer"("mobile");

-- CreateIndex
CREATE INDEX "Customer_status_idx" ON "public"."Customer"("status");

-- CreateIndex
CREATE INDEX "Customer_customerType_idx" ON "public"."Customer"("customerType");

-- CreateIndex
CREATE INDEX "CustomerFollowUp_customerId_idx" ON "public"."CustomerFollowUp"("customerId");

-- CreateIndex
CREATE INDEX "CustomerFollowUp_followUpDate_idx" ON "public"."CustomerFollowUp"("followUpDate");

-- CreateIndex
CREATE UNIQUE INDEX "Warehouse_name_key" ON "public"."Warehouse"("name");

-- CreateIndex
CREATE INDEX "Warehouse_location_idx" ON "public"."Warehouse"("location");

-- CreateIndex
CREATE UNIQUE INDEX "Product_sku_key" ON "public"."Product"("sku");

-- CreateIndex
CREATE INDEX "Product_productName_idx" ON "public"."Product"("productName");

-- CreateIndex
CREATE INDEX "Product_sku_idx" ON "public"."Product"("sku");

-- CreateIndex
CREATE INDEX "Product_category_idx" ON "public"."Product"("category");

-- CreateIndex
CREATE INDEX "StockMovement_productId_idx" ON "public"."StockMovement"("productId");

-- CreateIndex
CREATE INDEX "StockMovement_movementType_idx" ON "public"."StockMovement"("movementType");

-- CreateIndex
CREATE UNIQUE INDEX "SalesChallan_challanNumber_key" ON "public"."SalesChallan"("challanNumber");

-- CreateIndex
CREATE INDEX "SalesChallan_challanNumber_idx" ON "public"."SalesChallan"("challanNumber");

-- CreateIndex
CREATE INDEX "SalesChallan_customerId_idx" ON "public"."SalesChallan"("customerId");

-- CreateIndex
CREATE INDEX "SalesChallanItem_challanId_idx" ON "public"."SalesChallanItem"("challanId");

-- CreateIndex
CREATE INDEX "SalesChallanItem_productId_idx" ON "public"."SalesChallanItem"("productId");

-- AddForeignKey
ALTER TABLE "public"."Customer" ADD CONSTRAINT "Customer_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CustomerFollowUp" ADD CONSTRAINT "CustomerFollowUp_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "public"."Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CustomerFollowUp" ADD CONSTRAINT "CustomerFollowUp_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Product" ADD CONSTRAINT "Product_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "public"."Warehouse"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."StockMovement" ADD CONSTRAINT "StockMovement_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."StockMovement" ADD CONSTRAINT "StockMovement_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SalesChallan" ADD CONSTRAINT "SalesChallan_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "public"."Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SalesChallan" ADD CONSTRAINT "SalesChallan_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SalesChallanItem" ADD CONSTRAINT "SalesChallanItem_challanId_fkey" FOREIGN KEY ("challanId") REFERENCES "public"."SalesChallan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SalesChallanItem" ADD CONSTRAINT "SalesChallanItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
