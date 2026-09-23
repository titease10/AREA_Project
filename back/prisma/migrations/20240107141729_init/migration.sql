-- AlterTable
ALTER TABLE "ActionReaction" ADD COLUMN     "iQueryId" TEXT;

-- CreateTable
CREATE TABLE "IQuery" (
    "id" TEXT NOT NULL,
    "queryProvider" TEXT NOT NULL,
    "queryName" TEXT NOT NULL,
    "queryParams" JSONB,

    CONSTRAINT "IQuery_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ActionReaction" ADD CONSTRAINT "ActionReaction_iQueryId_fkey" FOREIGN KEY ("iQueryId") REFERENCES "IQuery"("id") ON DELETE SET NULL ON UPDATE CASCADE;
