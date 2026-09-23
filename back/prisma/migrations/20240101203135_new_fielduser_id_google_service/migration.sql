/*
  Warnings:

  - Added the required column `userId` to the `GoogleService` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "GoogleService" ADD COLUMN     "userId" TEXT NOT NULL;
