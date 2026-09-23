/*
  Warnings:

  - The `userSecondName` column on the `FacebookService` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "FacebookService" DROP COLUMN "userSecondName",
ADD COLUMN     "userSecondName" JSONB[];
