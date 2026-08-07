/*
  Warnings:

  - You are about to drop the column `currentStock` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `minimumStockAlert` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `sku` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `unitPrice` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `sku` on the `SalesChallanItem` table. All the data in the column will be lost.
  - You are about to drop the column `unitPrice` on the `SalesChallanItem` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[productCode]` on the table `Product` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `productCode` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `purchasePrice` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sellingPrice` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalAmount` to the `SalesChallan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `productCode` to the `SalesChallanItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sellingPrice` to the `SalesChallanItem` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."ProductStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- DropIndex
DROP INDEX "public"."Product_sku_idx";

-- DropIndex
DROP INDEX "public"."Product_sku_key";

-- AlterTable
ALTER TABLE "public"."Product" DROP COLUMN "currentStock",
DROP COLUMN "minimumStockAlert",
DROP COLUMN "sku",
DROP COLUMN "unitPrice",
ADD COLUMN     "description" TEXT,
ADD COLUMN     "gstPercentage" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "minimumStock" INTEGER NOT NULL DEFAULT 10,
ADD COLUMN     "productCode" TEXT NOT NULL,
ADD COLUMN     "purchasePrice" DECIMAL(10,2) NOT NULL,
ADD COLUMN     "sellingPrice" DECIMAL(10,2) NOT NULL,
ADD COLUMN     "status" "public"."ProductStatus" NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN     "stockQuantity" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "public"."SalesChallan" ADD COLUMN     "totalAmount" DECIMAL(10,2) NOT NULL;

-- AlterTable
ALTER TABLE "public"."SalesChallanItem" DROP COLUMN "sku",
DROP COLUMN "unitPrice",
ADD COLUMN     "productCode" TEXT NOT NULL,
ADD COLUMN     "sellingPrice" DECIMAL(10,2) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Product_productCode_key" ON "public"."Product"("productCode");

-- CreateIndex
CREATE INDEX "Product_productCode_idx" ON "public"."Product"("productCode");
