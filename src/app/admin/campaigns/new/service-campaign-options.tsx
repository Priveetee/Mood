"use client";

import { Switch } from "@/components/ui/switch";

type Props = {
  allowMultipleVotes: boolean;
  setAllowMultipleVotes: (value: boolean) => void;
};

export function ServiceCampaignOptions({ allowMultipleVotes, setAllowMultipleVotes }: Props) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/60 px-4 py-3">
      <div className="flex flex-col">
        <span className="text-sm font-medium text-slate-200">Votes multiples</span>
        <span className="text-xs text-slate-400">
          L&apos;admin choisit si un navigateur peut voter plusieurs fois.
        </span>
      </div>
      <Switch checked={allowMultipleVotes} onCheckedChange={setAllowMultipleVotes} />
    </div>
  );
}
