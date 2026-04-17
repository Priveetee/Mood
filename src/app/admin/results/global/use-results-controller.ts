"use client";

import { keepPreviousData } from "@tanstack/react-query";
import { useTheme } from "next-themes";
import * as React from "react";
import { toast } from "sonner";
import { useSilk } from "@/app/admin/silk-context";
import { exportToCSV } from "@/lib/export-csv";
import { trpc } from "@/lib/trpc";
import { darkThemeColor, lightThemeColor } from "./constants";
import { type CampaignOption, usePublicResultsToggle } from "./use-public-results-toggle";
import { useResultsState } from "./use-results-state";

export function useResultsController() {
  const { setSilkColorAction } = useSilk();
  const { theme } = useTheme();

  const {
    mounted,
    datePreset,
    dateRange,
    selectedCampaignId,
    selectedManager,
    selectedSegmentType,
    setSelectedCampaignId,
    setSelectedManager,
    setSelectedSegmentType,
    handleDatePresetChange,
  } = useResultsState();
  const defaultSilkColor = React.useMemo(
    () => (theme === "light" ? lightThemeColor : darkThemeColor),
    [theme],
  );

  const campaignOptionsQuery = trpc.results.getCampaignOptions.useQuery(undefined, {
    staleTime: 45_000,
    gcTime: 600_000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    placeholderData: keepPreviousData,
  });
  const managerOptionsQuery = trpc.results.getManagerOptions.useQuery(
    { campaignId: selectedCampaignId, segmentType: selectedSegmentType },
    {
      enabled: mounted,
      staleTime: 45_000,
      gcTime: 600_000,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      placeholderData: keepPreviousData,
    },
  );

  const resultsQuery = trpc.results.getFilteredResults.useQuery(
    {
      campaignId: selectedCampaignId,
      managerName: selectedManager,
      segmentType: selectedSegmentType,
      dateRange: { from: dateRange?.from, to: dateRange?.to },
    },
    {
      enabled: mounted && dateRange !== undefined,
      staleTime: 20_000,
      gcTime: 600_000,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      placeholderData: keepPreviousData,
    },
  );

  React.useEffect(() => {
    return () => {
      setSilkColorAction(defaultSilkColor);
    };
  }, [defaultSilkColor, setSilkColorAction]);

  React.useEffect(() => {
    if (campaignOptionsQuery.isError) {
      toast.error(campaignOptionsQuery.error.message);
    }
  }, [campaignOptionsQuery.isError, campaignOptionsQuery.error]);

  React.useEffect(() => {
    if (managerOptionsQuery.isError) {
      toast.error(managerOptionsQuery.error.message);
    }
    if (managerOptionsQuery.isSuccess) {
      setSelectedManager("all");
    }
  }, [
    managerOptionsQuery.isError,
    managerOptionsQuery.error,
    managerOptionsQuery.isSuccess,
    setSelectedManager,
  ]);

  const campaignOptions = (campaignOptionsQuery.data || []) as CampaignOption[];
  const {
    selectedCampaign,
    canManagePublicResults,
    publicResultsMutation,
    handleTogglePublicResults,
  } = usePublicResultsToggle(campaignOptions, selectedCampaignId, campaignOptionsQuery.refetch);

  function handleMoodHover(color: string) {
    if (resultsQuery.isFetching) {
      return;
    }
    setSilkColorAction(color);
  }

  function handleMoodLeave() {
    setSilkColorAction(defaultSilkColor);
  }

  function handleExportCSV() {
    if (!resultsQuery.data || resultsQuery.data.totalVotes === 0) {
      toast.error("Aucune donnee a exporter");
      return;
    }
    const campaignName =
      selectedCampaignId === "all"
        ? "toutes-campagnes"
        : campaignOptions.find((campaign) => campaign.id === selectedCampaignId)?.name ||
          "campagne";
    try {
      exportToCSV(resultsQuery.data.allVotes, campaignName);
      toast.success("Export CSV reussi !");
    } catch {
      toast.error("Erreur lors de l'export");
    }
  }

  return {
    mounted,
    datePreset,
    selectedCampaignId,
    selectedManager,
    selectedSegmentType,
    selectedCampaign,
    canManagePublicResults,
    handleTogglePublicResults,
    publicResultsMutation,
    campaignOptions,
    campaignOptionsQuery,
    managerOptionsQuery,
    resultsQuery,
    setSelectedCampaignId,
    setSelectedManager,
    setSelectedSegmentType,
    handleDatePresetChange,
    handleExportCSV,
    handleMoodHover,
    handleMoodLeave,
  };
}
