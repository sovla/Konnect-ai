/*
  Warnings:

  - You are about to drop the column `createdAt` on the `sessions` table. All the data in the column will be lost.
  - You are about to drop the column `expiresAt` on the `sessions` table. All the data in the column will be lost.
  - You are about to drop the column `token` on the `sessions` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[sessionToken]` on the table `sessions` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `expires` to the `sessions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sessionToken` to the `sessions` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "theme" AS ENUM ('LIGHT', 'DARK', 'SYSTEM');

-- CreateEnum
CREATE TYPE "language" AS ENUM ('KOREAN', 'ENGLISH');

-- DropIndex
DROP INDEX "sessions_token_key";

-- AlterTable
ALTER TABLE "rider_profiles" ADD COLUMN     "autoAccept" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "emailMarketing" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "emailSummary" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "maxDistance" INTEGER NOT NULL DEFAULT 10,
ADD COLUMN     "minOrderAmount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "pushGoalAchieve" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "pushNewOrder" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "pushPromotion" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "workingHours" JSONB NOT NULL DEFAULT '{"start": 9, "end": 22}';

-- AlterTable
ALTER TABLE "sessions" DROP COLUMN "createdAt",
DROP COLUMN "expiresAt",
DROP COLUMN "token",
ADD COLUMN     "expires" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "sessionToken" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "emailVerified" TIMESTAMP(3),
ADD COLUMN     "image" TEXT,
ALTER COLUMN "password" DROP NOT NULL,
ALTER COLUMN "name" SET DEFAULT 'empty';

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification_tokens" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "user_settings" (
    "id" TEXT NOT NULL,
    "riderProfileId" TEXT NOT NULL,
    "theme" "theme" NOT NULL DEFAULT 'LIGHT',
    "language" "language" NOT NULL DEFAULT 'KOREAN',
    "mapDefaultZoom" INTEGER NOT NULL DEFAULT 12,
    "mapDefaultLat" DOUBLE PRECISION NOT NULL DEFAULT 37.5665,
    "mapDefaultLng" DOUBLE PRECISION NOT NULL DEFAULT 126.9780,
    "mapTrafficLayer" BOOLEAN NOT NULL DEFAULT true,
    "mapTransitLayer" BOOLEAN NOT NULL DEFAULT false,
    "privacyAccepted" BOOLEAN NOT NULL DEFAULT false,
    "termsAccepted" BOOLEAN NOT NULL DEFAULT false,
    "privacyDate" TIMESTAMP(3),
    "termsDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "accounts_provider_providerAccountId_key" ON "accounts"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_token_key" ON "verification_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_identifier_token_key" ON "verification_tokens"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "user_settings_riderProfileId_key" ON "user_settings"("riderProfileId");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_sessionToken_key" ON "sessions"("sessionToken");

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_settings" ADD CONSTRAINT "user_settings_riderProfileId_fkey" FOREIGN KEY ("riderProfileId") REFERENCES "rider_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
