import { TRPCError } from "@trpc/server";
import type { Context } from "@/server/context";
import { CACHE_TTL, publicServiceResultsKey } from "@/server/modules/cache/keys";
import { getCacheValue, setCacheValue } from "@/server/modules/cache/store";

type MoodDistributionItem = {
  name: string;
  votes: number;
  fill: string;
  emojiCode: string;
};

type PublicServiceResultsPayload = {
  campaignName: string;
  totalVotes: number;
  moodDistribution: MoodDistributionItem[];
  serviceBreakdown: Array<{ serviceName: string; totalVotes: number }>;
  updatedAt: string;
};

const MOOD_META: Record<string, Omit<MoodDistributionItem, "votes">> = {
  green: { name: "Très bien", fill: "#22c55e", emojiCode: "1F60A" },
  blue: { name: "Bien", fill: "#38bdf8", emojiCode: "1F642" },
  yellow: { name: "Moyen", fill: "#facc15", emojiCode: "1F610" },
  red: { name: "Pas bien", fill: "#ef4444", emojiCode: "2639-FE0F" },
};

function emptyMoodDistribution(): MoodDistributionItem[] {
  return [
    { ...MOOD_META.green, votes: 0 },
    { ...MOOD_META.blue, votes: 0 },
    { ...MOOD_META.yellow, votes: 0 },
    { ...MOOD_META.red, votes: 0 },
  ];
}

export async function getPublicServiceResultsByToken(
  prisma: Context["prisma"],
  publicToken: string,
): Promise<PublicServiceResultsPayload> {
  const accessLink = await prisma.campaignAccessLink.findUnique({
    where: { token: publicToken },
    select: {
      type: true,
      campaignId: true,
      campaign: {
        select: {
          name: true,
          type: true,
          publicResultsEnabled: true,
        },
      },
    },
  });

  if (!accessLink || accessLink.type !== "PUBLIC_READ_ONLY") {
    throw new TRPCError({ code: "NOT_FOUND", message: "Lien public invalide ou expire." });
  }

  if (accessLink.campaign.type !== "SERVICE_UNIQUE" || !accessLink.campaign.publicResultsEnabled) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "La publication des resultats est desactivee.",
    });
  }

  const cacheKey = publicServiceResultsKey(accessLink.campaignId, publicToken);
  const cached = await getCacheValue<PublicServiceResultsPayload>(cacheKey);
  if (cached) {
    return cached;
  }

  const aggregateRows = await prisma.serviceVoteAggregate.findMany({
    where: { campaignId: accessLink.campaignId },
    select: {
      mood: true,
      voteCount: true,
      updatedAt: true,
      campaignService: {
        select: { name: true },
      },
    },
  });

  const moodDistribution = emptyMoodDistribution();
  const moodByKey = {
    green: moodDistribution[0],
    blue: moodDistribution[1],
    yellow: moodDistribution[2],
    red: moodDistribution[3],
  } as const;
  const serviceVotes = new Map<string, number>();
  let totalVotes = 0;
  let latest: Date | null = null;

  for (const row of aggregateRows) {
    if (row.mood in moodByKey) {
      moodByKey[row.mood as keyof typeof moodByKey].votes += row.voteCount;
    }

    totalVotes += row.voteCount;
    const previous = serviceVotes.get(row.campaignService.name) ?? 0;
    serviceVotes.set(row.campaignService.name, previous + row.voteCount);
    if (!latest || row.updatedAt > latest) {
      latest = row.updatedAt;
    }
  }

  const payload: PublicServiceResultsPayload = {
    campaignName: accessLink.campaign.name,
    totalVotes,
    moodDistribution,
    serviceBreakdown: [...serviceVotes.entries()]
      .map(([serviceName, votes]) => ({ serviceName, totalVotes: votes }))
      .sort((left, right) => right.totalVotes - left.totalVotes),
    updatedAt: (latest ?? new Date()).toISOString(),
  };

  await setCacheValue(cacheKey, payload, CACHE_TTL.publicResultsSeconds);
  return payload;
}
