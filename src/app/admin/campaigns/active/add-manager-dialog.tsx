"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

type Props = {
  open: boolean;
  campaignName: string;
  managerName: string;
  isPending: boolean;
  targetLabel: "manager" | "service";
  onManagerNameChange: (value: string) => void;
  onSubmit: () => void;
  onOpenChange: (open: boolean) => void;
};

export function AddManagerDialog({
  open,
  campaignName,
  managerName,
  isPending,
  targetLabel,
  onManagerNameChange,
  onSubmit,
  onOpenChange,
}: Props) {
  const title = targetLabel === "manager" ? "Ajouter un manager" : "Ajouter un service";
  const placeholder = targetLabel === "manager" ? "Nom du manager" : "Nom du service";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-slate-800 bg-slate-900 text-white">
        <DialogHeader>
          <DialogTitle className="text-white">
            {title} a {campaignName}
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Un nouveau lien sera genere.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <Input
            value={managerName}
            onChange={(e) => onManagerNameChange(e.target.value)}
            placeholder={placeholder}
            className="border-slate-700 bg-slate-800 text-white placeholder:text-slate-500"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                onSubmit();
              }
            }}
          />
          <div className="flex justify-end">
            <Button onClick={onSubmit} disabled={!managerName.trim() || isPending}>
              {isPending ? "Ajout..." : title}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
