"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
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
} from "lucide-react";
import { toast } from "sonner";

interface Campaign {
  id: number;
  name: string;
  managerCount: number;
  creationDate: string;
  participationRate: number;
  totalVotes: number;
  archived?: boolean;
}

interface CampaignLink {
  id: string;
  managerName: string;
  url: string;
}

export default function ActiveCampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showArchived, setShowArchived] = useState(false);
  const [selectedCampaignId, setSelectedCampaignId] = useState<number | null>(
    null,
  );
  const [selectedCampaignName, setSelectedCampaignName] = useState("");
  const [campaignLinks, setCampaignLinks] = useState<CampaignLink[]>([]);
  const [isLinksDialogOpen, setIsLinksDialogOpen] = useState(false);
  const [isAddManagerOpen, setIsAddManagerOpen] = useState(false);
  const [newManagerName, setNewManagerName] = useState("");
  const [isAddingManager, setIsAddingManager] = useState(false);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  async function fetchCampaigns() {
    setIsLoading(true);
    try {
      const response = await fetch("/api/campaigns");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Erreur lors de la récupération des campagnes.",
        );
      }

      setCampaigns(data);
    } catch (error: any) {
      toast.error(error.message || "Échec du chargement des campagnes.");
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchCampaignLinks(campaignId: number) {
    try {
      const response = await fetch(`/api/campaigns/${campaignId}/links`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Erreur lors de la récupération des liens.",
        );
      }

      setCampaignLinks(data);
    } catch (error: any) {
      toast.error(error.message || "Échec du chargement des liens.");
    }
  }

  function openLinksDialog(campaign: Campaign) {
    setSelectedCampaignId(campaign.id);
    setSelectedCampaignName(campaign.name);
    fetchCampaignLinks(campaign.id);
    setIsLinksDialogOpen(true);
  }

  function openAddManagerDialog() {
    setNewManagerName("");
    setIsAddManagerOpen(true);
  }

  async function handleAddManager() {
    if (!newManagerName.trim() || !selectedCampaignId) return;

    setIsAddingManager(true);
    try {
      const response = await fetch(
        `/api/campaigns/${selectedCampaignId}/links`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ managerName: newManagerName.trim() }),
        },
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      toast.success(`Manager "${newManagerName}" ajouté !`);
      setIsAddManagerOpen(false);
      await fetchCampaigns();
      await fetchCampaignLinks(selectedCampaignId);
    } catch (error: any) {
      toast.error(error.message || "Échec de l'ajout du manager.");
    } finally {
      setIsAddingManager(false);
    }
  }

  async function handleArchive(campaignId: number, archive: boolean) {
    try {
      const response = await fetch(`/api/campaigns/${campaignId}/archive`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ archived: archive }),
      });
      if (!response.ok) throw new Error("Erreur lors de l'archivage.");
      toast.success(archive ? "Campagne archivée" : "Campagne restaurée");
      await fetchCampaigns();
    } catch (error: any) {
      toast.error(error.message || "Échec de l'opération.");
    }
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    toast.info("Lien copié !");
  }

  const displayedCampaigns = campaigns.filter((c) =>
    showArchived ? c.archived : !c.archived,
  );

  if (isLoading) {
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
                              Gérer les liens
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
          <DialogHeader>
            <DialogTitle className="text-white">
              Gérer les liens: {selectedCampaignName}
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              {campaignLinks.length} lien(s) généré(s)
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[400px] pr-4">
            <div className="space-y-3">
              {campaignLinks.map((link) => (
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

      <Dialog open={isAddManagerOpen} onOpenChange={setIsAddManagerOpen}>
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
                disabled={!newManagerName.trim() || isAddingManager}
              >
                {isAddingManager ? "Ajout..." : "Ajouter"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
