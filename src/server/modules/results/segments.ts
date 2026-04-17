import type { Context } from "@/server/context";

type QueryPrisma = Context["prisma"];
type CampaignIdFilter = number | "all";
type SegmentSourceFilter = "all" | "manager" | "service";

async function getCampaignType(prisma: QueryPrisma, userId: string, campaignId: number) {
  return prisma.campaign.findUnique({
    where: { id: campaignId, createdBy: userId },
    select: { id: true, type: true },
  });
}

export async function getSegmentOptions(
  prisma: QueryPrisma,
  userId: string,
  campaignId: CampaignIdFilter,
  source: SegmentSourceFilter,
): Promise<string[]> {
  if (campaignId === "all") {
    const [managers, services] = await Promise.all([
      source === "service"
        ? Promise.resolve([] as Array<{ managerName: string }>)
        : prisma.pollLink.findMany({
            where: { campaign: { createdBy: userId } },
            distinct: ["managerName"],
            select: { managerName: true },
          }),
      source === "manager"
        ? Promise.resolve([] as Array<{ name: string }>)
        : prisma.campaignService.findMany({
            where: { campaign: { createdBy: userId } },
            select: { name: true },
          }),
    ]);

    return [
      ...new Set([
        ...managers.map((item: { managerName: string }) => item.managerName),
        ...services.map((item: { name: string }) => item.name),
      ]),
    ].sort((a, b) => a.localeCompare(b, "fr"));
  }

  const campaign = await getCampaignType(prisma, userId, campaignId);
  if (!campaign) {
    return [];
  }

  if (source === "manager" && campaign.type === "SERVICE_UNIQUE") {
    return [];
  }

  if (source === "service" && campaign.type === "MANAGER_LINKS") {
    return [];
  }

  if (campaign.type === "MANAGER_LINKS") {
    const managers = await prisma.pollLink.findMany({
      where: { campaignId: campaign.id },
      distinct: ["managerName"],
      select: { managerName: true },
      orderBy: { managerName: "asc" },
    });
    return managers.map((item: { managerName: string }) => item.managerName);
  }

  const services = await prisma.campaignService.findMany({
    where: { campaignId: campaign.id },
    select: { name: true },
    orderBy: { name: "asc" },
  });
  return services.map((item: { name: string }) => item.name);
}
