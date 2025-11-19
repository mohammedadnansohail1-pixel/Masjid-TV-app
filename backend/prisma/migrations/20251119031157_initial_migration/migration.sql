-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('SUPER_ADMIN', 'MASJID_ADMIN', 'CONTENT_EDITOR');

-- CreateEnum
CREATE TYPE "PrayerCalculationMethod" AS ENUM ('MWL', 'ISNA', 'EGYPT', 'MAKKAH', 'KARACHI', 'TEHRAN', 'JAFARI', 'GULF', 'KUWAIT', 'QATAR', 'SINGAPORE', 'FRANCE', 'TURKEY', 'RUSSIA');

-- CreateEnum
CREATE TYPE "AsrCalculation" AS ENUM ('STANDARD', 'HANAFI');

-- CreateEnum
CREATE TYPE "HighLatitudeRule" AS ENUM ('MIDDLE_OF_NIGHT', 'SEVENTH_OF_NIGHT', 'TWILIGHT_ANGLE');

-- CreateEnum
CREATE TYPE "DeviceType" AS ENUM ('TV', 'HOME_FRAME', 'KIOSK');

-- CreateEnum
CREATE TYPE "MediaType" AS ENUM ('IMAGE', 'VIDEO', 'PDF');

-- CreateEnum
CREATE TYPE "ContentType" AS ENUM ('PRAYER_TIMES', 'ANNOUNCEMENT', 'IMAGE', 'VIDEO', 'WEBVIEW');

-- CreateEnum
CREATE TYPE "CampaignStatus" AS ENUM ('DRAFT', 'ACTIVE', 'PAUSED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CARD', 'APPLE_PAY', 'GOOGLE_PAY', 'ACH', 'CASH', 'CHECK');

