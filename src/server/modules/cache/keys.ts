const CACHE_PREFIX = "mood";

export const CACHE_TTL = {
  pollInfoSeconds: 180,
  campaignListSeconds: 45,
  campaignLinksSeconds: 45,
  resultOptionsSeconds: 45,
  filteredResultsSeconds: 20,
  publicResultsSeconds: 3,
} as const;

function composeKey(scope: string, parts: Array<string | number>) {
  return [CACHE_PREFIX, scope, ...parts.map((part) => String(part))].join(":");
}

function composePattern(scope: string, parts: Array<string | number>) {
  return `${composeKey(scope, parts)}:*`;
}

export function pollInfoKey(token: string) {
  return composeKey("poll:info", [token]);
}

export function campaignListKey(userId: string) {
  return composeKey("campaign:list", [userId]);
}

export function campaignLinksKey(userId: string, campaignId: number) {
  return composeKey("campaign:links", [userId, campaignId]);
}

export function resultCampaignOptionsKey(userId: string) {
  return composeKey("results:campaign-options", [userId]);
}

export function resultManagerOptionsKey(userId: string, campaignId: number | string | "all") {
  return composeKey("results:manager-options", [userId, campaignId]);
}

export function resultManagerOptionsPattern(userId: string) {
  return composePattern("results:manager-options", [userId]);
}

export function filteredResultsKey(
  userId: string,
  campaignId: number | "all",
  managerName: string | "all",
  from?: Date,
  to?: Date,
) {
  return composeKey("results:filtered", [
    userId,
    campaignId,
    managerName,
    from ? from.toISOString() : "none",
    to ? to.toISOString() : "none",
  ]);
}

export function filteredResultsPattern(userId: string) {
  return composePattern("results:filtered", [userId]);
}

export function publicServiceResultsKey(campaignId: number, token: string) {
  return composeKey("service:public-results", [campaignId, token]);
}

export function publicServiceResultsPattern(campaignId: number) {
  return composePattern("service:public-results", [campaignId]);
}
