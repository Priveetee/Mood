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
  setSelectedCampaignId: (id: number | "all") => void;
  selectedManager: string | "all";
  setSelectedManager: (manager: string | "all") => void;
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
    <div className="flex items-center justify-between gap-4 p-4 rounded-lg bg-slate-900 border border-slate-800">
      <div className="flex items-center gap-4">
        <Select
          value={selectedCampaignId.toString()}
          onValueChange={(value) =>
            setSelectedCampaignId(value === "all" ? "all" : parseInt(value, 10))
          }
        >
          <SelectTrigger className="w-[280px] h-11 bg-slate-800 border-slate-700 text-white">
            <SelectValue placeholder="Toutes les campagnes" />
          </SelectTrigger>
          <SelectContent className="bg-slate-900 border-slate-800 text-white">
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
          onValueChange={setSelectedManager}
          disabled={managers.length === 0}
        >
          <SelectTrigger className="w-[280px] h-11 bg-slate-800 border-slate-700 text-white">
            <SelectValue placeholder="Tous les managers" />
          </SelectTrigger>
          <SelectContent className="bg-slate-900 border-slate-800 text-white">
            <SelectItem value="all">Tous les managers</SelectItem>
            {managers.map((manager) => (
              <SelectItem key={manager} value={manager}>
                {manager}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Button
        variant="outline"
        className="h-11 gap-2 bg-slate-800 border-slate-700 text-white hover:bg-slate-700 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={onExport}
        disabled={isExportDisabled || totalVotes === 0}
      >
        <FileDown className="h-4 w-4" />
        Exporter (CSV)
      </Button>
    </div>
  );
}
