"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

export function useCampaignLinksController(campaignId: number) {
  const router = useRouter();

  const campaignQuery = trpc.campaign.list.useQuery(undefined, {
    staleTime: 45_000,
    gcTime: 600_000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
  const linksQuery = trpc.campaign.getLinks.useQuery(campaignId, {
    enabled: !Number.isNaN(campaignId),
    staleTime: 45_000,
    gcTime: 600_000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const copyToClipboard = (text: string, message: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        toast.success(message);
      })
      .catch(() => {
        toast.error("Impossible de copier dans le presse-papiers.");
      });
  };

  if (Number.isNaN(campaignId)) {
    router.replace("/admin/campaigns/active");
    return null;
  }

  if (linksQuery.isError) {
    toast.error(linksQuery.error.message);
    router.replace("/admin/campaigns/active");
    return null;
  }

  const campaignName =
    campaignQuery.data?.find((campaign) => campaign.id === campaignId)?.name || "Campagne";
  const generatedLinks =
    linksQuery.data?.map((link) => ({ managerName: link.managerName, url: link.url })) || [];

  return {
    campaignQuery,
    linksQuery,
    campaignName,
    generatedLinks,
    copyToClipboard,
  };
}
