/*
  Warnings:

  - You are about to drop the column `ipAddress` on the `Vote` table. All the data in the column will be lost.
  - You are about to drop the column `userAgent` on the `Vote` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Vote` table. All the data in the column will be lost.
  - You are about to drop the `VoteAttempt` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Vote" DROP CONSTRAINT "Vote_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."VoteAttempt" DROP CONSTRAINT "VoteAttempt_pollLinkId_fkey";

-- DropIndex
DROP INDEX "public"."Vote_ipAddress_idx";

-- DropIndex
DROP INDEX "public"."Vote_pollLinkId_ipAddress_key";

-- DropIndex
DROP INDEX "public"."Vote_userAgent_idx";

-- DropIndex
DROP INDEX "public"."Vote_userId_idx";

-- DropIndex
DROP INDEX "public"."Vote_userId_pollLinkId_key";

-- AlterTable
ALTER TABLE "Vote" DROP COLUMN "ipAddress",
DROP COLUMN "userAgent",
DROP COLUMN "userId";

-- DropTable
DROP TABLE "public"."VoteAttempt";
