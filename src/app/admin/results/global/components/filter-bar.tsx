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
    <div className="flex flex-col gap-3 rounded-lg border border-slate-800 bg-slate-900 p-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:p-4">
      <div className="grid w-full grid-cols-1 gap-3 sm:w-auto sm:grid-cols-2 sm:gap-4">
        <Select
          value={selectedCampaignId.toString()}
          onValueChange={(id) => setSelectedCampaignId(id === "all" ? "all" : parseInt(id, 10))}
        >
          <SelectTrigger className="h-11 w-full border-slate-700 bg-slate-800 text-white sm:w-[280px]">
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
          onValueChange={(manager) => setSelectedManager(manager)}
          disabled={managers.length === 0}
        >
          <SelectTrigger className="h-11 w-full border-slate-700 bg-slate-800 text-white sm:w-[280px]">
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
        className="h-11 w-full gap-2 border-slate-700 bg-slate-800 text-white hover:bg-slate-700 hover:text-white disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
        onClick={onExport}
        disabled={isExportDisabled || totalVotes === 0}
      >
        <FileDown className="h-4 w-4" />
        Exporter (CSV)
      </Button>
    </div>
  );
}
