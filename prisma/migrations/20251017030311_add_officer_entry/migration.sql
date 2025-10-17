-- CreateTable
CREATE TABLE "OfficerEntry" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "OfficerEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "OfficerEntry_userId_idx" ON "OfficerEntry"("userId");

-- AddForeignKey
ALTER TABLE "OfficerEntry" ADD CONSTRAINT "OfficerEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
