import type { Context } from "@/server/context";

export type CampaignPrisma = Context["prisma"];
export type CampaignTypeValue = "MANAGER_LINKS" | "SERVICE_UNIQUE";
export type CampaignLinkKind = "manager" | "service-vote" | "service-public";

export type CampaignListItem = {
  id: number;
  name: string;
  segmentCount: number;
  campaignType: CampaignTypeValue;
  creationDate: string;
  participationRate: number;
  totalVotes: number;
  archived: boolean;
  commentsRequired: boolean;
  allowMultipleVotes: boolean;
  publicResultsEnabled: boolean;
};

export type CampaignLinkItem = {
  id: string;
  label: string;
  kind: CampaignLinkKind;
  url: string;
};

export type CreateCampaignInput = {
  name: string;
  campaignType: CampaignTypeValue;
  managers: string[];
  services: string[];
  expiresAt?: Date;
  commentsRequired?: boolean;
  allowMultipleVotes?: boolean;
};
