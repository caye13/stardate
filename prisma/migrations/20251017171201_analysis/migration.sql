-- CreateTable
CREATE TABLE "AnalysisReport" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "rawOutput" TEXT NOT NULL,

    CONSTRAINT "AnalysisReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ImprovementOrder" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "department" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "reportId" TEXT NOT NULL,

    CONSTRAINT "ImprovementOrder_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ImprovementOrder_reportId_idx" ON "ImprovementOrder"("reportId");

-- AddForeignKey
ALTER TABLE "ImprovementOrder" ADD CONSTRAINT "ImprovementOrder_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "AnalysisReport"("id") ON DELETE CASCADE ON UPDATE CASCADE;
