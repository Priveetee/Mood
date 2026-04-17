"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { PerfMotion } from "@/lib/perf/perf-motion";
import { CommentsList } from "./components/comments-list";
import { DatePresetBar } from "./components/date-preset-bar";
import { FilterBar } from "./components/filter-bar";
import { MoodChart } from "./components/mood-chart";
import { PublicResultsPanel } from "./components/public-results-panel";
import { StatsCards } from "./components/stats-cards";
import { useResultsController } from "./use-results-controller";

export default function GlobalResultsClient() {
  const controller = useResultsController();

  if (!controller.mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center p-8">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col justify-center p-4 pt-24 sm:p-6 sm:pt-28 lg:p-8 lg:pt-28">
      <Link
        href="/admin"
        className="mb-8 flex w-fit items-center gap-2 text-slate-400 transition-colors hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour au Dashboard
      </Link>
      <PerfMotion
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <header className="mx-auto mb-10 max-w-7xl">
          <h1 className="text-3xl font-bold sm:text-4xl">Resultats Globaux</h1>
          <p className="mt-2 text-slate-400">
            Analysez et filtrez les resultats de toutes les campagnes.
          </p>
        </header>

        <main className="mx-auto max-w-7xl">
          <div className="mb-8 space-y-4">
            <FilterBar
              selectedCampaignId={controller.selectedCampaignId}
              setSelectedCampaignId={controller.setSelectedCampaignId}
              selectedSegmentType={controller.selectedSegmentType}
              setSelectedSegmentType={controller.setSelectedSegmentType}
              selectedManager={controller.selectedManager}
              setSelectedManager={controller.setSelectedManager}
              campaigns={controller.campaignOptions}
              managers={controller.managerOptionsQuery.data || []}
              onExport={controller.handleExportCSV}
              isExportDisabled={controller.resultsQuery.isLoading || !controller.resultsQuery.data}
              totalVotes={controller.resultsQuery.data?.totalVotes || 0}
            />

            {controller.canManagePublicResults && (
              <PublicResultsPanel
                isEnabled={controller.selectedCampaign?.publicResultsEnabled ?? false}
                isPending={controller.publicResultsMutation.isPending}
                onToggle={controller.handleTogglePublicResults}
              />
            )}

            <DatePresetBar
              selectedPreset={controller.datePreset}
              onPresetChange={controller.handleDatePresetChange}
            />
          </div>

          {controller.resultsQuery.isLoading ? (
            <div className="flex min-h-[400px] items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-transparent" />
            </div>
          ) : !controller.resultsQuery.data ? (
            <div className="p-8 text-center text-slate-400">
              {controller.selectedCampaignId === "all"
                ? "Aucun resultat disponible pour toutes les campagnes."
                : "Aucun resultat disponible pour la selection."}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                <MoodChart
                  data={controller.resultsQuery.data.moodDistribution}
                  onMoodHover={controller.handleMoodHover}
                  onMoodLeave={controller.handleMoodLeave}
                />
                <CommentsList comments={controller.resultsQuery.data.comments} />
              </div>

              <StatsCards
                totalVotes={controller.resultsQuery.data.totalVotes}
                dominantMood={controller.resultsQuery.data.dominantMood}
                dominantMoodEmojiCode={controller.resultsQuery.data.dominantMoodEmojiCode}
                onDominantMoodHover={() => {
                  const dominantMoodData = controller.resultsQuery.data?.moodDistribution.find(
                    (mood) => mood.name === controller.resultsQuery.data?.dominantMood,
                  );
                  if (dominantMoodData) {
                    controller.handleMoodHover(dominantMoodData.fill);
                  }
                }}
                onDominantMoodLeave={controller.handleMoodLeave}
              />
            </>
          )}
        </main>
      </PerfMotion>
    </div>
  );
}
