-- CreateTable
CREATE TABLE "MicrosoftService" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "userDisplayName" JSONB[],
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MicrosoftService_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MicrosoftService_accountId_key" ON "MicrosoftService"("accountId");

-- AddForeignKey
ALTER TABLE "MicrosoftService" ADD CONSTRAINT "MicrosoftService_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;
