"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

export function useNewCampaignController() {
  const router = useRouter();
  const [campaignType, setCampaignType] = useState<"MANAGER_LINKS" | "SERVICE_UNIQUE">(
    "MANAGER_LINKS",
  );
  const [campaignName, setCampaignName] = useState("");
  const [currentManager, setCurrentManager] = useState("");
  const [managers, setManagers] = useState<string[]>([]);
  const [currentService, setCurrentService] = useState("");
  const [services, setServices] = useState<string[]>([]);
  const [expiresAt, setExpiresAt] = useState<Date | undefined>();
  const [commentsRequired, setCommentsRequired] = useState(false);
  const [allowMultipleVotes, setAllowMultipleVotes] = useState(true);

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
      campaignType,
      managers,
      services,
      expiresAt,
      commentsRequired,
      allowMultipleVotes,
    });
  }

  function handleAddService() {
    if (!currentService.trim() || services.includes(currentService.trim())) {
      return;
    }
    setServices((prev) => [...prev, currentService.trim()]);
    setCurrentService("");
    toast.success(`Service "${currentService.trim()}" ajoute.`);
  }

  function handleRemoveService(serviceToRemove: string) {
    setServices((prev) => prev.filter((service) => service !== serviceToRemove));
    toast.error(`Service "${serviceToRemove}" supprime.`);
  }

  return {
    campaignType,
    setCampaignType,
    campaignName,
    setCampaignName,
    currentManager,
    setCurrentManager,
    managers,
    currentService,
    setCurrentService,
    services,
    expiresAt,
    setExpiresAt,
    commentsRequired,
    setCommentsRequired,
    allowMultipleVotes,
    setAllowMultipleVotes,
    createCampaign,
    handleAddManager,
    handleRemoveManager,
    handleAddService,
    handleRemoveService,
    handleGenerate,
  };
}
