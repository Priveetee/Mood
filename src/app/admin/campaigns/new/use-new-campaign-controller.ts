"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

export function useNewCampaignController() {
  const router = useRouter();
  const [campaignName, setCampaignName] = useState("");
  const [currentManager, setCurrentManager] = useState("");
  const [managers, setManagers] = useState<string[]>([]);
  const [expiresAt, setExpiresAt] = useState<Date | undefined>();
  const [commentsRequired, setCommentsRequired] = useState(false);

  const createCampaign = trpc.campaign.create.useMutation({
    onSuccess: (data) => {
      toast.success(
        `Campagne "${data.campaignName}" generee avec ${data.generatedLinks.length} liens.`,
      );
      router.push(`/admin/campaigns/${data.campaignId}/links`);
    },
    onError: (error) => {
      toast.error(error.message || "Echec de la creation de la campagne.");
    },
  });

  function handleAddManager() {
    if (!currentManager.trim() || managers.includes(currentManager.trim())) {
      return;
    }
    setManagers((prev) => [...prev, currentManager.trim()]);
    setCurrentManager("");
    toast.success(`Manager "${currentManager.trim()}" ajoute.`);
  }

  function handleRemoveManager(managerToRemove: string) {
    setManagers((prev) => prev.filter((manager) => manager !== managerToRemove));
    toast.error(`Manager "${managerToRemove}" supprime.`);
  }

  function handleGenerate() {
    createCampaign.mutate({
      name: campaignName,
      managers,
      expiresAt,
      commentsRequired,
    });
  }

  return {
    campaignName,
    setCampaignName,
    currentManager,
    setCurrentManager,
    managers,
    expiresAt,
    setExpiresAt,
    commentsRequired,
    setCommentsRequired,
    createCampaign,
    handleAddManager,
    handleRemoveManager,
    handleGenerate,
  };
}
