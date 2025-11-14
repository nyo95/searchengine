-- AlterTable
ALTER TABLE "Brand" ADD COLUMN     "contact" TEXT,
ADD COLUMN     "email" TEXT;

-- AlterTable
ALTER TABLE "ProductType" ADD COLUMN     "subcategoryId" TEXT;

-- AlterTable
ALTER TABLE "ScheduleItem" ALTER COLUMN "price" DROP NOT NULL;

-- CreateTable
CREATE TABLE "BrandSubcategory" (
    "brandId" TEXT NOT NULL,
    "subcategoryId" TEXT NOT NULL,
    "salesEmail" TEXT,
    "salesContact" TEXT,

    CONSTRAINT "BrandSubcategory_pkey" PRIMARY KEY ("brandId","subcategoryId")
);

-- AddForeignKey
ALTER TABLE "ProductType" ADD CONSTRAINT "ProductType_subcategoryId_fkey" FOREIGN KEY ("subcategoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BrandSubcategory" ADD CONSTRAINT "BrandSubcategory_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BrandSubcategory" ADD CONSTRAINT "BrandSubcategory_subcategoryId_fkey" FOREIGN KEY ("subcategoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
