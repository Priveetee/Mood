import type { Context } from "@/server/context";

export type CampaignPrisma = Context["prisma"];

export type CampaignListItem = {
  id: number;
  name: string;
  managerCount: number;
  creationDate: string;
  participationRate: number;
  totalVotes: number;
  archived: boolean;
  commentsRequired: boolean;
};

export type CampaignLinkItem = {
  id: string;
  managerName: string;
  url: string;
};

export type CreateCampaignInput = {
  name: string;
  managers: string[];
  expiresAt?: Date;
  commentsRequired?: boolean;
};
