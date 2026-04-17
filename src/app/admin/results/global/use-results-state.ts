"use client";

import { useSearchParams } from "next/navigation";
import * as React from "react";
import { type DatePreset, getDateRangeFromPreset } from "./constants";

type SegmentType = "all" | "manager" | "service";

export function useResultsState() {
  const searchParams = useSearchParams();
  const [mounted, setMounted] = React.useState(false);
  const [datePreset, setDatePreset] = React.useState<DatePreset>("year");
  const [dateRange, setDateRange] = React.useState<{ from?: Date; to?: Date } | undefined>(
    undefined,
  );
  const [selectedCampaignId, setSelectedCampaignId] = React.useState<number | "all">("all");
  const [selectedManager, setSelectedManager] = React.useState<string | "all">("all");
  const [selectedSegmentType, setSelectedSegmentType] = React.useState<SegmentType>("all");

  React.useEffect(() => {
    const campaignIdParam = searchParams.get("campaignId");
    const parsedCampaignId = campaignIdParam ? parseInt(campaignIdParam, 10) : undefined;
    const segmentTypeParam = searchParams.get("segmentType");
    const segmentType =
      segmentTypeParam === "manager" || segmentTypeParam === "service" ? segmentTypeParam : "all";

    setSelectedCampaignId(parsedCampaignId || "all");
    setSelectedSegmentType(segmentType);
    setDateRange(getDateRangeFromPreset("year"));
    setMounted(true);
  }, [searchParams]);

  function handleDatePresetChange(preset: DatePreset) {
    setDatePreset(preset);
    setDateRange(getDateRangeFromPreset(preset));
  }

  return {
    mounted,
    datePreset,
    dateRange,
    selectedCampaignId,
    selectedManager,
    selectedSegmentType,
    setSelectedCampaignId,
    setSelectedManager,
    setSelectedSegmentType,
    setDateRange,
    handleDatePresetChange,
  };
}
