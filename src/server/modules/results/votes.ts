import type { Context } from "@/server/context";
import type { VoteSummaryInput } from "./summary";

type QueryPrisma = Context["prisma"];

type ResultsFilters = {
  campaignId: number | "all";
  segment: string | "all";
  source: "all" | "manager" | "service";
  dateRange: {
    from?: Date;
    to?: Date;
  };
};

function createdAtFilter(dateRange: ResultsFilters["dateRange"]) {
  if (dateRange.from && dateRange.to) {
    return { gte: dateRange.from, lte: dateRange.to };
  }
  return undefined;
}

async function getCampaign(prisma: QueryPrisma, userId: string, campaignId: number) {
  return prisma.campaign.findUnique({
    where: { id: campaignId, createdBy: userId },
    select: { id: true, name: true, type: true },
  });
}

function normalizeVotes(
  managerVotes: Array<{
    mood: string;
    comment: string | null;
    createdAt: Date;
    pollLink: { managerName: string };
    campaign: { name: string };
  }>,
  serviceVotes: Array<{
    mood: string;
    comment: string | null;
    createdAt: Date;
    campaignService: { name: string };
    campaign: { name: string };
  }>,
): VoteSummaryInput[] {
  const fromManagers = managerVotes.map<VoteSummaryInput>((vote) => ({
    mood: vote.mood,
    comment: vote.comment,
    createdAt: vote.createdAt,
    segment: vote.pollLink.managerName,
    source: "manager",
    campaignName: vote.campaign.name,
  }));

  const fromServices = serviceVotes.map<VoteSummaryInput>((vote) => ({
    mood: vote.mood,
    comment: vote.comment,
    createdAt: vote.createdAt,
    segment: vote.campaignService.name,
    source: "service",
    campaignName: vote.campaign.name,
  }));

  return [...fromManagers, ...fromServices].sort(
    (left, right) => right.createdAt.getTime() - left.createdAt.getTime(),
  );
}

export async function getFilteredVotes(
  prisma: QueryPrisma,
  userId: string,
  filters: ResultsFilters,
): Promise<{ campaignName: string; votes: VoteSummaryInput[] }> {
  const createdAt = createdAtFilter(filters.dateRange);

  if (filters.campaignId === "all") {
    const [managerVotes, serviceVotes] = await Promise.all([
      filters.source === "service"
        ? Promise.resolve([])
        : prisma.vote.findMany({
            where: {
              campaign: { createdBy: userId },
              createdAt,
              pollLink: filters.segment === "all" ? undefined : { managerName: filters.segment },
            },
            include: {
              pollLink: { select: { managerName: true } },
              campaign: { select: { name: true } },
            },
          }),
      filters.source === "manager"
        ? Promise.resolve([])
        : prisma.serviceVote.findMany({
            where: {
              campaign: { createdBy: userId },
              createdAt,
              campaignService: filters.segment === "all" ? undefined : { name: filters.segment },
            },
            include: {
              campaignService: { select: { name: true } },
              campaign: { select: { name: true } },
            },
          }),
    ]);

    return {
      campaignName: "Toutes les campagnes",
      votes: normalizeVotes(managerVotes, serviceVotes),
    };
  }

  const campaign = await getCampaign(prisma, userId, filters.campaignId);
  if (!campaign) {
    return { campaignName: "Campagne sélectionnée", votes: [] };
  }

  if (campaign.type === "MANAGER_LINKS") {
    if (filters.source === "service") {
      return { campaignName: campaign.name, votes: [] };
    }

    const managerVotes = await prisma.vote.findMany({
      where: {
        campaignId: campaign.id,
        createdAt,
        pollLink: filters.segment === "all" ? undefined : { managerName: filters.segment },
      },
      include: {
        pollLink: { select: { managerName: true } },
        campaign: { select: { name: true } },
      },
    });

    return { campaignName: campaign.name, votes: normalizeVotes(managerVotes, []) };
  }

  if (filters.source === "manager") {
    return { campaignName: campaign.name, votes: [] };
  }

  const serviceVotes = await prisma.serviceVote.findMany({
    where: {
      campaignId: campaign.id,
      createdAt,
      campaignService: filters.segment === "all" ? undefined : { name: filters.segment },
    },
    include: { campaignService: { select: { name: true } }, campaign: { select: { name: true } } },
  });

  return { campaignName: campaign.name, votes: normalizeVotes([], serviceVotes) };
}
