"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { trpc } from "@/lib/trpc/client";
import { useTheme } from "next-themes";
import { useSilk } from "@/app/admin/SilkContext";
import { exportToCSV } from "@/lib/export-csv";
import { FilterBar } from "./components/FilterBar";
import { DatePresetBar, DatePreset } from "./components/DatePresetBar";
import { MoodChart } from "./components/MoodChart";
import { CommentsList } from "./components/CommentsList";
import { StatsCards } from "./components/StatsCards";

const lightThemeColor = "#1a55e0";
const darkThemeColor = "#29204b";

const getDateRangeFromPreset = (preset: DatePreset) => {
  const now = new Date();
  const from = new Date();

  switch (preset) {
    case "7d":
      from.setDate(now.getDate() - 7);
      return { from, to: now };
    case "30d":
      from.setDate(now.getDate() - 30);
      return { from, to: now };
    case "3m":
      from.setMonth(now.getMonth() - 3);
      return { from, to: now };
    case "year":
      from.setMonth(0);
      from.setDate(1);
      return { from, to: now };
    case "all":
      return { from: new Date(2020, 0, 1), to: now };
    default:
      return { from: new Date(now.getFullYear(), 0, 1), to: now };
  }
};

export default function GlobalResultsClient() {
  const searchParams = useSearchParams();
  const { setSilkColor } = useSilk();
  const { theme } = useTheme();

  const [mounted, setMounted] = React.useState(false);
  const [datePreset, setDatePreset] = React.useState<DatePreset>("year");
  const [dateRange, setDateRange] = React.useState<
    { from?: Date; to?: Date } | undefined
  >(undefined);
  const [selectedCampaignId, setSelectedCampaignId] = React.useState<
    number | "all"
  >("all");
  const [selectedManager, setSelectedManager] = React.useState<string | "all">(
    "all",
  );

  const defaultSilkColor = React.useMemo(() => {
    return theme === "light" ? lightThemeColor : darkThemeColor;
  }, [theme]);

  const handleMoodHover = (color: string) => {
    setSilkColor(color);
  };

  const handleMoodLeave = () => {
    setSilkColor(defaultSilkColor);
  };

  React.useEffect(() => {
    return () => {
      setSilkColor(defaultSilkColor);
    };
  }, [defaultSilkColor, setSilkColor]);

  React.useEffect(() => {
    const campaignIdParam = searchParams.get("campaignId");
    const parsedCampaignId = campaignIdParam
      ? parseInt(campaignIdParam, 10)
      : undefined;

    setSelectedCampaignId(parsedCampaignId || "all");
    setDateRange(getDateRangeFromPreset("year"));
    setMounted(true);
  }, [searchParams]);

  const handleDatePresetChange = (preset: DatePreset) => {
    setDatePreset(preset);
    setDateRange(getDateRangeFromPreset(preset));
  };

  const campaignOptionsQuery = trpc.results.getCampaignOptions.useQuery();

  React.useEffect(() => {
    if (campaignOptionsQuery.isError) {
      toast.error(campaignOptionsQuery.error.message);
    }
  }, [campaignOptionsQuery.isError, campaignOptionsQuery.error]);

  const managerOptionsQuery = trpc.results.getManagerOptions.useQuery(
    { campaignId: selectedCampaignId },
    {
      enabled: mounted,
    },
  );

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
  ]);

  const resultsQuery = trpc.results.getFilteredResults.useQuery(
    {
      campaignId: selectedCampaignId,
      managerName: selectedManager,
      dateRange: { from: dateRange?.from, to: dateRange?.to },
    },
    {
      enabled: mounted && dateRange !== undefined,
    },
  );

  const handleExportCSV = () => {
    if (!resultsQuery.data || resultsQuery.data.totalVotes === 0) {
      toast.error("Aucune donnée à exporter");
      return;
    }

    const campaignName =
      selectedCampaignId === "all"
        ? "toutes-campagnes"
        : campaignOptionsQuery.data?.find((c) => c.id === selectedCampaignId)
            ?.name || "campagne";

    try {
      exportToCSV(resultsQuery.data.allVotes, campaignName);
      toast.success("Export CSV réussi !");
    } catch {
      toast.error("Erreur lors de l'export");
    }
  };

  if (!mounted) {
    return (
      <div className="p-8 flex min-h-screen items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <Link
        href="/admin"
        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8 w-fit"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour au Dashboard
      </Link>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <header className="mb-10 max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold">Résultats Globaux</h1>
          <p className="text-slate-400 mt-2">
            Analysez et filtrez les résultats de toutes les campagnes.
          </p>
        </header>

        <main className="max-w-7xl mx-auto">
          <div className="space-y-4 mb-8">
            <FilterBar
              selectedCampaignId={selectedCampaignId}
              setSelectedCampaignId={setSelectedCampaignId}
              selectedManager={selectedManager}
              setSelectedManager={setSelectedManager}
              campaigns={campaignOptionsQuery.data || []}
              managers={managerOptionsQuery.data || []}
              onExport={handleExportCSV}
              isExportDisabled={resultsQuery.isLoading || !resultsQuery.data}
              totalVotes={resultsQuery.data?.totalVotes || 0}
            />

            <DatePresetBar
              selectedPreset={datePreset}
              onPresetChange={handleDatePresetChange}
            />
          </div>

          {resultsQuery.isLoading ? (
            <div className="flex min-h-[400px] items-center justify-center">
              <div className="w-8 h-8 border-4 border-slate-200 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : !resultsQuery.data ? (
            <div className="p-8 text-center text-slate-400">
              {selectedCampaignId === "all"
                ? "Aucun résultat disponible pour toutes les campagnes. Créez une campagne et recevez des votes."
                : "Aucun résultat disponible pour la sélection. Essayez d'ajuster les filtres."}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <MoodChart
                  data={resultsQuery.data.moodDistribution}
                  onMoodHover={handleMoodHover}
                  onMoodLeave={handleMoodLeave}
                />
                <CommentsList comments={resultsQuery.data.comments} />
              </div>

              <StatsCards
                totalVotes={resultsQuery.data.totalVotes}
                dominantMood={resultsQuery.data.dominantMood}
                dominantMoodEmoji={resultsQuery.data.dominantMoodEmoji}
                onDominantMoodHover={() => {
                  const dominantMoodData =
                    resultsQuery.data.moodDistribution.find(
                      (m) => m.name === resultsQuery.data.dominantMood,
                    );
                  if (dominantMoodData) handleMoodHover(dominantMoodData.fill);
                }}
                onDominantMoodLeave={handleMoodLeave}
              />
            </>
          )}
        </main>
      </motion.div>
    </div>
  );
}
