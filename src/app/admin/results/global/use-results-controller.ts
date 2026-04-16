"use client";

import { keepPreviousData } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { useTheme } from "next-themes";
import * as React from "react";
import { toast } from "sonner";
import { useSilk } from "@/app/admin/silk-context";
import { exportToCSV } from "@/lib/export-csv";
import { trpc } from "@/lib/trpc";
import {
  type DatePreset,
  darkThemeColor,
  getDateRangeFromPreset,
  lightThemeColor,
} from "./constants";

type CampaignOption = { id: number; name: string };

export function useResultsController() {
  const searchParams = useSearchParams();
  const { setSilkColorAction } = useSilk();
  const { theme } = useTheme();

  const [mounted, setMounted] = React.useState(false);
  const [datePreset, setDatePreset] = React.useState<DatePreset>("year");
  const [dateRange, setDateRange] = React.useState<{ from?: Date; to?: Date } | undefined>(
    undefined,
  );
  const [selectedCampaignId, setSelectedCampaignId] = React.useState<number | "all">("all");
  const [selectedManager, setSelectedManager] = React.useState<string | "all">("all");

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
    { campaignId: selectedCampaignId },
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
    const campaignIdParam = searchParams.get("campaignId");
    const parsedCampaignId = campaignIdParam ? parseInt(campaignIdParam, 10) : undefined;
    setSelectedCampaignId(parsedCampaignId || "all");
    setDateRange(getDateRangeFromPreset("year"));
    setMounted(true);
  }, [searchParams]);

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
  }, [managerOptionsQuery.isError, managerOptionsQuery.error, managerOptionsQuery.isSuccess]);

  const campaignOptions = (campaignOptionsQuery.data || []) as CampaignOption[];

  function handleMoodHover(color: string) {
    if (resultsQuery.isFetching) {
      return;
    }
    setSilkColorAction(color);
  }

  function handleMoodLeave() {
    setSilkColorAction(defaultSilkColor);
  }

  function handleDatePresetChange(preset: DatePreset) {
    setDatePreset(preset);
    setDateRange(getDateRangeFromPreset(preset));
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
    campaignOptions,
    campaignOptionsQuery,
    managerOptionsQuery,
    resultsQuery,
    setSelectedCampaignId,
    setSelectedManager,
    handleDatePresetChange,
    handleExportCSV,
    handleMoodHover,
    handleMoodLeave,
  };
}
