"use client";

import { FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FilterBarProps {
  selectedCampaignId: number | "all";
  setSelectedCampaignId: (_id: number | "all") => void;
  selectedManager: string | "all";
  setSelectedManager: (_manager: string | "all") => void;
  campaigns: Array<{ id: number; name: string }>;
  managers: string[];
  onExport: () => void;
  isExportDisabled: boolean;
  totalVotes: number;
}

export function FilterBar({
  selectedCampaignId,
  setSelectedCampaignId,
  selectedManager,
  setSelectedManager,
  campaigns,
  managers,
  onExport,
  isExportDisabled,
  totalVotes,
}: FilterBarProps) {
  return (
    <div className="flex items-center justy-between gap-4 rounded-lg border border-slate-800 bg-slate-900 p-4">
      <div className="flex items-center gap-4">
        <Select
          value={selectedCampaignId.toString()}
          onValueChange={(id) =>
            setSelectedCampaignId(id === "all" ? "all" : parseInt(id, 10))
          }
        >
          <SelectTrigger className="h-11 w-[280px] border-slate-700 bg-slate-800 text-white">
            <SelectValue placeholder="Toutes les campagnes" />
          </SelectTrigger>
          <SelectContent className="border-slate-800 bg-slate-900 text-white">
            <SelectItem value="all">Toutes les campagnes</SelectItem>
            {campaigns.map((campaign) => (
              <SelectItem key={campaign.id} value={campaign.id.toString()}>
                {campaign.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={selectedManager.toString()}
          onValueChange={(manager) =>
            setSelectedManager(manager as string | "all")
          }
          disabled={managers.length === 0}
        >
          <SelectTrigger className="h-11 w-[280px] border-slate-700 bg-slate-800 text-white">
            <SelectValue placeholder="Tous les managers" />
          </SelectTrigger>
          <SelectContent className="border-slate-800 bg-slate-900 text-white">
            <SelectItem value="all">Tous les managers</SelectItem>
            {managers.map((managerItem) => (
              <SelectItem key={managerItem} value={managerItem}>
                {managerItem}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Button
        variant="outline"
        className="h-11 gap-2 border-slate-700 bg-slate-800 text-white hover:bg-slate-700 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
        onClick={onExport}
        disabled={isExportDisabled || totalVotes === 0}
      >
        <FileDown className="h-4 w-4" />
        Exporter (CSV)
      </Button>
    </div>
  );
}
