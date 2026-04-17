export type ActiveCampaign = {
  id: number;
  name: string;
  segmentCount: number;
  campaignType: "MANAGER_LINKS" | "SERVICE_UNIQUE";
  creationDate: string;
  participationRate: number;
  totalVotes: number;
  archived?: boolean;
  allowMultipleVotes: boolean;
  publicResultsEnabled: boolean;
};

export type CampaignLink = {
  id: string;
  label: string;
  kind: "manager" | "service-vote" | "service-public";
  url: string;
};
