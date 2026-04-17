"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import type { ActiveCampaign } from "./types";

export function useCampaignsController() {
  const [showArchived, setShowArchived] = useState(false);
  const [selectedCampaignId, setSelectedCampaignId] = useState<number | null>(null);
  const [selectedCampaignName, setSelectedCampaignName] = useState("");
  const [selectedCampaignType, setSelectedCampaignType] = useState<
    "MANAGER_LINKS" | "SERVICE_UNIQUE"
  >("MANAGER_LINKS");
  const [newManagerName, setNewManagerName] = useState("");
  const [isLinksDialogOpen, setIsLinksDialogOpen] = useState(false);
  const [isAddManagerOpen, setIsAddManagerOpen] = useState(false);

  const utils = trpc.useUtils();
  const campaignsQuery = trpc.campaign.list.useQuery(undefined, {
    staleTime: 45_000,
    gcTime: 600_000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
  const linksQuery = trpc.campaign.getLinks.useQuery(selectedCampaignId ?? 0, {
    enabled: selectedCampaignId !== null,
    staleTime: 45_000,
    gcTime: 600_000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const addManagerMutation = trpc.campaign.addManager.useMutation({
    onSuccess: () => {
      toast.success(`Manager "${newManagerName}" ajoute !`);
      setNewManagerName("");
      setIsAddManagerOpen(false);
      void utils.campaign.list.invalidate();
      if (selectedCampaignId) {
        void utils.campaign.getLinks.invalidate(selectedCampaignId);
      }
    },
    onError: (error) => {
      toast.error(error.message || "Echec de l'ajout du manager.");
    },
  });

  const addServiceMutation = trpc.campaign.addService.useMutation({
    onSuccess: (_, variables) => {
      toast.success(`Service "${variables.serviceName}" ajoute !`);
      setNewManagerName("");
      setIsAddManagerOpen(false);
      void utils.campaign.list.invalidate();
      if (selectedCampaignId) {
        void utils.campaign.getLinks.invalidate(selectedCampaignId);
      }
    },
    onError: (error) => {
      toast.error(error.message || "Echec de l'ajout du service.");
    },
  });

  const archiveMutation = trpc.campaign.setArchiveStatus.useMutation({
    onSuccess: (_, variables) => {
      toast.success(variables.archived ? "Campagne archivee" : "Campagne restauree");
      void utils.campaign.list.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Echec de l'operation.");
    },
  });

  useEffect(() => {
    if (campaignsQuery.isError) {
      toast.error(campaignsQuery.error.message || "Echec du chargement des campagnes.");
    }
  }, [campaignsQuery.isError, campaignsQuery.error]);

  useEffect(() => {
    if (linksQuery.isError) {
      toast.error(linksQuery.error.message || "Echec du chargement des liens.");
    }
  }, [linksQuery.isError, linksQuery.error]);

  const displayedCampaigns = useMemo(
    () =>
      (campaignsQuery.data?.filter((c) => (showArchived ? c.archived : !c.archived)) ??
        []) as ActiveCampaign[],
    [campaignsQuery.data, showArchived],
  );

  function openLinksDialog(campaign: ActiveCampaign) {
    setSelectedCampaignId(campaign.id);
    setSelectedCampaignName(campaign.name);
    setSelectedCampaignType(campaign.campaignType);
    setIsLinksDialogOpen(true);
  }

  function openAddTargetDialog() {
    setIsLinksDialogOpen(false);
    setIsAddManagerOpen(true);
  }

  function handleAddTarget() {
    if (!newManagerName.trim() || !selectedCampaignId) {
      return;
    }

    if (selectedCampaignType === "MANAGER_LINKS") {
      addManagerMutation.mutate({
        campaignId: selectedCampaignId,
        managerName: newManagerName.trim(),
      });
      return;
    }

    addServiceMutation.mutate({
      campaignId: selectedCampaignId,
      serviceName: newManagerName.trim(),
    });
  }

  const isAddTargetPending = addManagerMutation.isPending || addServiceMutation.isPending;

  function handleArchive(campaignId: number, archive: boolean) {
    archiveMutation.mutate({ campaignId, archived: archive });
  }

  return {
    showArchived,
    setShowArchived,
    selectedCampaignName,
    selectedCampaignType,
    setSelectedCampaignName,
    selectedCampaignId,
    isLinksDialogOpen,
    setIsLinksDialogOpen,
    isAddManagerOpen,
    setIsAddManagerOpen,
    newManagerName,
    setNewManagerName,
    campaignsQuery,
    linksQuery,
    addManagerMutation,
    addServiceMutation,
    isAddTargetPending,
    displayedCampaigns,
    openLinksDialog,
    openAddTargetDialog,
    handleAddTarget,
    handleArchive,
  };
}
