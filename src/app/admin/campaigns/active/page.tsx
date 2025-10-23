"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { toast } from "sonner";

interface Campaign {
  id: number;
  name: string;
  managerCount: number;
  creationDate: string;
  progress: number;
  totalVotes: number;
}

export default function ActiveCampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchCampaigns() {
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
        toast.error(
          error.message || "Échec du chargement des campagnes actives.",
        );
      } finally {
        setIsLoading(false);
      }
    }
    fetchCampaigns();
  }, []);

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
        <header className="mb-10 max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold">Campagnes Actives</h1>
          <p className="text-slate-400 mt-2">
            Suivez la progression des sondages actuellement en cours.
          </p>
        </header>

        <main className="max-w-7xl mx-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-xl">
            {campaigns.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                Aucune campagne active pour le moment.
                <Link
                  href="/admin/campaigns/new"
                  className="text-white hover:underline ml-2"
                >
                  Créer une nouvelle campagne.
                </Link>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-800 hover:bg-transparent">
                    <TableHead className="text-white">
                      Nom de la campagne
                    </TableHead>
                    <TableHead className="text-white text-center">
                      Liens générés
                    </TableHead>
                    <TableHead className="text-white text-center">
                      Votes reçus
                    </TableHead>
                    <TableHead className="text-white">
                      Date de Création
                    </TableHead>
                    <TableHead className="text-white w-[250px]">
                      Progression
                    </TableHead>
                    <TableHead className="text-right text-white"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {campaigns.map((campaign) => (
                    <TableRow
                      key={campaign.id}
                      className="border-slate-800 hover:bg-slate-900/80"
                    >
                      <TableCell className="font-medium">
                        {campaign.name}
                      </TableCell>
                      <TableCell className="text-center">
                        {campaign.managerCount}
                      </TableCell>
                      <TableCell className="text-center">
                        {campaign.totalVotes}
                      </TableCell>
                      <TableCell>{campaign.creationDate}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Progress
                            value={campaign.progress}
                            className="bg-slate-700 h-2"
                          />
                          <span className="text-sm text-slate-400">
                            {campaign.progress}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Link
                          href={`/admin/results/global?campaignId=${campaign.id}`}
                        >
                          <Button variant="ghost" size="sm" className="gap-2">
                            Voir les résultats{" "}
                            <ArrowRight className="h-4 w-4" />
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </main>
      </motion.div>
    </div>
  );
}
