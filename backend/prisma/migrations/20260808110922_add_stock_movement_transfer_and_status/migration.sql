-- CreateEnum
CREATE TYPE "public"."MovementStatus" AS ENUM ('COMPLETED', 'PENDING', 'CANCELLED');

-- AlterEnum
ALTER TYPE "public"."MovementType" ADD VALUE 'TRANSFER';

-- AlterTable
ALTER TABLE "public"."StockMovement" ADD COLUMN     "fromWarehouseId" TEXT,
ADD COLUMN     "status" "public"."MovementStatus" NOT NULL DEFAULT 'COMPLETED',
ADD COLUMN     "toWarehouseId" TEXT,
ALTER COLUMN "reason" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "StockMovement_fromWarehouseId_idx" ON "public"."StockMovement"("fromWarehouseId");

-- CreateIndex
CREATE INDEX "StockMovement_toWarehouseId_idx" ON "public"."StockMovement"("toWarehouseId");

-- AddForeignKey
ALTER TABLE "public"."StockMovement" ADD CONSTRAINT "StockMovement_fromWarehouseId_fkey" FOREIGN KEY ("fromWarehouseId") REFERENCES "public"."Warehouse"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."StockMovement" ADD CONSTRAINT "StockMovement_toWarehouseId_fkey" FOREIGN KEY ("toWarehouseId") REFERENCES "public"."Warehouse"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
