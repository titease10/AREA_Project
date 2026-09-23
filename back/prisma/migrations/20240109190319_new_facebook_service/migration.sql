-- CreateTable
CREATE TABLE "FacebookService" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "userSecondName" TEXT,
    "userFirstName" TEXT,
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FacebookService_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FacebookService_accountId_key" ON "FacebookService"("accountId");

-- AddForeignKey
ALTER TABLE "FacebookService" ADD CONSTRAINT "FacebookService_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;
