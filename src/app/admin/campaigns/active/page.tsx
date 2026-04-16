"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { PerfMotion } from "@/lib/perf/perf-motion";
import { AddManagerDialog } from "./add-manager-dialog";
import { CampaignLinksDialog } from "./campaign-links-dialog";
import { CampaignsTable } from "./campaigns-table";
import { useCampaignsController } from "./use-campaigns-controller";
import { copyToClipboard, sendLinksByEmail, toLinksText } from "./utils";

export default function ActiveCampaignsPage() {
  const controller = useCampaignsController();

  if (controller.campaignsQuery.isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col justify-start p-4 pt-6 sm:p-6 sm:pt-10 lg:p-8 lg:pt-12">
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
        <header className="mx-auto mb-10 flex max-w-7xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white sm:text-4xl">Gestion des Campagnes</h1>
            <p className="mt-2 text-slate-400">Suivez et gerez vos campagnes de sondage.</p>
          </div>
          <div className="flex items-center gap-3">
            <Label htmlFor="archived-switch" className="text-slate-300">
              Afficher les archivees
            </Label>
            <Switch
              id="archived-switch"
              checked={controller.showArchived}
              onCheckedChange={controller.setShowArchived}
            />
          </div>
        </header>

        <main className="mx-auto max-w-7xl">
          <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900">
            {controller.displayedCampaigns.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                {controller.showArchived ? (
                  "Aucune campagne archivee."
                ) : (
                  <>
                    Aucune campagne active.{" "}
                    <Link
                      href="/admin/campaigns/new"
                      className="font-semibold text-white hover:underline"
                    >
                      Creez-en une !
                    </Link>
                  </>
                )}
              </div>
            ) : (
              <CampaignsTable
                campaigns={controller.displayedCampaigns}
                showArchived={controller.showArchived}
                onManage={controller.openLinksDialog}
                onArchiveToggle={controller.handleArchive}
              />
            )}
          </div>
        </main>
      </PerfMotion>

      <CampaignLinksDialog
        open={controller.isLinksDialogOpen}
        onOpenChange={controller.setIsLinksDialogOpen}
        campaignName={controller.selectedCampaignName}
        links={controller.linksQuery.data ?? []}
        isLoading={controller.linksQuery.isLoading}
        onCopyLink={copyToClipboard}
        onCopyAll={() => {
          if (!controller.linksQuery.data) {
            return;
          }
          copyToClipboard(toLinksText(controller.linksQuery.data));
        }}
        onSendEmail={() => {
          if (!controller.linksQuery.data) {
            return;
          }
          sendLinksByEmail(controller.linksQuery.data, controller.selectedCampaignName);
        }}
        onOpenAddManager={controller.openAddManagerDialog}
      />

      <AddManagerDialog
        open={controller.isAddManagerOpen}
        campaignName={controller.selectedCampaignName}
        managerName={controller.newManagerName}
        isPending={controller.addManagerMutation.isPending}
        onManagerNameChange={controller.setNewManagerName}
        onSubmit={controller.handleAddManager}
        onOpenChange={(open) => {
          controller.setIsAddManagerOpen(open);
          if (!open) {
            controller.setIsLinksDialogOpen(true);
          }
        }}
      />
    </div>
  );
}
