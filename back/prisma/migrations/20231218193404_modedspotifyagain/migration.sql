/*
  Warnings:

  - The `songs` column on the `SpotifyService` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "SpotifyService" DROP COLUMN "songs",
ADD COLUMN     "songs" JSONB;
