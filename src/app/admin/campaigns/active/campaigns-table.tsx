"use client";

import { Archive, ArchiveRestore, ArrowRight, ChevronDown, Edit, Link2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ActiveCampaign } from "./types";

type Props = {
  campaigns: ActiveCampaign[];
  showArchived: boolean;
  onManage: (campaign: ActiveCampaign) => void;
  onArchiveToggle: (campaignId: number, archive: boolean) => void;
};

export function CampaignsTable({ campaigns, showArchived, onManage, onArchiveToggle }: Props) {
  return (
    <Table>
      <TableHeader>
        <TableRow className="border-slate-800 hover:bg-transparent">
          <TableHead className="text-white">Nom</TableHead>
          <TableHead className="text-center text-white">Type</TableHead>
          <TableHead className="text-center text-white">Segments</TableHead>
          <TableHead className="text-center text-white">Votes</TableHead>
          <TableHead className="text-white">Date</TableHead>
          <TableHead className="w-[200px] text-white">Participation</TableHead>
          <TableHead className="text-right text-white">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {campaigns.map((campaign) => (
          <TableRow key={campaign.id} className="border-slate-800 hover:bg-slate-900/80">
            <TableCell className="font-medium text-slate-200">{campaign.name}</TableCell>
            <TableCell className="text-center">
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ${
                  campaign.campaignType === "SERVICE_UNIQUE"
                    ? "bg-sky-900/60 text-sky-300"
                    : "bg-emerald-900/60 text-emerald-300"
                }`}
              >
                <Link2 className="h-3 w-3" />
                {campaign.campaignType === "SERVICE_UNIQUE" ? "Service" : "Manager"}
              </span>
            </TableCell>
            <TableCell className="text-center text-slate-300">{campaign.segmentCount}</TableCell>
            <TableCell className="text-center text-slate-300">{campaign.totalVotes}</TableCell>
            <TableCell className="text-slate-300">{campaign.creationDate}</TableCell>
            <TableCell>
              <div className="flex items-center gap-3">
                <Progress value={campaign.participationRate} className="h-2 bg-slate-700" />
                <span className="text-sm text-slate-400">{campaign.participationRate}%</span>
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
                  className="border-slate-800 bg-slate-900 text-slate-200"
                >
                  <DropdownMenuItem onClick={() => onManage(campaign)} className="cursor-pointer">
                    <Edit className="mr-2 h-4 w-4" />
                    Gerer la campagne
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onArchiveToggle(campaign.id, !showArchived)}
                    className="cursor-pointer"
                  >
                    {showArchived ? (
                      <ArchiveRestore className="mr-2 h-4 w-4" />
                    ) : (
                      <Archive className="mr-2 h-4 w-4" />
                    )}
                    <span>{showArchived ? "Restaurer" : "Archiver"}</span>
                  </DropdownMenuItem>
                  <Link href={`/admin/results/global?campaignId=${campaign.id}`}>
                    <DropdownMenuItem className="cursor-pointer">
                      <ArrowRight className="mr-2 h-4 w-4" />
                      Voir les resultats
                    </DropdownMenuItem>
                  </Link>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
