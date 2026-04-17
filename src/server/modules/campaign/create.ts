import { TRPCError } from "@trpc/server";
import { nanoid } from "nanoid";
import { invalidateCampaignCaches } from "@/server/modules/cache/invalidate";
import type { CampaignLinkItem, CampaignPrisma, CreateCampaignInput } from "./types";
import { buildPollUrl, buildPublicResultsUrl } from "./url";

type CreateCampaignParams = {
  prisma: CampaignPrisma;
  input: CreateCampaignInput;
  userId: string;
  request?: Request | null;
};

function cleanList(values: string[]) {
  return [...new Set(values.map((value) => value.trim()).filter((value) => value.length > 0))];
}

function buildManagerLinks(
  tokens: Array<{ id: string; managerName: string; token: string }>,
  request?: Request | null,
) {
  return tokens.map<CampaignLinkItem>((link) => ({
    id: link.id,
    kind: "manager",
    label: link.managerName,
    url: buildPollUrl(link.token, request),
  }));
}

function buildServiceLinks(
  voteToken: { id: string; token: string },
  publicToken: { id: string; token: string } | null,
  request?: Request | null,
) {
  const links: CampaignLinkItem[] = [
    {
      id: voteToken.id,
      kind: "service-vote",
      label: "Lien unique de vote",
      url: buildPollUrl(voteToken.token, request),
    },
  ];

  if (publicToken) {
    links.push({
      id: publicToken.id,
      kind: "service-public",
      label: "Lien public lecture seule",
      url: buildPublicResultsUrl(publicToken.token, request),
    });
  }

  return links;
}

export async function createCampaign({
  prisma,
  input,
  userId,
  request,
}: CreateCampaignParams): Promise<{
  campaignId: number;
  campaignName: string;
  generatedLinks: CampaignLinkItem[];
  commentsRequired: boolean;
}> {
  const managers = cleanList(input.managers);
  const services = cleanList(input.services);

  if (input.campaignType === "MANAGER_LINKS" && managers.length === 0) {
    throw new TRPCError({ code: "BAD_REQUEST", message: "Ajoutez au moins un manager." });
  }

  if (input.campaignType === "SERVICE_UNIQUE" && services.length === 0) {
    throw new TRPCError({ code: "BAD_REQUEST", message: "Ajoutez au moins un service." });
  }

  const campaign = await prisma.campaign.create({
    data: {
      name: input.name,
      type: input.campaignType,
      createdBy: userId,
      archived: false,
      expiresAt: input.expiresAt,
      commentsRequired: input.commentsRequired ?? false,
      allowMultipleVotes: input.allowMultipleVotes ?? true,
      publicResultsEnabled: false,
    },
  });

  let generatedLinks: CampaignLinkItem[] = [];

  if (input.campaignType === "MANAGER_LINKS") {
    await prisma.pollLink.createMany({
      data: managers.map((managerName) => ({
        campaignId: campaign.id,
        token: nanoid(10),
        managerName,
      })),
    });

    const pollLinks = await prisma.pollLink.findMany({
      where: { campaignId: campaign.id },
      select: { id: true, managerName: true, token: true },
      orderBy: { managerName: "asc" },
    });

    generatedLinks = buildManagerLinks(pollLinks, request);
  }

  if (input.campaignType === "SERVICE_UNIQUE") {
    await prisma.campaignService.createMany({
      data: services.map((name) => ({ campaignId: campaign.id, name })),
    });

    const voteLink = await prisma.campaignAccessLink.create({
      data: { campaignId: campaign.id, type: "VOTE", token: nanoid(16) },
      select: { id: true, token: true },
    });

    generatedLinks = buildServiceLinks(voteLink, null, request);
  }

  await invalidateCampaignCaches(userId, campaign.id);

  return {
    campaignId: campaign.id,
    campaignName: campaign.name,
    generatedLinks,
    commentsRequired: campaign.commentsRequired,
  };
}
