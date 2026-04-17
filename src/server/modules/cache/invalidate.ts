import {
  campaignLinksKey,
  campaignListKey,
  filteredResultsPattern,
  pollInfoKey,
  publicServiceResultsPattern,
  resultCampaignOptionsKey,
  resultManagerOptionsPattern,
} from "./keys";
import { deleteCacheByPatterns, deleteCacheKeys } from "./store";

export async function invalidateCampaignCaches(userId: string, campaignId?: number) {
  const keys = [campaignListKey(userId), resultCampaignOptionsKey(userId)];
  const patterns = [resultManagerOptionsPattern(userId), filteredResultsPattern(userId)];

  if (campaignId !== undefined) {
    keys.push(campaignLinksKey(userId, campaignId));
    patterns.push(publicServiceResultsPattern(campaignId));
  }

  await Promise.all([deleteCacheKeys(keys), deleteCacheByPatterns(patterns)]);
}

export async function invalidateVoteCaches(userId: string, campaignId: number, pollToken: string) {
  await Promise.all([
    invalidateCampaignCaches(userId, campaignId),
    deleteCacheKeys([pollInfoKey(pollToken)]),
    deleteCacheByPatterns([publicServiceResultsPattern(campaignId)]),
  ]);
}
