"use client";

import { Button } from "@/components/ui/button";

type Props = {
  isEnabled: boolean;
  isPending: boolean;
  onToggle: () => void;
};

export function PublicResultsPanel({ isEnabled, isPending, onToggle }: Props) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900 p-3 sm:p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-white">Lien public lecture seule</p>
          <p className="text-xs text-slate-400">
            Partage ce lien pour afficher uniquement les resultats publics.
          </p>
        </div>
        <Button
          variant="outline"
          className="h-10 gap-2 border-slate-700 bg-slate-900 text-white hover:bg-slate-800"
          disabled={isPending}
          onClick={onToggle}
        >
          {isEnabled ? "Retirer le lien public" : "Publier les resultats"}
        </Button>
      </div>
    </div>
  );
}
