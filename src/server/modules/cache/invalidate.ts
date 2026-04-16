import {
  campaignLinksKey,
  campaignListKey,
  filteredResultsPattern,
  pollInfoKey,
  resultCampaignOptionsKey,
  resultManagerOptionsPattern,
} from "./keys";
import { deleteCacheByPatterns, deleteCacheKeys } from "./store";

export async function invalidateCampaignCaches(userId: string, campaignId?: number) {
  const keys = [campaignListKey(userId), resultCampaignOptionsKey(userId)];

  if (campaignId !== undefined) {
    keys.push(campaignLinksKey(userId, campaignId));
  }

  await Promise.all([
    deleteCacheKeys(keys),
    deleteCacheByPatterns([resultManagerOptionsPattern(userId), filteredResultsPattern(userId)]),
  ]);
}

export async function invalidateVoteCaches(userId: string, campaignId: number, pollToken: string) {
  await Promise.all([
    invalidateCampaignCaches(userId, campaignId),
    deleteCacheKeys([pollInfoKey(pollToken)]),
  ]);
}
