"use client";

import * as React from "react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

export type CampaignOption = {
  id: number;
  name: string;
  campaignType: "MANAGER_LINKS" | "SERVICE_UNIQUE";
  publicResultsEnabled: boolean;
};

export function usePublicResultsToggle(
  campaignOptions: CampaignOption[],
  selectedCampaignId: number | "all",
  onRefreshCampaigns: () => Promise<unknown>,
) {
  const selectedCampaign = React.useMemo(
    () => campaignOptions.find((campaign) => campaign.id === selectedCampaignId),
    [campaignOptions, selectedCampaignId],
  );

  const mutation = trpc.campaign.setPublicResults.useMutation();

  const canManagePublicResults = React.useMemo(() => {
    if (!selectedCampaign || selectedCampaignId === "all") {
      return false;
    }
    return selectedCampaign.campaignType === "SERVICE_UNIQUE";
  }, [selectedCampaign, selectedCampaignId]);

  async function handleTogglePublicResults() {
    if (!selectedCampaign || selectedCampaignId === "all") {
      return;
    }

    try {
      const result = await mutation.mutateAsync({
        campaignId: selectedCampaign.id,
        enabled: !selectedCampaign.publicResultsEnabled,
      });

      if (result.enabled && result.link?.url) {
        toast.success("Lien public active", { description: result.link.url });
      } else {
        toast.success("Lien public desactive");
      }

      await onRefreshCampaigns();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Impossible de modifier la publication.",
      );
    }
  }

  return {
    selectedCampaign,
    canManagePublicResults,
    publicResultsMutation: mutation,
    handleTogglePublicResults,
  };
}
