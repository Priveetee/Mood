import { nanoid } from "nanoid";
import { invalidateCampaignCaches } from "@/server/modules/cache/invalidate";
import type { CampaignPrisma, CreateCampaignInput } from "./types";
import { buildPollUrl } from "./url";

type CreateCampaignParams = {
  prisma: CampaignPrisma;
  input: CreateCampaignInput;
  userId: string;
  request?: Request | null;
};

export async function createCampaign({
  prisma,
  input,
  userId,
  request,
}: CreateCampaignParams): Promise<{
  campaignId: number;
  campaignName: string;
  generatedLinks: Array<{ managerName: string; url: string }>;
  commentsRequired: boolean;
}> {
  const campaign = await prisma.campaign.create({
    data: {
      name: input.name,
      createdBy: userId,
      archived: false,
      expiresAt: input.expiresAt,
      commentsRequired: input.commentsRequired ?? false,
    },
  });

  const pollLinksData = input.managers.map((managerName) => ({
    campaignId: campaign.id,
    token: nanoid(10),
    managerName,
  }));

  await prisma.pollLink.createMany({
    data: pollLinksData,
  });

  const pollLinks = await prisma.pollLink.findMany({
    where: { campaignId: campaign.id },
  });

  const generatedLinks = pollLinks.map((link) => ({
    managerName: link.managerName,
    url: buildPollUrl(link.token, request),
  }));

  await invalidateCampaignCaches(userId, campaign.id);

  return {
    campaignId: campaign.id,
    campaignName: campaign.name,
    generatedLinks,
    commentsRequired: campaign.commentsRequired,
  };
}
