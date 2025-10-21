"use client";

import Link from "next/link";
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

const mockActiveCampaigns = [
  {
    id: "cam_1",
    name: "Sondage T3 2025",
    managerCount: 32,
    creationDate: "15/09/2025",
    progress: 75,
  },
  {
    id: "cam_3",
    name: "Pulse Check H1 2026",
    managerCount: 35,
    creationDate: "02/01/2026",
    progress: 22,
  },
  {
    id: "cam_4",
    name: "Feedback Projet Phoenix",
    managerCount: 12,
    creationDate: "18/10/2025",
    progress: 91,
  },
];

export default function ActiveCampaignsPage() {
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
            <Table>
              <TableHeader>
                <TableRow className="border-slate-800 hover:bg-transparent">
                  <TableHead className="text-white">
                    Nom de la campagne
                  </TableHead>
                  <TableHead className="text-white text-center">
                    Managers
                  </TableHead>
                  <TableHead className="text-white">Date de Création</TableHead>
                  <TableHead className="text-white w-[250px]">
                    Progression
                  </TableHead>
                  <TableHead className="text-right text-white"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockActiveCampaigns.map((campaign) => (
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
                      <Button variant="ghost" size="sm" className="gap-2">
                        Voir les résultats <ArrowRight className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </main>
      </motion.div>
    </div>
  );
}
