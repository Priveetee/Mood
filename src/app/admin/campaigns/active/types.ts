export type ActiveCampaign = {
  id: number;
  name: string;
  managerCount: number;
  creationDate: string;
  participationRate: number;
  totalVotes: number;
  archived?: boolean;
};

export type CampaignLink = {
  id: string;
  managerName: string;
  url: string;
};
