/*
  Warnings:

  - Added the required column `actionProvider` to the `ActionReaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `reactionProvider` to the `ActionReaction` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ActionReaction" ADD COLUMN     "actionProvider" TEXT NOT NULL,
ADD COLUMN     "reactionProvider" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "GoogleService" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "activity" JSONB[],
    "channel" JSONB[],
    "channelBanner" JSONB[],
    "channelSection" JSONB[],
    "guideCategory" JSONB[],
    "i18nLanguage" JSONB[],
    "i18nRegion" JSONB[],
    "playlist" JSONB[],
    "playlistItem" JSONB[],
    "searchResult" JSONB[],
    "subscription" JSONB[],
    "thumbnail" JSONB[],
    "video" JSONB[],
    "videoCategory" JSONB[],
    "watermark" JSONB[],
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GoogleService_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GoogleService_accountId_key" ON "GoogleService"("accountId");

-- AddForeignKey
ALTER TABLE "GoogleService" ADD CONSTRAINT "GoogleService_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;
