-- Create enums for campaign modes and access links
CREATE TYPE "CampaignType" AS ENUM ('MANAGER_LINKS', 'SERVICE_UNIQUE');
CREATE TYPE "CampaignAccessLinkType" AS ENUM ('VOTE', 'PUBLIC_READ_ONLY');

-- Extend Campaign model
ALTER TABLE "Campaign"
  ADD COLUMN "type" "CampaignType" NOT NULL DEFAULT 'MANAGER_LINKS',
  ADD COLUMN "allowMultipleVotes" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "publicResultsEnabled" BOOLEAN NOT NULL DEFAULT false;

-- Service declarations per campaign
CREATE TABLE "CampaignService" (
  "id" TEXT NOT NULL,
  "campaignId" INTEGER NOT NULL,
  "name" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CampaignService_pkey" PRIMARY KEY ("id")
);

-- Persistent vote/public links for service campaigns
CREATE TABLE "CampaignAccessLink" (
  "id" TEXT NOT NULL,
  "campaignId" INTEGER NOT NULL,
  "type" "CampaignAccessLinkType" NOT NULL,
  "token" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CampaignAccessLink_pkey" PRIMARY KEY ("id")
);

-- Raw service votes
CREATE TABLE "ServiceVote" (
  "id" SERIAL NOT NULL,
  "campaignId" INTEGER NOT NULL,
  "campaignServiceId" TEXT NOT NULL,
  "mood" TEXT NOT NULL,
  "comment" TEXT,
  "voterKey" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ServiceVote_pkey" PRIMARY KEY ("id")
);

-- Aggregated counters for heavy read traffic
CREATE TABLE "ServiceVoteAggregate" (
  "campaignId" INTEGER NOT NULL,
  "campaignServiceId" TEXT NOT NULL,
  "mood" TEXT NOT NULL,
  "voteCount" INTEGER NOT NULL DEFAULT 0,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ServiceVoteAggregate_pkey" PRIMARY KEY ("campaignId", "campaignServiceId", "mood")
);

CREATE UNIQUE INDEX "CampaignService_campaignId_name_key" ON "CampaignService"("campaignId", "name");
CREATE INDEX "CampaignService_campaignId_idx" ON "CampaignService"("campaignId");
CREATE UNIQUE INDEX "CampaignAccessLink_token_key" ON "CampaignAccessLink"("token");
CREATE UNIQUE INDEX "CampaignAccessLink_campaignId_type_key" ON "CampaignAccessLink"("campaignId", "type");
CREATE INDEX "CampaignAccessLink_campaignId_idx" ON "CampaignAccessLink"("campaignId");
CREATE INDEX "ServiceVote_campaignId_idx" ON "ServiceVote"("campaignId");
CREATE INDEX "ServiceVote_campaignServiceId_idx" ON "ServiceVote"("campaignServiceId");
CREATE INDEX "ServiceVote_campaignId_createdAt_idx" ON "ServiceVote"("campaignId", "createdAt");
CREATE INDEX "ServiceVote_campaignId_voterKey_idx" ON "ServiceVote"("campaignId", "voterKey");
CREATE INDEX "ServiceVoteAggregate_campaignId_idx" ON "ServiceVoteAggregate"("campaignId");

ALTER TABLE "CampaignService"
  ADD CONSTRAINT "CampaignService_campaignId_fkey"
  FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "CampaignAccessLink"
  ADD CONSTRAINT "CampaignAccessLink_campaignId_fkey"
  FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ServiceVote"
  ADD CONSTRAINT "ServiceVote_campaignId_fkey"
  FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ServiceVote"
  ADD CONSTRAINT "ServiceVote_campaignServiceId_fkey"
  FOREIGN KEY ("campaignServiceId") REFERENCES "CampaignService"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ServiceVoteAggregate"
  ADD CONSTRAINT "ServiceVoteAggregate_campaignId_fkey"
  FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ServiceVoteAggregate"
  ADD CONSTRAINT "ServiceVoteAggregate_campaignServiceId_fkey"
  FOREIGN KEY ("campaignServiceId") REFERENCES "CampaignService"("id") ON DELETE CASCADE ON UPDATE CASCADE;