-- CreateEnum
CREATE TYPE "DonationStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'MASJID_ADMIN',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "masjidId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Masjid" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "zipCode" TEXT,
    "country" TEXT NOT NULL DEFAULT 'USA',
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "timezone" TEXT NOT NULL DEFAULT 'America/New_York',
    "email" TEXT,
    "phone" TEXT,
    "website" TEXT,
    "logo" TEXT,
    "calculationMethod" "PrayerCalculationMethod" NOT NULL DEFAULT 'ISNA',
    "asrCalculation" "AsrCalculation" NOT NULL DEFAULT 'STANDARD',
    "highLatitudeRule" "HighLatitudeRule" NOT NULL DEFAULT 'MIDDLE_OF_NIGHT',
    "defaultTemplate" TEXT NOT NULL DEFAULT 'template1',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Masjid_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PrayerTime" (
    "id" TEXT NOT NULL,
    "masjidId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "fajr" TEXT NOT NULL,
    "sunrise" TEXT NOT NULL,
    "dhuhr" TEXT NOT NULL,
    "asr" TEXT NOT NULL,
    "maghrib" TEXT NOT NULL,
    "isha" TEXT NOT NULL,
    "fajrIqamah" TEXT,
    "dhuhrIqamah" TEXT,
    "asrIqamah" TEXT,
    "maghribIqamah" TEXT,
    "ishaIqamah" TEXT,
    "jumuah1" TEXT,
    "jumuah2" TEXT,
    "isManual" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PrayerTime_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Device" (
    "id" TEXT NOT NULL,
    "masjidId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "DeviceType" NOT NULL DEFAULT 'TV',
    "pairingCode" TEXT NOT NULL,
    "isPaired" BOOLEAN NOT NULL DEFAULT false,
    "userAgent" TEXT,
    "ipAddress" TEXT,
    "lastSeen" TIMESTAMP(3),
    "activeTemplate" TEXT NOT NULL DEFAULT 'template1',
    "contentRotationInterval" INTEGER NOT NULL DEFAULT 30,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Device_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Announcement" (
    "id" TEXT NOT NULL,
    "masjidId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "imageUrl" TEXT,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Announcement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Media" (
    "id" TEXT NOT NULL,
    "masjidId" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "path" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "type" "MediaType" NOT NULL,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContentSchedule" (
    "id" TEXT NOT NULL,
    "masjidId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "contentType" "ContentType" NOT NULL,
    "contentId" TEXT,
    "url" TEXT,
    "startTime" TIMESTAMP(3),
    "endTime" TIMESTAMP(3),
    "days" INTEGER[],
    "duration" INTEGER NOT NULL DEFAULT 30,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContentSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Campaign" (
    "id" TEXT NOT NULL,
    "masjidId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "goalAmount" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "status" "CampaignStatus" NOT NULL DEFAULT 'ACTIVE',
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Campaign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Donation" (
    "id" TEXT NOT NULL,
    "masjidId" TEXT NOT NULL,
    "campaignId" TEXT,
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "donorName" TEXT,
    "donorEmail" TEXT,
    "donorPhone" TEXT,
    "isAnonymous" BOOLEAN NOT NULL DEFAULT false,
    "paymentMethod" "PaymentMethod" NOT NULL,
    "paymentProvider" TEXT NOT NULL DEFAULT 'stripe',
    "transactionId" TEXT,
    "isRecurring" BOOLEAN NOT NULL DEFAULT false,
    "recurringInterval" TEXT,
    "status" "DonationStatus" NOT NULL DEFAULT 'PENDING',
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Donation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_masjidId_idx" ON "User"("masjidId");

-- CreateIndex
CREATE UNIQUE INDEX "Masjid_slug_key" ON "Masjid"("slug");

-- CreateIndex
CREATE INDEX "Masjid_slug_idx" ON "Masjid"("slug");

-- CreateIndex
CREATE INDEX "PrayerTime_masjidId_date_idx" ON "PrayerTime"("masjidId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "PrayerTime_masjidId_date_key" ON "PrayerTime"("masjidId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "Device_pairingCode_key" ON "Device"("pairingCode");

-- CreateIndex
CREATE INDEX "Device_masjidId_idx" ON "Device"("masjidId");

-- CreateIndex
CREATE INDEX "Device_pairingCode_idx" ON "Device"("pairingCode");

-- CreateIndex
CREATE INDEX "Announcement_masjidId_idx" ON "Announcement"("masjidId");

-- CreateIndex
CREATE INDEX "Announcement_isActive_startDate_endDate_idx" ON "Announcement"("isActive", "startDate", "endDate");

-- CreateIndex
CREATE INDEX "Media_masjidId_idx" ON "Media"("masjidId");

-- CreateIndex
CREATE INDEX "Media_type_idx" ON "Media"("type");

-- CreateIndex
CREATE INDEX "ContentSchedule_masjidId_isActive_idx" ON "ContentSchedule"("masjidId", "isActive");

-- CreateIndex
CREATE INDEX "Campaign_masjidId_status_idx" ON "Campaign"("masjidId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Campaign_masjidId_slug_key" ON "Campaign"("masjidId", "slug");

-- CreateIndex
CREATE INDEX "Donation_masjidId_idx" ON "Donation"("masjidId");

-- CreateIndex
CREATE INDEX "Donation_campaignId_idx" ON "Donation"("campaignId");

-- CreateIndex
CREATE INDEX "Donation_status_idx" ON "Donation"("status");

-- CreateIndex
CREATE INDEX "Donation_transactionId_idx" ON "Donation"("transactionId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_masjidId_fkey" FOREIGN KEY ("masjidId") REFERENCES "Masjid"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrayerTime" ADD CONSTRAINT "PrayerTime_masjidId_fkey" FOREIGN KEY ("masjidId") REFERENCES "Masjid"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Device" ADD CONSTRAINT "Device_masjidId_fkey" FOREIGN KEY ("masjidId") REFERENCES "Masjid"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Announcement" ADD CONSTRAINT "Announcement_masjidId_fkey" FOREIGN KEY ("masjidId") REFERENCES "Masjid"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_masjidId_fkey" FOREIGN KEY ("masjidId") REFERENCES "Masjid"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Campaign" ADD CONSTRAINT "Campaign_masjidId_fkey" FOREIGN KEY ("masjidId") REFERENCES "Masjid"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Donation" ADD CONSTRAINT "Donation_masjidId_fkey" FOREIGN KEY ("masjidId") REFERENCES "Masjid"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Donation" ADD CONSTRAINT "Donation_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE SET NULL ON UPDATE CASCADE;
