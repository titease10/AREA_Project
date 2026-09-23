-- CreateTable
CREATE TABLE "DiscordService" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "channelData" JSONB[],
    "channelDataPing" JSONB[],
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DiscordService_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DiscordService_accountId_key" ON "DiscordService"("accountId");

-- AddForeignKey
ALTER TABLE "DiscordService" ADD CONSTRAINT "DiscordService_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;
