-- CreateTable
CREATE TABLE "SpotifyService" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "playlists" JSONB[],
    "songs" JSONB[],
    "songsQueue" JSONB[],

    CONSTRAINT "SpotifyService_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SpotifyService_accountId_key" ON "SpotifyService"("accountId");

-- AddForeignKey
ALTER TABLE "SpotifyService" ADD CONSTRAINT "SpotifyService_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;
