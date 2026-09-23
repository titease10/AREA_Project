-- CreateTable
CREATE TABLE "openWeatherService" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "weather" JSONB[],
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "openWeatherService_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "openWeatherService_accountId_key" ON "openWeatherService"("accountId");

-- AddForeignKey
ALTER TABLE "openWeatherService" ADD CONSTRAINT "openWeatherService_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;
