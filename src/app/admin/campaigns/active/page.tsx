"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ArrowLeft,
  ArrowRight,
  Copy,
  Plus,
  Edit,
  Archive,
  ArchiveRestore,
  ChevronDown,
  Send,
} from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc/client";

interface Campaign {
  id: number;
  name: string;
  managerCount: number;
  creationDate: string;
  participationRate: number;
  totalVotes: number;
  archived?: boolean;
}

export default function ActiveCampaignsPage() {
  const [showArchived, setShowArchived] = useState(false);
  const [selectedCampaignId, setSelectedCampaignId] = useState<number | null>(
    null,
  );
  const [selectedCampaignName, setSelectedCampaignName] = useState("");
  const [isLinksDialogOpen, setIsLinksDialogOpen] = useState(false);
  const [isAddManagerOpen, setIsAddManagerOpen] = useState(false);
  const [newManagerName, setNewManagerName] = useState("");

  const utils = trpc.useUtils();

  const campaignsQuery = trpc.campaign.list.useQuery();

  useEffect(() => {
    if (campaignsQuery.isError) {
      toast.error(
        campaignsQuery.error.message || "Échec du chargement des campagnes.",
      );
    }
  }, [campaignsQuery.isError, campaignsQuery.error]);

  const campaignLinksQuery = trpc.campaign.getLinks.useQuery(
    selectedCampaignId!,
    {
      enabled: !!selectedCampaignId,
    },
  );

  useEffect(() => {
    if (campaignLinksQuery.isError) {
      toast.error(
        campaignLinksQuery.error.message || "Échec du chargement des liens.",
      );
    }
  }, [campaignLinksQuery.isError, campaignLinksQuery.error]);

  const addManagerMutation = trpc.campaign.addManager.useMutation({
    onSuccess: () => {
      toast.success(`Manager "${newManagerName}" ajouté !`);
      setNewManagerName("");
      setIsAddManagerOpen(false);
      utils.campaign.list.invalidate();
      utils.campaign.getLinks.invalidate(selectedCampaignId!);
    },
    onError: (error) => {
      toast.error(error.message || "Échec de l'ajout du manager.");
    },
  });

  const archiveMutation = trpc.campaign.setArchiveStatus.useMutation({
    onSuccess: (_, variables) => {
      toast.success(
        variables.archived ? "Campagne archivée" : "Campagne restaurée",
      );
      utils.campaign.list.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Échec de l'opération.");
    },
  });

  function openLinksDialog(campaign: Campaign) {
    setSelectedCampaignId(campaign.id);
    setSelectedCampaignName(campaign.name);
    setIsLinksDialogOpen(true);
  }

  function openAddManagerDialog() {
    setIsLinksDialogOpen(false);
    setIsAddManagerOpen(true);
  }

  function handleAddManager() {
    if (!newManagerName.trim() || !selectedCampaignId) return;
    addManagerMutation.mutate({
      campaignId: selectedCampaignId,
      managerName: newManagerName.trim(),
    });
  }

  function handleArchive(campaignId: number, archive: boolean) {
    archiveMutation.mutate({ campaignId, archived: archive });
  }

  function copyToClipboard(text: string) {
    if (!navigator.clipboard || !window.isSecureContext) {
      toast.error("Fonctionnalité non disponible.", {
        description:
          "La copie n'est supportée que sur localhost ou une connexion HTTPS.",
      });
      return;
    }

    navigator.clipboard.writeText(text).then(
      () => {
        toast.success("Lien copié !");
      },
      () => {
        toast.error("Échec de la copie.");
      },
    );
  }

  const handleCopyAll = () => {
    if (!campaignLinksQuery.data) return;
    const allLinks = campaignLinksQuery.data
      .map((link) => `${link.managerName}: ${link.url}`)
      .join("\n");
    copyToClipboard(allLinks);
  };

  const handleSendEmail = () => {
    if (!campaignLinksQuery.data) return;
    const allLinks = campaignLinksQuery.data
      .map((link) => `${link.managerName}: ${link.url}`)
      .join("\n");
    const subject = `Liens pour la campagne de sondage: ${selectedCampaignName}`;
    const body = `Bonjour,\n\nVoici les liens de sondage pour vos équipes respectives :\n\n${allLinks}\n\nCordialement.`;
    window.location.href = `mailto:?subject=${encodeURIComponent(
      subject,
    )}&body=${encodeURIComponent(body)}`;
    toast.info("Ouverture de votre client de messagerie...");
  };

  const displayedCampaigns =
    campaignsQuery.data?.filter((c) =>
      showArchived ? c.archived : !c.archived,
    ) ?? [];

  if (campaignsQuery.isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
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
        <header className="mb-10 max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white">
              Gestion des Campagnes
            </h1>
            <p className="text-slate-400 mt-2">
              Suivez et gérez vos campagnes de sondage.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Label htmlFor="archived-switch" className="text-slate-300">
              Afficher les archivées
            </Label>
            <Switch
              id="archived-switch"
              checked={showArchived}
              onCheckedChange={setShowArchived}
            />
          </div>
        </header>

        <main className="max-w-7xl mx-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-xl">
            {displayedCampaigns.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                {showArchived ? (
                  "Aucune campagne archivée."
                ) : (
                  <>
                    Aucune campagne active.{" "}
                    <Link
                      href="/admin/campaigns/new"
                      className="text-white hover:underline font-semibold"
                    >
                      Créez-en une !
                    </Link>
                  </>
                )}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-800 hover:bg-transparent">
                    <TableHead className="text-white">Nom</TableHead>
                    <TableHead className="text-white text-center">
                      Liens
                    </TableHead>
                    <TableHead className="text-white text-center">
                      Votes
                    </TableHead>
                    <TableHead className="text-white">Date</TableHead>
                    <TableHead className="text-white w-[200px]">
                      Participation
                    </TableHead>
                    <TableHead className="text-right text-white">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayedCampaigns.map((campaign) => (
                    <TableRow
                      key={campaign.id}
                      className="border-slate-800 hover:bg-slate-900/80"
                    >
                      <TableCell className="font-medium text-slate-200">
                        {campaign.name}
                      </TableCell>
                      <TableCell className="text-center text-slate-300">
                        {campaign.managerCount}
                      </TableCell>
                      <TableCell className="text-center text-slate-300">
                        {campaign.totalVotes}
                      </TableCell>
                      <TableCell className="text-slate-300">
                        {campaign.creationDate}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Progress
                            value={campaign.participationRate}
                            className="bg-slate-700 h-2"
                          />
                          <span className="text-sm text-slate-400">
                            {campaign.participationRate}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              className="h-8 gap-2 text-xs text-slate-200 hover:bg-slate-800 hover:text-white"
                            >
                              <span>Actions</span>
                              <ChevronDown className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="bg-slate-900 border-slate-800 text-slate-200"
                          >
                            <DropdownMenuItem
                              onClick={() => openLinksDialog(campaign)}
                              className="cursor-pointer"
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Gérer la campagne
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                handleArchive(campaign.id, !showArchived)
                              }
                              className="cursor-pointer"
                            >
                              {showArchived ? (
                                <ArchiveRestore className="mr-2 h-4 w-4" />
                              ) : (
                                <Archive className="mr-2 h-4 w-4" />
                              )}
                              <span>
                                {showArchived ? "Restaurer" : "Archiver"}
                              </span>
                            </DropdownMenuItem>
                            <Link
                              href={`/admin/results/global?campaignId=${campaign.id}`}
                            >
                              <DropdownMenuItem className="cursor-pointer">
                                <ArrowRight className="mr-2 h-4 w-4" />
                                Voir les résultats
                              </DropdownMenuItem>
                            </Link>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </main>
      </motion.div>

      <Dialog open={isLinksDialogOpen} onOpenChange={setIsLinksDialogOpen}>
        <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-2xl">
          <DialogHeader className="flex-row items-center justify-between pr-6">
            <div className="space-y-1">
              <DialogTitle className="text-white">
                Gérer la campagne: {selectedCampaignName}
              </DialogTitle>
              <DialogDescription className="text-slate-400">
                {campaignLinksQuery.data?.length ?? 0} lien(s) généré(s)
              </DialogDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="gap-2 border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white"
                onClick={handleCopyAll}
              >
                <Copy className="h-4 w-4" />
                Tout copier
              </Button>
              <Button
                variant="outline"
                className="gap-2 border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white"
                onClick={handleSendEmail}
              >
                <Send className="h-4 w-4" />
                Envoyer par mail
              </Button>
            </div>
          </DialogHeader>
          <ScrollArea className="max-h-[400px] pr-4">
            <div className="space-y-3">
              {campaignLinksQuery.isLoading && <p>Chargement...</p>}
              {campaignLinksQuery.data?.map((link) => (
                <div
                  key={link.id}
                  className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-800/50 p-3"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-200">
                      {link.managerName}
                    </p>
                    <p className="text-xs text-slate-400 truncate">
                      {link.url}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(link.url)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </ScrollArea>
          <div className="flex justify-end mt-4">
            <Button className="gap-2" onClick={openAddManagerDialog}>
              <Plus className="h-4 w-4" />
              Ajouter un manager
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isAddManagerOpen}
        onOpenChange={(open) => {
          setIsAddManagerOpen(open);
          if (!open) setIsLinksDialogOpen(true);
        }}
      >
        <DialogContent className="bg-slate-900 border-slate-800 text-white">
          <DialogHeader>
            <DialogTitle className="text-white">
              Ajouter un manager à {selectedCampaignName}
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Un nouveau lien sera généré.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Input
              value={newManagerName}
              onChange={(e) => setNewManagerName(e.target.value)}
              placeholder="Nom du manager"
              className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
              onKeyDown={(e) => e.key === "Enter" && handleAddManager()}
            />
            <div className="flex justify-end">
              <Button
                onClick={handleAddManager}
                disabled={
                  !newManagerName.trim() || addManagerMutation.isPending
                }
              >
                {addManagerMutation.isPending ? "Ajout..." : "Ajouter"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
